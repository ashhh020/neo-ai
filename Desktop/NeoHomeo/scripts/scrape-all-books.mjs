/**
 * Master homeopathic knowledge scraper
 * Books: Kent Repertory (full), Organon (individual aphorisms), Kent MM,
 *        Clarke MM, Allen MM, Hering Guiding Symptoms, Chronic Diseases,
 *        Boger Synoptic Key, Allen Clinical Hints
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(join(__dirname, "../.env.local"), "utf8")
    .split("\n").filter(l => l.includes("="))
    .map(l => { const i = l.indexOf("="); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const BASE = "http://www.homeoint.org";

async function get(path) {
  try {
    const r = await fetch(`${BASE}${path}`, { headers: { "User-Agent": "Mozilla/5.0 NeoHomeoBot/1.0 (homeopathy research)" } });
    if (!r.ok) return null;
    const html = await r.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&#\d+;/g, " ").replace(/&[a-z]+;/g, " ")
      .replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  } catch { return null; }
}

async function getLinks(path, pattern) {
  try {
    const r = await fetch(`${BASE}${path}`, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await r.text();
    const matches = [...html.matchAll(/href="([^"]+\.htm)"/gi)].map(m => m[1]);
    return [...new Set(matches)].filter(l => !l.includes("..") && (pattern ? pattern.test(l) : true));
  } catch { return []; }
}

async function save(doc) {
  const { error } = await supabase.from("knowledge_documents").upsert(
    { source: doc.source, category: doc.category, title: doc.title, content: doc.content.slice(0, 15000), metadata: doc.metadata || {} },
    { onConflict: "title" }
  );
  return !error;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let totalSaved = 0;

// ─── 1. KENT'S REPERTORY — Full, all sections, rubrics split ────────────────
const KENT_REP_SECTIONS = [
  { file: "kentmind.htm", section: "MIND" },
  { file: "kentvert.htm", section: "VERTIGO" },
  { file: "kenthead.htm", section: "HEAD" },
  { file: "kenteye.htm",  section: "EYE" },
  { file: "kentvisi.htm", section: "VISION" },
  { file: "kenthear.htm", section: "HEARING" },
  { file: "kentnose.htm", section: "NOSE" },
  { file: "kentface.htm", section: "FACE" },
  { file: "kentmout.htm", section: "MOUTH" },
  { file: "kentteet.htm", section: "TEETH" },
  { file: "kentthro.htm", section: "THROAT" },
  { file: "kentext.htm",  section: "EXTERNAL THROAT" },
  { file: "kentexth.htm", section: "EXTERNAL THROAT" },
  { file: "kentlary.htm", section: "LARYNX AND TRACHEA" },
  { file: "kentresp.htm", section: "RESPIRATION" },
  { file: "kentcoug.htm", section: "COUGH" },
  { file: "kentexpe.htm", section: "EXPECTORATION" },
  { file: "kentches.htm", section: "CHEST" },
  { file: "kentback.htm", section: "BACK" },
  { file: "kentextr.htm", section: "EXTREMITIES" },
  { file: "kentslee.htm", section: "SLEEP" },
  { file: "kentchil.htm", section: "CHILL" },
  { file: "kentfeve.htm", section: "FEVER" },
  { file: "kentpers.htm", section: "PERSPIRATION" },
  { file: "kentskin.htm", section: "SKIN" },
  { file: "kentgene.htm", section: "GENERALITIES" },
  { file: "kentstom.htm", section: "STOMACH" },
  { file: "kentabdo.htm", section: "ABDOMEN" },
  { file: "kentrect.htm", section: "RECTUM" },
  { file: "kentstoo.htm", section: "STOOL" },
  { file: "kenturin.htm", section: "URINE" },
  { file: "kentblad.htm", section: "BLADDER" },
  { file: "kentkidn.htm", section: "KIDNEYS" },
  { file: "kenturet.htm", section: "URETHRA" },
  { file: "kentgenm.htm", section: "GENITALIA MALE" },
  { file: "kentgenf.htm", section: "GENITALIA FEMALE" },
  { file: "kentreme.htm", section: "REMEDY RELATIONSHIPS" },
  { file: "kenturor.htm", section: "REMEDY LIST" },
];

async function scrapeKentRepertory() {
  console.log("\n📋 Scraping Kent's Repertory (full)...");
  let count = 0;

  for (const { file, section } of KENT_REP_SECTIONS) {
    const text = await get(`/books/kentrep/${file}`);
    if (!text) { console.log(`  ${section}: not found`); continue; }

    // Split into rubric chunks (~50 lines each for searchability)
    const lines = text.split("\n").filter(l => l.trim().length > 3);
    const chunkSize = 60;

    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, i + chunkSize).join("\n");
      const chunkNum = Math.floor(i / chunkSize) + 1;
      const title = `Kent Repertory: ${section} (Part ${chunkNum})`;

      const ok = await save({
        source: "repertory",
        category: section,
        title,
        content: `SOURCE: Kent's Repertory of the Homoeopathic Materia Medica\nSECTION: ${section} — Part ${chunkNum}\n\n${chunk}`,
        metadata: { section, part: chunkNum, book: "Kent Repertory" },
      });

      process.stdout.write(ok ? "." : "x");
      count++;
    }

    console.log(` ${section} (${Math.ceil(lines.length/chunkSize)} parts)`);
    await sleep(200);
  }
  console.log(`  → ${count} repertory chunks saved\n`);
  totalSaved += count;
}

// ─── 2. ORGANON — Re-scrape and split into individual aphorisms ──────────────
async function scrapeOrganonFull() {
  console.log("📖 Scraping Organon — splitting into individual aphorisms...");
  let count = 0;

  const pages = [1,20,40,60,80,100,120,140,160,180,200,220,240,260,280];

  for (const startNum of pages) {
    const text = await get(`/books/hahorgan/organ${String(startNum).padStart(3,"0")}.htm`);
    if (!text) continue;

    // Split text into individual aphorisms by § marker
    const lines = text.split("\n");
    let currentAph = "";
    let currentNum = null;
    const aphorisms = [];

    for (const line of lines) {
      const aphMatch = line.match(/§\s*(\d+)/);
      if (aphMatch) {
        if (currentNum !== null && currentAph.trim().length > 20) {
          aphorisms.push({ num: currentNum, text: currentAph.trim() });
        }
        currentNum = parseInt(aphMatch[1]);
        currentAph = line + "\n";
      } else if (currentNum !== null) {
        currentAph += line + "\n";
      }
    }
    if (currentNum !== null && currentAph.trim().length > 20) {
      aphorisms.push({ num: currentNum, text: currentAph.trim() });
    }

    // Save each aphorism individually
    for (const { num, text: aphText } of aphorisms) {
      const ok = await save({
        source: "organon",
        category: `Aphorism §${num}`,
        title: `Organon §${num} (Hahnemann, 6th Ed.)`,
        content: `SOURCE: Organon of Medicine by Samuel Hahnemann, 6th Edition\nAPHORISM: §${num}\n\n${aphText}`,
        metadata: { aphorism: num, book: "Organon", author: "Hahnemann" },
      });
      if (ok) { process.stdout.write("."); count++; }
    }
    await sleep(300);
  }
  console.log(`\n  → ${count} individual aphorisms saved\n`);
  totalSaved += count;
}

// ─── 3. Generic Book Scraper ──────────────────────────────────────────────────
async function scrapeBook({ indexPath, source, bookName, author, linkPattern }) {
  console.log(`📚 Scraping ${bookName}...`);
  const links = await getLinks(indexPath, linkPattern);
  let count = 0;

  for (const link of links.slice(0, 500)) {
    // Build correct URL path
    const basePath = indexPath.replace(/[^/]+$/, "");
    const fullPath = link.startsWith("/") ? link : `${basePath}${link}`;
    const text = await get(fullPath);
    if (!text || text.length < 150) continue;

    const firstLine = text.split("\n").find(l => l.trim().length > 5)?.trim().slice(0, 100) || link;

    const ok = await save({
      source,
      category: firstLine,
      title: `${bookName}: ${firstLine}`,
      content: `SOURCE: ${bookName} by ${author}\n\n${text}`,
      metadata: { book: bookName, author, link },
    });

    process.stdout.write(ok ? "." : "x");
    count++;
    await sleep(150);
  }
  console.log(`\n  → ${count} pages from ${bookName}\n`);
  totalSaved += count;
}

// ─── 4. Chronic Diseases ─────────────────────────────────────────────────────
async function scrapeChronicDiseases() {
  console.log("📕 Scraping Chronic Diseases (Hahnemann)...");
  const links = await getLinks("/books/hahchrdi/");
  let count = 0;

  for (const link of links.filter(l => !l.includes("index") && !l.includes("cont") && !l.includes("pref"))) {
    const text = await get(`/books/hahchrdi/${link}`);
    if (!text || text.length < 200) continue;
    const title = text.split("\n").find(l => l.trim().length > 5)?.trim().slice(0, 80) || link;

    const ok = await save({
      source: "organon",
      category: "Chronic Diseases",
      title: `Chronic Diseases: ${title}`,
      content: `SOURCE: The Chronic Diseases by Samuel Hahnemann\n\n${text}`,
      metadata: { book: "Chronic Diseases", author: "Hahnemann", link },
    });
    process.stdout.write(ok ? "." : "x");
    count++;
    await sleep(200);
  }
  console.log(`\n  → ${count} Chronic Diseases sections\n`);
  totalSaved += count;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
console.log("\n🌿 NeoHomeo AI — Complete Knowledge Base Ingestion\n");
console.log("Books: Kent Repertory, Organon (individual §), Kent Lectures,");
console.log("       Clarke MM, Allen MM, Hering, Chronic Diseases, Boger\n");

// Kent's full Repertory
await scrapeKentRepertory();

// Organon — individual aphorisms
await scrapeOrganonFull();

// Kent's Lectures on Materia Medica
await scrapeBook({
  indexPath: "/books3/kentmm/",
  source: "materia_medica",
  bookName: "Kent's Lectures on Homoeopathic Materia Medica",
  author: "James Tyler Kent",
  linkPattern: /^[a-z]/,
});

// Clarke's Dictionary of Practical MM
await scrapeBook({
  indexPath: "/clarke/",
  source: "materia_medica",
  bookName: "Clarke's Dictionary of Practical Materia Medica",
  author: "John Henry Clarke",
  linkPattern: /^[a-z]/,
});

// Allen's Encyclopedia of Pure Materia Medica
await scrapeBook({
  indexPath: "/allen/",
  source: "materia_medica",
  bookName: "Allen's Encyclopedia of Pure Materia Medica",
  author: "Timothy F. Allen",
  linkPattern: /^[a-z]/,
});

// Hering's Guiding Symptoms
await scrapeBook({
  indexPath: "/hering/",
  source: "materia_medica",
  bookName: "Hering's Guiding Symptoms",
  author: "Constantine Hering",
  linkPattern: /^[a-z]/,
});

// Chronic Diseases
await scrapeChronicDiseases();

// Boger's Synoptic Key
await scrapeBook({
  indexPath: "/books2/bogersyn/",
  source: "materia_medica",
  bookName: "Boger's Synoptic Key of the Materia Medica",
  author: "Cyrus Maxwell Boger",
  linkPattern: /^[a-z]/,
});

// Allen's Clinical Hints
await scrapeBook({
  indexPath: "/books2/allenclin/",
  source: "organon",
  bookName: "Allen's Clinical Hints",
  author: "Henry C. Allen",
  linkPattern: /^[a-z]/,
});

// Final count
const { data } = await supabase.from("knowledge_documents").select("source");
const counts = {};
(data || []).forEach(r => counts[r.source] = (counts[r.source] || 0) + 1);

console.log("\n\n📊 FINAL KNOWLEDGE BASE:");
console.log("─".repeat(40));
Object.entries(counts).forEach(([k, v]) => console.log(`  ${k.padEnd(20)} ${v} documents`));
console.log(`  ${"TOTAL".padEnd(20)} ${Object.values(counts).reduce((a,b)=>a+b,0)} documents`);
console.log("─".repeat(40));
console.log(`\n  Added this run: ${totalSaved} new/updated documents\n`);
