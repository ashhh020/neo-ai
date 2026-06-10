#!/usr/bin/env python3
"""
Parse Organon and Philosophy PDFs → upsert to Supabase.

Tables:
  organon_aphorisms  (source_abbrev, aphorism_num, title, content, footnotes)
  philosophy_chapters (book_abbrev, chapter_num, chapter_title, content)

Run:
  pip install pymupdf requests
  python3 scripts/parse_organon.py
"""

import os, re, sys, json, time, requests
import fitz  # pymupdf

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://wbnenlhblopmamdhsnnv.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

DOWNLOADS = "/Users/ashrafalamshaik/Downloads"

# ─── helpers ──────────────────────────────────────────────────────────────────

def pdf_text(path: str) -> str:
    doc = fitz.open(path)
    pages = []
    for page in doc:
        pages.append(page.get_text())
    return "\n".join(pages)

def clean(s: str) -> str:
    s = s.replace("\r", "").strip()
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s

def upsert_batch(table: str, rows: list[dict], conflict_cols: list[str]):
    if not rows:
        return
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": f"resolution=merge-duplicates",
    }
    # chunked
    for i in range(0, len(rows), 50):
        chunk = rows[i:i+50]
        r = requests.post(url, headers=headers, json=chunk)
        if r.status_code not in (200, 201):
            print(f"  ERR {r.status_code}: {r.text[:200]}")
        else:
            print(f"  ✓ upserted {len(chunk)} rows ({i+len(chunk)}/{len(rows)})")
        time.sleep(0.3)

# ─── 1. Hahnemann 6th edition ─────────────────────────────────────────────────

def parse_hahnemann6(path: str) -> list[dict]:
    """Parse 'Para - N' aphorism format from Hahnemann 6th Ed."""
    text = pdf_text(path)
    # Split on "Para - N" or "Para N" (may be on its own line)
    pattern = r'Para\s*[-–]?\s*(\d+)\s*\n'
    parts = re.split(pattern, text)
    rows = []

    # parts[0] = preamble, then (num, body) pairs
    if len(parts) < 3:
        print("  Warning: could not split by 'Para' – trying §N pattern")
        pattern2 = r'§\s*(\d+)[.\s]'
        parts = re.split(pattern2, text)

    # preamble as aphorism 0
    if parts[0].strip():
        rows.append({
            "source_abbrev": "hahnemann6",
            "aphorism_num": 0,
            "title": "Preface / Introduction",
            "content": clean(parts[0]),
            "footnotes": None,
        })

    i = 1
    while i + 1 < len(parts):
        num_str = parts[i].strip()
        body = parts[i+1]
        i += 2
        try:
            num = int(num_str)
        except ValueError:
            continue

        # Separate footnotes: lines starting with 'a.' 'b.' etc.
        fn_match = re.split(r'\n(?=[a-z]\.\s)', body, maxsplit=1)
        content = clean(fn_match[0])
        footnotes = clean(fn_match[1]) if len(fn_match) > 1 else None

        rows.append({
            "source_abbrev": "hahnemann6",
            "aphorism_num": num,
            "title": f"§{num}",
            "content": content,
            "footnotes": footnotes,
        })

    print(f"  Hahnemann 6th: {len(rows)} aphorisms")
    return rows

# ─── 2. Outline of Organon ─────────────────────────────────────────────────

def parse_outline(path: str) -> list[dict]:
    text = pdf_text(path)
    rows = []

    # Format: "N. Text" or "N-M. Text" or "N: text"
    # Gather all lines
    lines = text.splitlines()
    current_nums = []
    current_lines = []

    def flush():
        if not current_nums or not current_lines:
            return
        content = clean("\n".join(current_lines))
        for n in current_nums:
            rows.append({
                "source_abbrev": "outline",
                "aphorism_num": n,
                "title": f"§{n} (Outline)",
                "content": content,
                "footnotes": None,
            })

    for line in lines:
        # Match "14." or "14-16." or "14-16:" at line start
        m = re.match(r'^(\d+)(?:\s*[-–]\s*(\d+))?[.:]\s+(.*)', line.strip())
        if m:
            flush()
            start = int(m.group(1))
            end = int(m.group(2)) if m.group(2) else start
            current_nums = list(range(start, end + 1))
            current_lines = [m.group(3)]
        else:
            if current_nums and line.strip():
                current_lines.append(line.strip())
    flush()

    print(f"  Outline: {len(rows)} aphorism entries")
    return rows

# ─── 3. Kent's Lectures on Homeopathic Philosophy ─────────────────────────

def parse_kent_lectures(path: str) -> list[dict]:
    text = pdf_text(path)
    rows = []

    # Split by "LECTURE N :" or "LECTURE N:"
    pattern = r'LECTURE\s+(\d+)\s*[:\-–]\s*([^\n]+)\n'
    parts = re.split(pattern, text)

    i = 1
    while i + 2 < len(parts):
        lec_num = parts[i].strip()
        lec_title = parts[i+1].strip()
        body = parts[i+2]
        i += 3

        # Extract aphorism number from title if present: "Organon § 1" or "§ 1"
        aph_m = re.search(r'§\s*(\d+)', lec_title)
        aph_num = int(aph_m.group(1)) if aph_m else None

        rows.append({
            "source_abbrev": "kent_lectures",
            "aphorism_num": aph_num,
            "title": f"Lecture {lec_num}: {lec_title}",
            "content": clean(body),
            "footnotes": None,
        })

    print(f"  Kent Lectures: {len(rows)} lectures")
    return rows

# ─── 4. Roberts – Art of Cure ─────────────────────────────────────────────

def parse_roberts(path: str) -> list[dict]:
    text = pdf_text(path)
    rows = []

    # Split by "CHAPTER N\n" or "Chapter N\n"
    pattern = r'\n(?:CHAPTER|Chapter)\s+([IVXivxLCDM]+|\d+)\s*\n([^\n]+)\n'
    parts = re.split(pattern, text)

    ch_num = 0
    if parts[0].strip():
        rows.append({
            "book_abbrev": "roberts",
            "chapter_num": 0,
            "chapter_title": "Preface / Introduction",
            "content": clean(parts[0]),
        })

    i = 1
    while i + 2 < len(parts):
        num_raw = parts[i].strip()
        title = parts[i+1].strip()
        body = parts[i+2]
        i += 3
        ch_num += 1

        rows.append({
            "book_abbrev": "roberts",
            "chapter_num": ch_num,
            "chapter_title": title,
            "content": clean(body),
        })

    print(f"  Roberts: {len(rows)} chapters")
    return rows

# ─── 5. Stuart Close – Genius of Homeopathy ───────────────────────────────

def parse_close(path: str) -> list[dict]:
    text = pdf_text(path)
    rows = []

    # Pattern: "Chapter I\nThe Psychological Point of View"
    pattern = r'\n(?:Chapter|CHAPTER)\s+([IVXivx]+|\d+)\s*\n([^\n]+)\n'
    parts = re.split(pattern, text)

    if parts[0].strip():
        rows.append({
            "book_abbrev": "close",
            "chapter_num": 0,
            "chapter_title": "Preface",
            "content": clean(parts[0]),
        })

    roman_map = {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,
                 'IX':9,'X':10,'XI':11,'XII':12,'XIII':13,'XIV':14,'XV':15,
                 'XVI':16,'XVII':17}

    i = 1
    while i + 2 < len(parts):
        num_raw = parts[i].strip().upper()
        title = parts[i+1].strip()
        body = parts[i+2]
        i += 3

        ch_num = roman_map.get(num_raw) or (int(num_raw) if num_raw.isdigit() else 0)

        rows.append({
            "book_abbrev": "close",
            "chapter_num": ch_num,
            "chapter_title": title,
            "content": clean(body),
        })

    print(f"  Stuart Close: {len(rows)} chapters")
    return rows

# ─── 6. M.L. Dhawale ──────────────────────────────────────────────────────

def parse_dhawale(path: str) -> list[dict]:
    text = pdf_text(path)
    rows = []

    # Dhawale has chapters labeled differently, try "CHAPTER N" or numbered sections
    pattern = r'\n(Chapter|CHAPTER|SECTION)\s+(\d+|[IVX]+)[:\.\s]+([^\n]+)\n'
    parts = re.split(pattern, text)

    if parts[0].strip():
        rows.append({
            "book_abbrev": "dhawale",
            "chapter_num": 0,
            "chapter_title": "Introduction",
            "content": clean(parts[0]),
        })

    ch_num = 0
    i = 1
    while i + 3 < len(parts):
        _kind = parts[i]
        _num  = parts[i+1]
        title = parts[i+2].strip()
        body  = parts[i+3]
        i += 4
        ch_num += 1

        rows.append({
            "book_abbrev": "dhawale",
            "chapter_num": ch_num,
            "chapter_title": title,
            "content": clean(body),
        })

    # fallback if no chapters found
    if len(rows) <= 1:
        rows = [{
            "book_abbrev": "dhawale",
            "chapter_num": 1,
            "chapter_title": "Principles & Practice of Homoeopathy",
            "content": clean(text[:50000]),
        }]

    print(f"  Dhawale: {len(rows)} chapters")
    return rows

# ─── 7. A.K. Das (labeled as M.P. Arya in filename) ──────────────────────

def parse_das(path: str) -> list[dict]:
    """A Study of Hahnemann's Organon – aphorism commentary format."""
    text = pdf_text(path)
    rows = []

    # Try to split by "APHORISM N" or "Aphorism N" or "§ N"
    pattern = r'\n(?:APHORISM|Aphorism)\s+(\d+)\b'
    parts = re.split(pattern, text)

    if len(parts) < 3:
        # fallback: split by "§ N "
        pattern = r'\n§\s*(\d+)\b'
        parts = re.split(pattern, text)

    if len(parts) >= 3:
        if parts[0].strip():
            rows.append({
                "source_abbrev": "das",
                "aphorism_num": 0,
                "title": "Introduction",
                "content": clean(parts[0][:5000]),
                "footnotes": None,
            })
        i = 1
        while i + 1 < len(parts):
            num = int(parts[i]) if parts[i].strip().isdigit() else 0
            body = parts[i+1]
            i += 2
            if num > 0:
                rows.append({
                    "source_abbrev": "das",
                    "aphorism_num": num,
                    "title": f"§{num} — Commentary (A.K. Das)",
                    "content": clean(body[:4000]),
                    "footnotes": None,
                })
    else:
        # No clear aphorism split: store as big chapters by scanning for Aphorism headers
        rows.append({
            "source_abbrev": "das",
            "aphorism_num": 0,
            "title": "A Study of Organon (A.K. Das)",
            "content": clean(text[:8000]),
            "footnotes": None,
        })

    print(f"  A.K. Das: {len(rows)} entries")
    return rows

# ─── 8. Hahnemann 5th Ed (Art of Healing) ────────────────────────────────

def parse_hahnemann5(path: str) -> list[dict]:
    text = pdf_text(path)
    rows = []

    # 5th Ed uses § N format
    pattern = r'§\s*(\d+)[.\s]'
    parts = re.split(pattern, text)

    if parts[0].strip():
        rows.append({
            "source_abbrev": "hahnemann5",
            "aphorism_num": 0,
            "title": "Preface (5th Edition)",
            "content": clean(parts[0][:3000]),
            "footnotes": None,
        })

    i = 1
    while i + 1 < len(parts):
        try:
            num = int(parts[i])
        except ValueError:
            i += 2
            continue
        body = parts[i+1]
        fn_split = re.split(r'\n(?=[a-z]\.\s)', body, maxsplit=1)
        content = clean(fn_split[0])
        footnotes = clean(fn_split[1]) if len(fn_split) > 1 else None
        i += 2

        if num > 0 and len(content) > 10:
            rows.append({
                "source_abbrev": "hahnemann5",
                "aphorism_num": num,
                "title": f"§{num} (5th Ed.)",
                "content": content,
                "footnotes": footnotes,
            })

    print(f"  Hahnemann 5th: {len(rows)} aphorisms")
    return rows

# ─── 9. Hughes – Principals & Practice ───────────────────────────────────

def parse_hughes(path: str) -> list[dict]:
    text = pdf_text(path)
    rows = []

    pattern = r'\n(?:CHAPTER|Chapter)\s+([IVX]+|\d+)[.\s]*\n([^\n]+)\n'
    parts = re.split(pattern, text)

    roman_map = {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,
                 'IX':9,'X':10,'XI':11,'XII':12,'XIII':13,'XIV':14,'XV':15,
                 'XVI':16,'XVII':17,'XVIII':18,'XIX':19,'XX':20}

    if parts[0].strip():
        rows.append({
            "book_abbrev": "hughes",
            "chapter_num": 0,
            "chapter_title": "Introduction",
            "content": clean(parts[0]),
        })

    i = 1
    while i + 2 < len(parts):
        num_raw = parts[i].strip().upper()
        title   = parts[i+1].strip()
        body    = parts[i+2]
        i += 3
        ch_num = roman_map.get(num_raw) or (int(num_raw) if num_raw.isdigit() else 0)

        rows.append({
            "book_abbrev": "hughes",
            "chapter_num": ch_num,
            "chapter_title": title,
            "content": clean(body),
        })

    print(f"  Hughes: {len(rows)} chapters")
    return rows

# ─── main ──────────────────────────────────────────────────────────────────

def main():
    if not SUPABASE_KEY:
        print("ERROR: Set SUPABASE_SERVICE_ROLE_KEY env var")
        sys.exit(1)

    print("\n=== PARSING ORGANON BOOKS ===\n")

    # ── Aphorism-based books ──────────────────────────────────────────────
    aph_rows: list[dict] = []

    p = f"{DOWNLOADS}/Organon Of medicine_By Samuel hahnemann.pdf"
    if os.path.exists(p):
        print("Parsing Hahnemann 6th Ed...")
        aph_rows += parse_hahnemann6(p)

    p = f"{DOWNLOADS}/Organon Of The Art Of The Healing_By Hahnemann.pdf"
    if os.path.exists(p):
        print("Parsing Hahnemann 5th Ed...")
        aph_rows += parse_hahnemann5(p)

    p = f"{DOWNLOADS}/Outline Of The Organon_Hahnemann.pdf"
    if os.path.exists(p):
        print("Parsing Outline of Organon...")
        aph_rows += parse_outline(p)

    p = f"{DOWNLOADS}/Lecture On Homoeopathic Philosophy_By Kent.pdf"
    if os.path.exists(p):
        print("Parsing Kent Lectures...")
        aph_rows += parse_kent_lectures(p)

    p = f"{DOWNLOADS}/Organon Of Medicine_By M. P. ARYA.pdf"
    if os.path.exists(p):
        print("Parsing A.K. Das / Study of Organon...")
        aph_rows += parse_das(p)

    # Mahendra Singh (scanned — skip, just note)
    print("Mahendra Singh Part-1/2: scanned PDFs, skipping text extraction.")

    print(f"\nTotal aphorism rows: {len(aph_rows)}")
    print("Upserting organon_aphorisms...")
    upsert_batch("organon_aphorisms", aph_rows, ["source_abbrev", "aphorism_num"])

    # ── Chapter-based philosophy books ────────────────────────────────────
    phi_rows: list[dict] = []

    p = f"{DOWNLOADS}/The Principal & Art Of Cure By Homoeopathy _H.A.Roberts.pdf"
    if os.path.exists(p):
        print("\nParsing Roberts...")
        phi_rows += parse_roberts(p)

    p = f"{DOWNLOADS}/Homoeopathic Philosophy_By Stuart Close.pdf"
    if os.path.exists(p):
        print("Parsing Stuart Close...")
        phi_rows += parse_close(p)

    p = f"{DOWNLOADS}/Principles & Practice of Homoeopathy _By M. L. Dhawale.pdf"
    if os.path.exists(p):
        print("Parsing Dhawale...")
        phi_rows += parse_dhawale(p)

    p = f"{DOWNLOADS}/Principals & Practice Of Homoeopathy_By Richard Hughes.pdf"
    if os.path.exists(p):
        print("Parsing Hughes...")
        phi_rows += parse_hughes(p)

    print(f"\nTotal philosophy rows: {len(phi_rows)}")
    print("Upserting philosophy_chapters...")
    upsert_batch("philosophy_chapters", phi_rows, ["book_abbrev", "chapter_num"])

    print("\n✅ Done!")

if __name__ == "__main__":
    main()
