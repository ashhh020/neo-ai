/**
 * homeoint-scraper.ts
 * Live on-demand parser for homeoint.org repertory pages.
 * Runs server-side only (Node.js fetch / https module).
 *
 * Supports: kent, boericke, bogersyn (Boger Synoptic Key), bogergena (Boger General Analysis)
 */

export type RemedyGrade = [string, string, number]; // [abbrev, name, grade]

export interface LiveRubric {
  id: string;
  abbrev: string;
  chapter: string;
  fullpath: string;
  path: string;
  is_mother: boolean;
  remedies: RemedyGrade[];
}

// ─── Repertory config ─────────────────────────────────────────────────────────

export const LIVE_REPERTORIES: Record<string, {
  title: string;
  author: string;
  year: number;
  baseUrl: string;
  chapters: Array<{ name: string; file: string }>;
  pageStyle: "kent" | "boericke" | "boger";
}> = {
  kent: {
    title: "Kent's Repertory",
    author: "Kent, J.T.",
    year: 1897,
    baseUrl: "https://homeoint.org/books/kentrep",
    pageStyle: "kent",
    chapters: [
      { name: "Mind",               file: "kentmind.htm" },
      { name: "Vertigo",            file: "kentvert.htm" },
      { name: "Head",               file: "kenthead.htm" },
      { name: "Eye",                file: "kenteye.htm"  },
      { name: "Vision",             file: "kentvisi.htm" },
      { name: "Ear",                file: "kentear.htm"  },
      { name: "Hearing",            file: "kenthear.htm" },
      { name: "Nose",               file: "kentnose.htm" },
      { name: "Face",               file: "kentface.htm" },
      { name: "Mouth",              file: "kentmout.htm" },
      { name: "Teeth",              file: "kentteet.htm" },
      { name: "Throat",             file: "kentthro.htm" },
      { name: "External throat",    file: "kentexth.htm" },
      { name: "Stomach",            file: "kentstom.htm" },
      { name: "Abdomen",            file: "kentabdo.htm" },
      { name: "Rectum",             file: "kentrect.htm" },
      { name: "Stool",              file: "kentstoo.htm" },
      { name: "Urinary organs",     file: "kenturor.htm" },
      { name: "Bladder",            file: "kentblad.htm" },
      { name: "Kidneys",            file: "kentkidn.htm" },
      { name: "Prostate gland",     file: "kentpros.htm" },
      { name: "Urethra",            file: "kenturet.htm" },
      { name: "Urine",              file: "kenturin.htm" },
      { name: "Male genitalia",     file: "kentgenm.htm" },
      { name: "Female genitalia",   file: "kentgenf.htm" },
      { name: "Larynx and trachea", file: "kentlary.htm" },
      { name: "Respiration",        file: "kentresp.htm" },
      { name: "Cough",              file: "kentcoug.htm" },
      { name: "Expectoration",      file: "kentexpe.htm" },
      { name: "Chest",              file: "kentches.htm" },
      { name: "Back",               file: "kentback.htm" },
      { name: "Extremities",        file: "kentextr.htm" },
      { name: "Sleep",              file: "kentslee.htm" },
      { name: "Chill",              file: "kentchil.htm" },
      { name: "Fever",              file: "kentfeve.htm" },
      { name: "Perspiration",       file: "kentpers.htm" },
      { name: "Skin",               file: "kentskin.htm" },
      { name: "Generalities",       file: "kentgene.htm" },
    ],
  },
  boericke: {
    title: "Pocket Manual Repertory",
    author: "Boericke, O.E.",
    year: 1906,
    baseUrl: "https://homeoint.org/books4/boerirep",
    pageStyle: "boericke",
    chapters: [
      { name: "Mind",          file: "mind.htm"      },
      { name: "Head",          file: "head.htm"      },
      { name: "Eyes",          file: "eyes.htm"      },
      { name: "Ears",          file: "ears.htm"      },
      { name: "Nose",          file: "nose.htm"      },
      { name: "Face",          file: "face.htm"      },
      { name: "Mouth",         file: "mouth.htm"     },
      { name: "Tongue",        file: "tongue.htm"    },
      { name: "Teeth",         file: "teeth.htm"     },
      { name: "Throat",        file: "throat.htm"    },
      { name: "Stomach",       file: "stomach.htm"   },
      { name: "Abdomen",       file: "abdomen.htm"   },
      { name: "Rectum",        file: "rectum.htm"    },
      { name: "Urinary organs",file: "urinary.htm"   },
      { name: "Male",          file: "male.htm"      },
      { name: "Female",        file: "female.htm"    },
      { name: "Respiratory",   file: "respiratory.htm"},
      { name: "Nervous system",file: "nervous.htm"   },
      { name: "Extremities",   file: "extremities.htm"},
      { name: "Skin",          file: "skin.htm"      },
      { name: "Fever",         file: "fever.htm"     },
      { name: "Generalities",  file: "generalities.htm"},
    ],
  },
  bogersyn: {
    title: "Synoptic Key",
    author: "Boger, C.M.",
    year: 1915,
    baseUrl: "https://homeoint.org/books2/bogersyn",
    pageStyle: "boger",
    chapters: [
      { name: "Time",           file: "time.htm"         },
      { name: "Conditions",     file: "conditions.htm"   },
      { name: "Generalities",   file: "generalities.htm" },
      { name: "Mind",           file: "mind.htm"         },
      { name: "Vertigo",        file: "vertigo.htm"      },
      { name: "Head",           file: "head.htm"         },
      { name: "External head",  file: "externalhead.htm" },
      { name: "Eyes",           file: "eyes.htm"         },
      { name: "Vision",         file: "vision.htm"       },
      { name: "Ears",           file: "ears.htm"         },
      { name: "Hearing",        file: "hearing.htm"      },
      { name: "Nose",           file: "nose.htm"         },
      { name: "Face",           file: "face.htm"         },
      { name: "Mouth",          file: "mouth.htm"        },
      { name: "Throat",         file: "throat.htm"       },
      { name: "Stomach",        file: "stomach.htm"      },
      { name: "Abdomen",        file: "abdomen.htm"      },
      { name: "Rectum",         file: "rectum.htm"       },
      { name: "Urinary",        file: "urinary.htm"      },
      { name: "Male",           file: "male.htm"         },
      { name: "Female",         file: "female.htm"       },
      { name: "Respiratory",    file: "respiratory.htm"  },
      { name: "Chest",          file: "chest.htm"        },
      { name: "Back",           file: "back.htm"         },
      { name: "Extremities",    file: "extremities.htm"  },
      { name: "Skin",           file: "skin.htm"         },
      { name: "Sleep",          file: "sleep.htm"        },
      { name: "Fever",          file: "fever.htm"        },
    ],
  },
};

// ─── Page cache ───────────────────────────────────────────────────────────────
// In-memory cache keyed by URL (strip #anchor). Chapter pages are static HTML —
// they never change, so we cache indefinitely for the server process lifetime.
// Using Promise cache (inflight deduplication): if two requests for the same URL
// arrive simultaneously, only one fetch is made; both await the same Promise.

const PAGE_CACHE = new Map<string, Promise<string>>();
const MAX_CACHE_SIZE = 400; // ~400 chapter/content pages, well within memory budget

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchHtml(rawUrl: string): Promise<string> {
  // Strip anchor fragment — same page regardless of #P43 etc.
  const url = rawUrl.split("#")[0];

  const cached = PAGE_CACHE.get(url);
  if (cached) return cached;

  // Evict oldest entry if cache is full
  if (PAGE_CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = PAGE_CACHE.keys().next().value;
    if (firstKey) PAGE_CACHE.delete(firstKey);
  }

  const fetchPromise = fetchHtmlUncached(url);
  PAGE_CACHE.set(url, fetchPromise);
  // On failure, remove from cache so a retry can attempt again
  fetchPromise.catch(() => PAGE_CACHE.delete(url));
  return fetchPromise;
}

async function fetchHtmlUncached(url: string): Promise<string> {
  // Use Node.js https module with TLS verification disabled (homeoint.org has invalid cert)
  const https = await import("https");
  const http = await import("http");
  const mod = url.startsWith("https") ? https : http;

  return new Promise((resolve, reject) => {
    const agent = url.startsWith("https")
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;

    const req = mod.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; NeoHomeo/1.0)" }, agent } as any,
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          // homeoint uses latin-1 / windows-1252
          resolve(buf.toString("latin1"));
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(12000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

function cleanHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 180);
}

// ─── Kent parser ──────────────────────────────────────────────────────────────
// Kent chapter index pages list rubrics with href to page files (kent0000.htm etc.)
// We build a rubric-name → Set<pageFileUrl> map, then fetch only matching pages.

interface KentIndexEntry {
  rubricText: string;        // e.g. "Mind, absent-minded"
  pageUrl: string;           // e.g. "https://homeoint.org/books/kentrep/kent0000.htm"
}

function resolveUrl(href: string, indexUrl: string): string {
  // Resolve relative href against the index page URL
  const base = indexUrl.replace(/\/[^\/]+$/, "/"); // strip filename, keep trailing /
  if (href.startsWith("http")) return href;
  if (href.startsWith("../")) {
    // Go up one directory from base
    const parent = base.replace(/\/[^\/]+\/$/, "/");
    return parent + href.replace("../", "");
  }
  return base + href;
}

function parseKentIndex(html: string, indexUrl: string, chapterName: string): KentIndexEntry[] {
  const entries: KentIndexEntry[] = [];

  // Normalize: collapse newlines inside tags so <a\n    href=...> becomes <a href=...>
  const normalized = html.replace(/<a\s*\n\s*/gi, "<a ");

  // Split into lines on <br> boundaries
  const lines = normalized.split(/<br\s*\/?>/i);

  for (const line of lines) {
    // Find a kent page link in this line
    // Some chapters use ../kentrep1/kent0040.htm, others use just kent0040.htm (same dir)
    const hrefMatch = line.match(/href=["']?((?:\.\.[/\\]kentrep\d*[/\\])?kent\d+\.htm)/i);
    if (!hrefMatch) continue;
    const href = hrefMatch[1].replace(/\\/g, "/");
    const pageUrl = resolveUrl(href, indexUrl);

    // Extract rubric text: everything before the opening paren of the page ref
    // Pattern: "Rubric text (optional cross-ref) (<a href=...>"
    // Remove HTML tags, then take text before last "("
    const textPart = line.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    // Remove trailing "(p. NNN)" or "(See ...)" references
    const rubricText = textPart
      .replace(/\(\s*p\.\s*\d+.*$/, "")   // remove (p. 682)
      .replace(/\([^)]*\)\s*$/, "")        // remove any trailing parens
      .replace(/\s+/g, " ")
      .trim();

    if (!rubricText || rubricText.length < 3) continue;
    if (/^kent$/i.test(rubricText) || /copyright/i.test(rubricText)) continue;

    const fullRubric = rubricText.toLowerCase().startsWith(chapterName.toLowerCase())
      ? rubricText
      : `${chapterName}, ${rubricText}`;

    entries.push({ rubricText: fullRubric, pageUrl });
  }
  return entries;
}

function parseKentPage(html: string, chapterName: string): LiveRubric[] {
  const rubrics: LiveRubric[] = [];

  // Kent page structure:
  // <B><P>RUBRIC NAME</B> : remedies</P>
  // or <B><P><A NAME="anchor">RUBRIC NAME</A></B> : remedies</P>
  // Sub-rubrics inside <DIR><P>sub text : remedies</P></DIR>
  // Only extract top-level rubrics (the <B><P>...</B> pattern)

  // Strategy: find all <B><P> blocks, extract name + remedy text
  const rubricRe = /<B>\s*<P>(?:<A[^>]*>)?([^<]{2,})(?:<\/A>)?\s*<\/B>([\s\S]*?)(?=<B>\s*<P>|$)/gi;

  let m: RegExpExecArray | null;
  while ((m = rubricRe.exec(html))) {
    const rawName = cleanHtml(m[1]).replace(/\(.*?\)/g, "").trim();
    const afterBlock = m[2];

    if (!rawName || rawName.length < 2) continue;
    if (/^[-=]+$|^KENT$|^p\.\s*\d|copyright/i.test(rawName)) continue;

    // Find colon that separates rubric name from remedy list
    const colonIdx = afterBlock.indexOf(":");
    if (colonIdx === -1) continue;

    let remedyHtml = afterBlock.slice(colonIdx + 1);
    // Trim at first <DIR> (sub-rubrics)
    const dirIdx = remedyHtml.search(/<DIR>/i);
    if (dirIdx !== -1) remedyHtml = remedyHtml.slice(0, dirIdx);
    // Trim at </P>
    const pEndIdx = remedyHtml.search(/<\/P>/i);
    if (pEndIdx !== -1) remedyHtml = remedyHtml.slice(0, pEndIdx);

    const remedies = parseRemediesKent(remedyHtml);
    if (!remedies.length) continue;

    const fullpath = rawName.toLowerCase().startsWith(chapterName.toLowerCase())
      ? rawName
      : `${chapterName}, ${rawName}`;

    rubrics.push({
      id: `kent_${slugify(fullpath)}`,
      abbrev: "kent",
      chapter: chapterName,
      fullpath,
      path: rawName,
      is_mother: false,
      remedies,
    });
  }

  return rubrics;
}

function parseRemediesKent(html: string): RemedyGrade[] {
  const remedies: RemedyGrade[] = [];
  const seen = new Set<string>();

  // Actual Kent HTML structure:
  // Grade 3: <B><FONT COLOR="#ff0000">Name.</B></FONT>  (</B> before </FONT>)
  // Grade 2: <FONT COLOR="#0000ff">Name.</FONT>  inside <I>...</I> blocks
  // Grade 1: plain text

  // Grade 3: bold+red — match <B><FONT color=#ff0000>text</B> (closing </B> is the end marker)
  const g3re = /<B>\s*<FONT[^>]*#ff0000[^>]*>\s*(.*?)\s*<\/B>/gi;
  let m: RegExpExecArray | null;
  while ((m = g3re.exec(html))) {
    const t = cleanHtml(m[1]).replace(/[.,]+$/, "").trim();
    if (t && t.length > 1 && !seen.has(t)) { seen.add(t); remedies.push([t, t, 3]); }
  }

  // Grade 2: blue font (inside italic blocks)
  const g2re = /<FONT[^>]*#0000ff[^>]*>\s*(.*?)\s*<\/FONT>/gi;
  while ((m = g2re.exec(html))) {
    const t = cleanHtml(m[1]).replace(/[.,]+$/, "").trim();
    if (t && t.length > 1 && !seen.has(t)) { seen.add(t); remedies.push([t, t, 2]); }
  }

  // Grade 1: strip all colored/bold/italic content, parse remaining plain abbrevs
  const plain = html
    .replace(/<B>\s*<FONT[^>]*#ff0000[^>]*>[\s\S]*?<\/B>/gi, "")
    .replace(/<FONT[^>]*#0000ff[^>]*>[\s\S]*?<\/FONT>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\([^)]+\)/g, ""); // remove cross-refs in parens

  for (const token of plain.split(/[,;\s]+/)) {
    const t = token.replace(/[.,]+$/, "").trim();
    if (t.length < 2 || !/[a-zA-Z]/.test(t[0])) continue;
    if (/^(See|and|or|from|with|for|the|in|of|to|a|an|includes|Hot|Cold)$/i.test(t)) continue;
    if (/^\d/.test(t)) continue;
    if (!seen.has(t)) { seen.add(t); remedies.push([t, t, 1]); }
  }

  return remedies;
}

// ─── Boericke / Boger parser ──────────────────────────────────────────────────
// Boericke page structure:
//   <b><font size="4" color="#ff0000"><p>MAIN RUBRIC</p>  ← main heading (no remedies directly)
//   <dir>
//     <font size="4" color="#0000ff"><p>Sub-rubric</font></b> -- remedies
//   </dir>
// Remedies: <i><font color="#0000ff">Name</font></i> = grade 2, plain = grade 1

function parseBoerickeChapter(html: string, chapterName: string, abbrev: string): LiveRubric[] {
  const rubrics: LiveRubric[] = [];

  // Boericke HTML patterns (from real page inspection):
  //
  // Pattern A — main heading with sub-rubrics inside <dir>:
  //   <b><font color="#ff0000"><p>HEADING</p><dir></font>
  //   <font color="#0000ff"><p>Sub</font></b> -- remedies
  //   </dir>
  //
  // Pattern B — direct rubric (no sub-rubrics): heading text, then </font></b> -- remedies
  //   <b><font color="#ff0000"><p>BRAIN-FAG </font></b> -- remedies
  //
  // Pattern C — extra sub after dir (blue bold):
  //   <b><font color="#0000ff"><p>Easy</font></b> -- remedies
  //
  // Strategy: scan HTML sequentially, tracking current main heading.
  // Match two token types:
  //   1) Red heading (may or may not have direct remedies)
  //   2) Blue sub-rubric + remedies

  // Normalize: collapse whitespace between tags for easier matching
  const norm = html.replace(/>\s+</g, '> <');

  let currentMain = "";
  let pos = 0;

  // Combined scanner: find all rubric-like tokens in order
  // Token types:
  //   RED_WITH_REMEDIES: <font color="#ff0000"> ... </font></b> -- REMEDIES
  //   RED_HEADING:       <font color="#ff0000"> ... </p>  (heading, remedies in sub-rubrics)
  //   BLUE_SUB:          <font color="#0000ff"> ... </font></b> -- REMEDIES

  // Match any <font color="#ff0000" or #0000ff> block that ends with </font></b> -- or </p>
  const tokenRe = /<(?:b>\s*)?<font[^>]*(#ff0000|#0000ff)[^>]*>\s*<p[^>]*>([\s\S]*?)(?:<\/p>\s*(?:<dir>|<\/b>)|\s*<\/font>\s*<\/b>\s*--\s*([\s\S]*?)(?=\n?\s*<p|\n?\s*<b|\n?\s*<\/dir|\n?\s*<a\s+name|$))/gi;

  // Simpler two-pass approach — scan for each pattern explicitly
  // Pass 1: find all red headings WITH their direct remedies (Pattern B)
  // Pass 2: find all sub-rubrics (Pattern A/C), track nearest preceding red heading

  // Find red headings (both with and without direct remedies)
  const redRe = /<b>\s*<font[^>]*#ff0000[^>]*>\s*<p[^>]*>([\s\S]*?)<\/font>\s*<\/b>(\s*--\s*([\s\S]*?))?(?=\s*<p|\s*<b|\s*<\/dir|\s*<a\s+name|$)/gi;
  const redHeadings: Array<{ name: string; remedyHtml: string | null; pos: number }> = [];
  let m: RegExpExecArray | null;

  while ((m = redRe.exec(html))) {
    const rawName = cleanHtml(m[1]).trim();
    // Skip title/header text
    if (!rawName || rawName.length < 2) continue;
    if (/^(repertory|presented|medi-t|MIND|STOMACH|FEARS)/i.test(rawName) && !m[3]) {
      // It could be a chapter title — only skip if it's the full chapter name
      if (rawName.toUpperCase() === chapterName.toUpperCase()) { continue; }
    }
    // Clean up any trailing extra text (e.g., "(See NEURASTHENIA)" footnotes)
    const name = rawName.replace(/\s*\(See[^)]+\)\s*/g, "").replace(/<[^>]+>/g, "").trim();
    redHeadings.push({ name, remedyHtml: m[3] || null, pos: m.index });
  }

  // Find blue sub-rubrics with remedies
  const blueRe = /<font[^>]*#0000ff[^>]*>\s*<p[^>]*>([\s\S]*?)<\/font>\s*<\/b>\s*--\s*([\s\S]*?)(?=\s*<p|\s*<b|\s*<\/dir|\s*<a\s+name|$)/gi;

  while ((m = blueRe.exec(html))) {
    const subName = cleanHtml(m[1]).trim();
    const remedyHtml = m[2];
    if (!subName || subName.length < 2) continue;

    // Find the nearest red heading before this position
    const pos2 = m.index;
    let mainName = "";
    for (let i = redHeadings.length - 1; i >= 0; i--) {
      if (redHeadings[i].pos < pos2) { mainName = redHeadings[i].name; break; }
    }

    const remedies = parseRemediesBoericke(remedyHtml);
    if (!remedies.length) continue;

    const fullpath = mainName
      ? `${chapterName}, ${mainName}, ${subName}`
      : `${chapterName}, ${subName}`;

    rubrics.push({
      id: `${abbrev}_${slugify(fullpath)}`,
      abbrev,
      chapter: chapterName,
      fullpath,
      path: mainName ? `${mainName}, ${subName}` : subName,
      is_mother: false,
      remedies,
    });
  }

  // Add direct rubrics (red headings that had their own remedies)
  for (const rh of redHeadings) {
    if (!rh.remedyHtml) continue;
    const remedies = parseRemediesBoericke(rh.remedyHtml);
    if (!remedies.length) continue;
    const fullpath = `${chapterName}, ${rh.name}`;
    if (!rubrics.find(r => r.fullpath === fullpath)) {
      rubrics.push({
        id: `${abbrev}_${slugify(fullpath)}`,
        abbrev,
        chapter: chapterName,
        fullpath,
        path: rh.name,
        is_mother: false,
        remedies,
      });
    }
  }

  return rubrics;
}

// ─── Boger Synoptic Key parser ────────────────────────────────────────────────
// Structure (from real page inspection):
//   Rubric heading (navy blue + inline red for key word):
//   <b><font size="4" color="#000080">Mind, </font>
//      <font size="4" color="#ff0000">fear</font>
//      <font size="4" color="#000080">, trembling&nbsp;:</font></b>
//   <blockquote><blockquote>
//     <p><i><font color="#0000ff">Aco.,</font></i> <b><font color="#ff0000">Bell.,</font></b> Bry.</p>
//   </blockquote></blockquote>
//
// Grade 3: <b><font color="#ff0000">Name.</font></b>
// Grade 2: <i><font color="#0000ff">Name.</font></i>
// Grade 1: plain text

function parseBogerSynopticChapter(html: string, chapterName: string, abbrev: string): LiveRubric[] {
  const rubrics: LiveRubric[] = [];

  // Boger Synoptic Key HTML structure (from real page):
  // <b><font size="4" color="#000080">
  // <p>Mind, fearsome, dark&nbsp;:</p>
  // <blockquote><blockquote>
  // </font></b>
  // <p>Cam., <i><font color="#0000ff">Cann.,</font></i> <b><font color="#ff0000">Stram.,</font></b></p>
  // </blockquote></blockquote>
  //
  // Heading text is in a <p> that ends with ":"
  // Remedies are in a subsequent <p> after </font></b> inside the blockquote.
  //
  // Key pattern: <p>RUBRIC TEXT :?</p> followed by <blockquote>..</blockquote> containing remedies
  // The rubric <p> is wrapped in <b><font #000080>...</font></b>

  // Find all rubric heading + remedy pairs
  // Match: <p>HEADING :</p> ... <blockquote> ... </font></b>\n<p>REMEDIES</p>
  const rubricRe = /<p[^>]*>([\s\S]*?&nbsp;:|[\s\S]*?\s+:)\s*<\/p>\s*<blockquote>\s*<blockquote>\s*<\/font>\s*<\/b>\s*<p>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;

  while ((m = rubricRe.exec(html))) {
    const headingHtml = m[1];
    const remedyHtml = m[2];

    // Extract text from heading (may contain mixed font tags)
    const rubricText = cleanHtml(headingHtml)
      .replace(/&nbsp;/g, " ")
      .replace(/\s*:\s*$/, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!rubricText || rubricText.length < 2) continue;
    if (/^(presented|medi-t|repertory|SYNOPTIC)/i.test(rubricText)) continue;

    const remedies = parseRemediesBoger(remedyHtml);
    if (!remedies.length) continue;

    // Fullpath: heading text already includes "Mind, fearsome, dark"
    const fullpath = rubricText.toLowerCase().startsWith(chapterName.toLowerCase())
      ? rubricText
      : `${chapterName}, ${rubricText}`;

    rubrics.push({
      id: `${abbrev}_${slugify(fullpath)}`,
      abbrev,
      chapter: chapterName,
      fullpath,
      path: rubricText,
      is_mother: false,
      remedies,
    });
  }

  return rubrics;
}

function parseRemediesBoger(html: string): RemedyGrade[] {
  const remedies: RemedyGrade[] = [];
  const seen = new Set<string>();

  // Grade 3: bold red <b><font color="#ff0000">Name.</font></b>
  const g3re = /<b>\s*<font[^>]*#ff0000[^>]*>(.*?)<\/font>\s*<\/b>/gi;
  let m: RegExpExecArray | null;
  while ((m = g3re.exec(html))) {
    const t = cleanHtml(m[1]).replace(/[.,]+$/, "").trim();
    if (t && t.length > 1 && !seen.has(t)) { seen.add(t); remedies.push([t, t, 3]); }
  }

  // Grade 2: italic blue <i><font color="#0000ff">Name.</font></i>
  const g2re = /<i>\s*<font[^>]*#0000ff[^>]*>(.*?)<\/font>\s*<\/i>/gi;
  while ((m = g2re.exec(html))) {
    const t = cleanHtml(m[1]).replace(/[.,]+$/, "").trim();
    if (t && t.length > 1 && !seen.has(t)) { seen.add(t); remedies.push([t, t, 2]); }
  }

  // Grade 1: plain text after removing graded ones
  const plain = html
    .replace(/<b>\s*<font[^>]+>[\s\S]*?<\/font>\s*<\/b>/gi, "")
    .replace(/<i>\s*<font[^>]+>[\s\S]*?<\/font>\s*<\/i>/gi, "")
    .replace(/<[^>]+>/g, " ");

  for (const token of plain.split(/[,;\s]+/)) {
    const t = token.replace(/[.,\-]+$/, "").trim();
    if (t.length < 2 || !t[0].match(/[a-zA-Z]/)) continue;
    if (/^(and|or|from|with|for|the|in|of|to|a|an)$/i.test(t)) continue;
    if (!seen.has(t)) { seen.add(t); remedies.push([t, t, 1]); }
  }

  return remedies;
}

function parseRemediesBoericke(html: string): RemedyGrade[] {
  const remedies: RemedyGrade[] = [];
  const seen = new Set<string>();

  // Grade 2: italic blue
  const g2re = /<i>\s*<font[^>]*#0000ff[^>]*>(.*?)<\/font>\s*<\/i>|<font[^>]*#0000ff[^>]*>\s*<i>(.*?)<\/i>\s*<\/font>/gi;
  let m: RegExpExecArray | null;
  while ((m = g2re.exec(html))) {
    const t = cleanHtml(m[1] || m[2] || "").replace(/[.,]+$/, "").trim();
    if (t && t.length > 1 && !seen.has(t)) { seen.add(t); remedies.push([t, t, 2]); }
  }

  // Grade 1: plain text
  const plain = html
    .replace(/<(?:b|i)>\s*<font[^>]+>.*?<\/font>\s*<\/(?:b|i)>/gi, "")
    .replace(/<font[^>]+>.*?<\/font>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\([^)]+\)/g, "");

  for (const token of plain.split(/[,;\s]+/)) {
    const t = token.replace(/[.,\-]+$/, "").trim();
    if (t.length < 2 || !t[0].match(/[a-zA-Z]/)) continue;
    if (/^(See|and|or|from|with|for|the|in|of|to|a|an|--)$/i.test(t)) continue;
    if (!seen.has(t)) { seen.add(t); remedies.push([t, t, 1]); }
  }

  return remedies;
}

// ─── Main search function ─────────────────────────────────────────────────────

function wordsMatch(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.every(w => lower.includes(w.toLowerCase()));
}

export async function searchLiveRepertory(
  abbrev: string,
  query: string,
  chapterFilter?: string,
  minWeight = 1,
  remedyFilter?: string,
  limit = 50,
): Promise<LiveRubric[]> {
  const config = LIVE_REPERTORIES[abbrev];
  if (!config) return [];

  const words = query.trim().split(/\s+/).filter(Boolean);
  const results: LiveRubric[] = [];

  // Which chapters to search
  let chapters = config.chapters;
  if (chapterFilter && chapterFilter !== "All") {
    chapters = chapters.filter(c =>
      c.name.toLowerCase() === chapterFilter.toLowerCase()
    );
  }

  if (config.pageStyle === "kent") {
    // Kent: chapter index → find matching rubric page URLs → fetch pages → parse
    await Promise.all(
      chapters.map(async ch => {
        if (results.length >= limit * 2) return;
        try {
          const indexUrl = `${config.baseUrl}/${ch.file}`;
          const indexHtml = await fetchHtml(indexUrl);

          // Find rubric lines in the index that match our query
          const entries = parseKentIndex(indexHtml, indexUrl, ch.name);
          const matching = entries.filter(e => words.length === 0 || wordsMatch(e.rubricText, words));

          if (matching.length === 0) return;

          // Collect unique page URLs needed
          const pageUrls = [...new Set(matching.map(e => e.pageUrl))].slice(0, 20);

          // Fetch pages in parallel
          const pages = await Promise.all(
            pageUrls.map(url => fetchHtml(url).catch(() => ""))
          );

          for (const pageHtml of pages) {
            if (!pageHtml) continue;
            const rubrics = parseKentPage(pageHtml, ch.name);
            for (const r of rubrics) {
              if (words.length === 0 || wordsMatch(r.fullpath, words)) {
                if (applyFilters(r, minWeight, remedyFilter)) {
                  results.push(r);
                }
              }
            }
          }
        } catch {
          // chapter fetch failed, skip
        }
      })
    );
  } else {
    // Boericke / Boger: fetch full chapter page, parse all rubrics, filter
    await Promise.all(
      chapters.map(async ch => {
        if (results.length >= limit * 2) return;
        try {
          const pageUrl = `${config.baseUrl}/${ch.file}`;
          const html = await fetchHtml(pageUrl);
          const rubrics = config.pageStyle === "boger"
            ? parseBogerSynopticChapter(html, ch.name, abbrev)
            : parseBoerickeChapter(html, ch.name, abbrev);
          for (const r of rubrics) {
            if (words.length === 0 || wordsMatch(r.fullpath, words)) {
              if (applyFilters(r, minWeight, remedyFilter)) {
                results.push(r);
              }
            }
          }
        } catch {
          // skip
        }
      })
    );
  }

  return results.slice(0, limit);
}

// ─── Background cache warmer ──────────────────────────────────────────────────
// Pre-fetches all chapter pages for every live repertory so that the FIRST user
// search is fast too. Runs once on module load, silently in the background.
// Each chapter page is small (<200 KB), total ~50 pages, ~5 MB RAM.

let warmupStarted = false;
export function warmupCache(): void {
  if (warmupStarted) return;
  warmupStarted = true;

  // Fire-and-forget background warmer.
  // For Boericke/Boger: fetch the chapter page (one page = all rubrics).
  // For Kent: fetch chapter index → extract content page URLs → fetch all content pages.
  // ~350 pages total, staggered at 60ms to avoid hammering homeoint.org.
  (async () => {
    for (const [, config] of Object.entries(LIVE_REPERTORIES)) {
      for (const ch of config.chapters) {
        const chapterUrl = `${config.baseUrl}/${ch.file}`;
        try {
          const html = await fetchHtml(chapterUrl); // index/chapter page (cached)

          if (config.pageStyle === "kent") {
            // Parse index to discover all content page URLs, then pre-fetch them
            const entries = parseKentIndex(html, chapterUrl, ch.name);
            const pageUrls = [...new Set(entries.map(e => e.pageUrl))];
            for (const pageUrl of pageUrls) {
              fetchHtml(pageUrl).catch(() => {}); // fire and forget each content page
              await new Promise(r => setTimeout(r, 60));
            }
          }
        } catch {
          // ignore errors during warmup
        }
        await new Promise(r => setTimeout(r, 60));
      }
    }
  })();
}

function applyFilters(r: LiveRubric, minWeight: number, remedyFilter?: string): boolean {
  if (minWeight > 1) {
    if (!r.remedies.some(rem => rem[2] >= minWeight)) return false;
  }
  if (remedyFilter) {
    const rf = remedyFilter.toLowerCase();
    const found = r.remedies.find(rem => rem[0].toLowerCase().includes(rf));
    if (!found) return false;
    if (minWeight > 1 && found[2] < minWeight) return false;
  }
  return true;
}
