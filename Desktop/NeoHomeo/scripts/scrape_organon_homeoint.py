#!/usr/bin/env python3
"""
Scrape all 291 aphorisms (5th & 6th edition) from homeoint.org
http://www.homeoint.org/books/hahorgan/

Structure:
  <a name="P1">§ 1</a>       → same in both editions  → stored as hahnemann5 AND hahnemann6
  <a name="P6E5">§ 6</a>     → 5th edition only       → stored as hahnemann5
  <a name="P6E6">§ 6</a>     → 6th edition only       → stored as hahnemann6

Run:
  python3 scripts/scrape_organon_homeoint.py
"""

import os, re, sys, time, requests
from html.parser import HTMLParser

BASE = "http://www.homeoint.org/books/hahorgan/"
PAGES = [
    "organ001.htm","organ020.htm","organ040.htm","organ060.htm",
    "organ080.htm","organ100.htm","organ120.htm","organ140.htm",
    "organ160.htm","organ180.htm","organ200.htm","organ220.htm",
    "organ240.htm","organ260.htm","organ280.htm",
]

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://wbnenlhblopmamdhsnnv.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# ─── HTML → plain text ────────────────────────────────────────────────────────

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self._skip = False

    def handle_starttag(self, tag, attrs):
        if tag in ("script","style"):
            self._skip = True

    def handle_endtag(self, tag):
        if tag in ("script","style"):
            self._skip = False
        if tag in ("p","br","div","blockquote"):
            self.text.append("\n")

    def handle_data(self, data):
        if not self._skip:
            self.text.append(data)

    def get_text(self):
        return re.sub(r"\n{3,}", "\n\n", "".join(self.text)).strip()

def html_to_text(html: str) -> str:
    p = TextExtractor()
    p.feed(html)
    return p.get_text()

# ─── parse one page ───────────────────────────────────────────────────────────

def parse_page(html: str) -> list[dict]:
    """
    Returns list of dicts:
      { source_abbrev, aphorism_num, title, content, footnotes }
    """
    rows = []

    # Decode windows-1252 characters (§ = \xa7)
    html = html.replace("&nbsp;", " ").replace("&amp;", "&")

    # Find all anchor definitions: <a name="P1">, <a name="P6E5">, <a name="P6E6">
    # Split the HTML on these anchors
    # Pattern: <a name="P(\d+)(E5|E6)?">
    anchor_pattern = re.compile(
        r'<a\s+name=["\']P(\d+)(E5|E6)?["\']>',
        re.IGNORECASE
    )

    # Split into segments: (aphorism_num, edition, html_content)
    matches = list(anchor_pattern.finditer(html))

    for i, match in enumerate(matches):
        num_str = match.group(1)
        edition  = match.group(2)  # None, "E5", or "E6"
        num = int(num_str)

        # Content = everything from after this anchor until the next anchor
        start = match.end()
        end   = matches[i+1].start() if i+1 < len(matches) else len(html)
        chunk = html[start:end]

        # Convert to plain text
        text = html_to_text(chunk).strip()

        # Separate footnotes: lines that start with a digit followed by a space
        # (superscript footnote numbers come inline; footnotes follow as "1 text...")
        lines = text.splitlines()
        content_lines = []
        footnote_lines = []
        in_footnotes = False

        for line in lines:
            stripped = line.strip()
            if not stripped:
                if not in_footnotes:
                    content_lines.append("")
                continue
            # Footnote line: starts with a digit (possibly multiple digits) then space/text
            if re.match(r'^\d{1,2}\s+[A-Z]', stripped) and content_lines:
                in_footnotes = True
            if in_footnotes:
                footnote_lines.append(stripped)
            else:
                content_lines.append(stripped)

        content   = re.sub(r'\n{3,}', '\n\n', "\n".join(content_lines)).strip()
        footnotes = "\n".join(footnote_lines).strip() or None

        # Remove leading "§ N" from content if present
        content = re.sub(r'^[§\xa7]\s*\d+\s*\n?', '', content).strip()
        # Remove footnote superscripts inline (e.g. "health,1\n" → "health,\n")
        content = re.sub(r'(\w),?(\d{1,2})\n', r'\1\n', content)
        content = re.sub(r'(\w)\s(\d{1,2})\s*$', r'\1', content, flags=re.MULTILINE)

        if not content:
            continue

        if edition is None:
            # Same in both editions → create one row per edition
            for src in ("hahnemann5", "hahnemann6"):
                rows.append({
                    "source_abbrev": src,
                    "aphorism_num": num,
                    "title": f"§{num}",
                    "content": content,
                    "footnotes": footnotes,
                })
        elif edition == "E5":
            rows.append({
                "source_abbrev": "hahnemann5",
                "aphorism_num": num,
                "title": f"§{num} (5th Ed.)",
                "content": content,
                "footnotes": footnotes,
            })
        elif edition == "E6":
            rows.append({
                "source_abbrev": "hahnemann6",
                "aphorism_num": num,
                "title": f"§{num}",
                "content": content,
                "footnotes": footnotes,
            })

    return rows

# ─── upsert ───────────────────────────────────────────────────────────────────

def upsert_batch(table: str, rows: list[dict]):
    if not rows:
        return
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }
    for i in range(0, len(rows), 50):
        chunk = rows[i:i+50]
        r = requests.post(url, headers=headers, json=chunk)
        if r.status_code not in (200, 201):
            print(f"  ERR {r.status_code}: {r.text[:200]}")
        else:
            print(f"  ✓ {i+len(chunk)}/{len(rows)}")
        time.sleep(0.2)

# ─── main ─────────────────────────────────────────────────────────────────────

def main():
    if not SUPABASE_KEY:
        print("ERROR: Set SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)

    print("=== Scraping homeoint.org Organon (5th & 6th Ed.) ===\n")

    all_rows: list[dict] = []
    seen: set[tuple] = set()  # deduplicate (source, num)

    for page in PAGES:
        url = BASE + page
        print(f"Fetching {url} ...")
        r = requests.get(url, timeout=20, verify=False)
        r.encoding = "windows-1252"
        rows = parse_page(r.text)

        # Deduplicate: keep first occurrence per (source_abbrev, aphorism_num)
        for row in rows:
            key = (row["source_abbrev"], row["aphorism_num"])
            if key not in seen:
                seen.add(key)
                all_rows.append(row)

        print(f"  → {len(rows)} entries parsed (running total: {len(all_rows)})")
        time.sleep(0.3)

    # Count per source
    h5 = [r for r in all_rows if r["source_abbrev"] == "hahnemann5"]
    h6 = [r for r in all_rows if r["source_abbrev"] == "hahnemann6"]
    print(f"\nTotal: {len(all_rows)} rows")
    print(f"  hahnemann5 (5th Ed): {len(h5)} aphorisms")
    print(f"  hahnemann6 (6th Ed): {len(h6)} aphorisms")

    # First delete old PDF-extracted rows for these two sources, then insert fresh
    print("\nDeleting old PDF-extracted data for hahnemann5 & hahnemann6...")
    for src in ("hahnemann5", "hahnemann6"):
        del_url = f"{SUPABASE_URL}/rest/v1/organon_aphorisms?source_abbrev=eq.{src}"
        resp = requests.delete(del_url, headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Prefer": "return=minimal",
        })
        print(f"  Deleted {src}: {resp.status_code}")
        time.sleep(0.3)

    print("\nUpserting scraped data...")
    upsert_batch("organon_aphorisms", all_rows)

    print("\n✅ Done! Verify counts:")
    print(f"  5th Ed: {len(h5)} aphorisms (expect ~291)")
    print(f"  6th Ed: {len(h6)} aphorisms (expect ~291)")

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings()
    main()
