/**
 * Full homeopathic books scraper — Boericke, Organon, Kent, Nash, Allen
 * Sources: homeoint.org (public domain)
 * Run: node scripts/scrape-books.mjs
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

// ── Helpers ──────────────────────────────────────────────────────────────────
async function fetchText(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 NeoHomeoBot/1.0" } });
    if (!res.ok) return null;
    const html = await res.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&#\d+;/g, " ").replace(/&[a-z]+;/g, " ")
      .replace(/\s{3,}/g, "\n\n").trim();
  } catch { return null; }
}

async function upsertDoc(doc) {
  const { error } = await supabase.from("knowledge_documents").upsert(
    { source: doc.source, category: doc.category, title: doc.title, content: doc.content.slice(0, 15000), metadata: doc.metadata || {} },
    { onConflict: "title" }
  );
  if (error) process.stdout.write(` ✗ ${error.message.slice(0,40)}`);
  else process.stdout.write(" ✓");
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Boericke Materia Medica ───────────────────────────────────────────────────
const BASE = "http://www.homeoint.org/books/boericmm";
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

async function scrapeBoericke() {
  console.log("\n📚 Scraping Boericke's Materia Medica...");
  let total = 0;

  for (const letter of LETTERS) {
    const indexUrl = `${BASE}/${letter}.htm`;
    const indexText = await fetchText(indexUrl);
    if (!indexText) continue;

    // Extract remedy links
    const res = await fetch(indexUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const links = [...html.matchAll(/href="([a-z]\/[^"]+\.htm)"/gi)].map(m => m[1]);
    const uniqueLinks = [...new Set(links)];

    for (const link of uniqueLinks) {
      const url = `${BASE}/${link}`;
      const text = await fetchText(url);
      if (!text || text.length < 200) continue;

      // Extract remedy name from first meaningful line
      const lines = text.split("\n").filter(l => l.trim().length > 5);
      const nameLine = lines.find(l => l.match(/^[A-Z][A-Z\s\-]+$/) && l.length < 80) || lines[0];
      const remedyName = nameLine?.replace(/HOMOEOPATHIC.*/, "").replace(/By William.*/, "").trim().slice(0, 80);

      if (!remedyName || remedyName.length < 3) continue;

      // Clean and chunk content
      const cleanText = text
        .replace(/Home.*?BOERICKE.*?\n/s, "")
        .replace(/Presented by.*?\n/, "")
        .trim();

      process.stdout.write(`  [${letter.toUpperCase()}] ${remedyName.slice(0,40)}...`);

      await upsertDoc({
        source: "materia_medica",
        category: remedyName,
        title: `Boericke MM: ${remedyName}`,
        content: `SOURCE: Boericke's Homoeopathic Materia Medica\nREMEDY: ${remedyName}\n\n${cleanText}`,
        metadata: { remedy: remedyName, book: "Boericke", letter },
      });

      total++;
      console.log("");
      await sleep(150);
    }
  }
  console.log(`\n  → Scraped ${total} remedies from Boericke\n`);
}

// ── Organon of Medicine ───────────────────────────────────────────────────────
const ORGANON_URLS = [
  { url: "http://www.homeoint.org/books/hahorgan/aph01-10.htm", section: "§1-10" },
  { url: "http://www.homeoint.org/books/hahorgan/aph11-20.htm", section: "§11-20" },
  { url: "http://www.homeoint.org/books/hahorgan/aph21-30.htm", section: "§21-30" },
  { url: "http://www.homeoint.org/books/hahorgan/aph31-40.htm", section: "§31-40" },
  { url: "http://www.homeoint.org/books/hahorgan/aph41-50.htm", section: "§41-50" },
  { url: "http://www.homeoint.org/books/hahorgan/aph51-60.htm", section: "§51-60" },
  { url: "http://www.homeoint.org/books/hahorgan/aph61-70.htm", section: "§61-70" },
  { url: "http://www.homeoint.org/books/hahorgan/aph71-80.htm", section: "§71-80" },
  { url: "http://www.homeoint.org/books/hahorgan/aph81-90.htm", section: "§81-90" },
  { url: "http://www.homeoint.org/books/hahorgan/aph91-100.htm", section: "§91-100" },
  { url: "http://www.homeoint.org/books/hahorgan/aph101-10.htm", section: "§101-110" },
  { url: "http://www.homeoint.org/books/hahorgan/aph111-20.htm", section: "§111-120" },
  { url: "http://www.homeoint.org/books/hahorgan/aph121-30.htm", section: "§121-130" },
  { url: "http://www.homeoint.org/books/hahorgan/aph131-40.htm", section: "§131-140" },
  { url: "http://www.homeoint.org/books/hahorgan/aph141-50.htm", section: "§141-150" },
  { url: "http://www.homeoint.org/books/hahorgan/aph151-60.htm", section: "§151-160" },
  { url: "http://www.homeoint.org/books/hahorgan/aph161-70.htm", section: "§161-170" },
  { url: "http://www.homeoint.org/books/hahorgan/aph171-80.htm", section: "§171-180" },
  { url: "http://www.homeoint.org/books/hahorgan/aph181-90.htm", section: "§181-190" },
  { url: "http://www.homeoint.org/books/hahorgan/aph191-00.htm", section: "§191-200" },
  { url: "http://www.homeoint.org/books/hahorgan/aph201-10.htm", section: "§201-210" },
  { url: "http://www.homeoint.org/books/hahorgan/aph211-20.htm", section: "§211-220" },
  { url: "http://www.homeoint.org/books/hahorgan/aph221-30.htm", section: "§221-230" },
  { url: "http://www.homeoint.org/books/hahorgan/aph231-40.htm", section: "§231-240" },
  { url: "http://www.homeoint.org/books/hahorgan/aph241-50.htm", section: "§241-250" },
  { url: "http://www.homeoint.org/books/hahorgan/aph251-60.htm", section: "§251-260" },
  { url: "http://www.homeoint.org/books/hahorgan/aph261-70.htm", section: "§261-270" },
  { url: "http://www.homeoint.org/books/hahorgan/aph271-91.htm", section: "§271-291" },
];

async function scrapeOrganon() {
  console.log("📖 Scraping Organon of Medicine (all 291 aphorisms)...");
  let scraped = 0;
  for (const { url, section } of ORGANON_URLS) {
    process.stdout.write(`  Section ${section}...`);
    const text = await fetchText(url);
    if (!text) { console.log(" (not found, skipping)"); continue; }
    await upsertDoc({
      source: "organon",
      category: `Organon ${section}`,
      title: `Organon of Medicine ${section} (Hahnemann, 6th Ed.)`,
      content: `SOURCE: Organon of Medicine by Samuel Hahnemann, 6th Edition\nSECTION: ${section}\n\n${text}`,
      metadata: { section, book: "Organon", author: "Hahnemann" },
    });
    scraped++;
    console.log("");
    await sleep(200);
  }
  console.log(`\n  → Scraped ${scraped} sections of Organon\n`);
}

// ── Kent's Lectures on Materia Medica ────────────────────────────────────────
const KENT_BASE = "http://www.homeoint.org/books/kentlect";

async function scrapeKentLectures() {
  console.log("📗 Scraping Kent's Lectures on Materia Medica...");
  const indexHtml = await fetch(`${KENT_BASE}/index.htm`, { headers: { "User-Agent": "Mozilla/5.0" } }).then(r => r.text()).catch(() => null);
  if (!indexHtml) { console.log("  (not available)\n"); return; }

  const links = [...indexHtml.matchAll(/href="([^"]+\.htm)"/gi)]
    .map(m => m[1])
    .filter(l => !l.includes("index") && !l.includes(".."));

  let total = 0;
  for (const link of [...new Set(links)].slice(0, 100)) {
    const url = `${KENT_BASE}/${link}`;
    const text = await fetchText(url);
    if (!text || text.length < 300) continue;

    const title = text.split("\n")[0]?.trim().slice(0, 100) || link;
    process.stdout.write(`  ${title.slice(0,50)}...`);
    await upsertDoc({
      source: "materia_medica",
      category: title,
      title: `Kent Lectures: ${title}`,
      content: `SOURCE: Kent's Lectures on Homoeopathic Materia Medica\nREMEDY: ${title}\n\n${text}`,
      metadata: { remedy: title, book: "Kent Lectures", author: "James Tyler Kent" },
    });
    total++;
    console.log("");
    await sleep(150);
  }
  console.log(`\n  → Scraped ${total} Kent lectures\n`);
}

// ── Nash's Leaders ────────────────────────────────────────────────────────────
const NASH_BASE = "http://www.homeoint.org/books/nashleader";

async function scrapeNash() {
  console.log("📘 Scraping Nash's Leaders in Homoeopathic Therapeutics...");
  const indexHtml = await fetch(`${NASH_BASE}/index.htm`, { headers: { "User-Agent": "Mozilla/5.0" } }).then(r => r.text()).catch(() => null);
  if (!indexHtml) { console.log("  (not available)\n"); return; }

  const links = [...indexHtml.matchAll(/href="([^"]+\.htm)"/gi)]
    .map(m => m[1]).filter(l => !l.includes("..") && !l.includes("index"));

  let total = 0;
  for (const link of [...new Set(links)]) {
    const url = `${NASH_BASE}/${link}`;
    const text = await fetchText(url);
    if (!text || text.length < 200) continue;
    const title = text.split("\n")[0]?.trim().slice(0,80) || link;
    process.stdout.write(`  ${title.slice(0,50)}...`);
    await upsertDoc({
      source: "materia_medica",
      category: title,
      title: `Nash Leaders: ${title}`,
      content: `SOURCE: Nash's Leaders in Homoeopathic Therapeutics\n\n${text}`,
      metadata: { book: "Nash Leaders", author: "Eugene B. Nash" },
    });
    total++;
    console.log("");
    await sleep(150);
  }
  console.log(`\n  → Scraped ${total} Nash chapters\n`);
}

// ── Allen's Keynotes ──────────────────────────────────────────────────────────
const ALLEN_BASE = "http://www.homeoint.org/books/allenkey";

async function scrapeAllen() {
  console.log("📙 Scraping Allen's Keynotes...");
  const indexHtml = await fetch(`${ALLEN_BASE}/index.htm`, { headers: { "User-Agent": "Mozilla/5.0" } }).then(r => r.text()).catch(() => null);
  if (!indexHtml) { console.log("  (not available)\n"); return; }

  const links = [...indexHtml.matchAll(/href="([^"]+\.htm)"/gi)]
    .map(m => m[1]).filter(l => !l.includes("..") && !l.includes("index"));

  let total = 0;
  for (const link of [...new Set(links)]) {
    const url = `${ALLEN_BASE}/${link}`;
    const text = await fetchText(url);
    if (!text || text.length < 200) continue;
    const title = text.split("\n")[0]?.trim().slice(0,80) || link;
    process.stdout.write(`  ${title.slice(0,50)}...`);
    await upsertDoc({
      source: "materia_medica",
      category: title,
      title: `Allen Keynotes: ${title}`,
      content: `SOURCE: Allen's Keynotes and Characteristics with Comparisons\n\n${text}`,
      metadata: { book: "Allen Keynotes", author: "Henry C. Allen" },
    });
    total++;
    console.log("");
    await sleep(150);
  }
  console.log(`\n  → Scraped ${total} Allen keynotes\n`);
}

// ── Chronic Diseases (Hahnemann) ─────────────────────────────────────────────
async function scrapeChronicDiseases() {
  console.log("📕 Scraping Hahnemann's Chronic Diseases...");
  const urls = [
    { url: "http://www.homeoint.org/books/hahchron/index.htm", title: "Chronic Diseases — Index" },
    { url: "http://www.homeoint.org/books/hahchron/theory.htm", title: "Chronic Diseases — Theory of Chronic Diseases" },
    { url: "http://www.homeoint.org/books/hahchron/psora.htm", title: "Chronic Diseases — Psora" },
    { url: "http://www.homeoint.org/books/hahchron/syphilis.htm", title: "Chronic Diseases — Syphilis" },
    { url: "http://www.homeoint.org/books/hahchron/sycosis.htm", title: "Chronic Diseases — Sycosis" },
  ];
  let total = 0;
  for (const { url, title } of urls) {
    process.stdout.write(`  ${title.slice(0,50)}...`);
    const text = await fetchText(url);
    if (!text) { console.log(" (not found)"); continue; }
    await upsertDoc({
      source: "organon",
      category: "Chronic Diseases",
      title,
      content: `SOURCE: The Chronic Diseases by Samuel Hahnemann\n\n${text}`,
      metadata: { book: "Chronic Diseases", author: "Hahnemann" },
    });
    total++;
    console.log("");
    await sleep(200);
  }
  console.log(`\n  → Scraped ${total} Chronic Diseases sections\n`);
}

// ── Hering's Guiding Symptoms ─────────────────────────────────────────────────
async function scrapeHering() {
  console.log("📓 Scraping Hering's Guiding Symptoms...");
  const BASE_H = "http://www.homeoint.org/books/heringguide";
  const indexHtml = await fetch(`${BASE_H}/index.htm`, { headers: { "User-Agent": "Mozilla/5.0" } }).then(r => r.text()).catch(() => null);
  if (!indexHtml) { console.log("  (not available)\n"); return; }
  const links = [...indexHtml.matchAll(/href="([^"]+\.htm)"/gi)]
    .map(m => m[1]).filter(l => !l.includes("..") && !l.includes("index"));
  let total = 0;
  for (const link of [...new Set(links)].slice(0, 80)) {
    const url = `${BASE_H}/${link}`;
    const text = await fetchText(url);
    if (!text || text.length < 200) continue;
    const title = text.split("\n")[0]?.trim().slice(0,80) || link;
    process.stdout.write(`  ${title.slice(0,50)}...`);
    await upsertDoc({
      source: "materia_medica",
      category: title,
      title: `Hering Guiding Symptoms: ${title}`,
      content: `SOURCE: Hering's Guiding Symptoms of Our Materia Medica\n\n${text}`,
      metadata: { book: "Hering Guiding Symptoms", author: "Constantine Hering" },
    });
    total++;
    console.log("");
    await sleep(150);
  }
  console.log(`\n  → Scraped ${total} Hering entries\n`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log("\n🌿 NeoHomeo AI — Full Books Ingestion\n");
console.log("Sources: Boericke MM, Organon, Kent Lectures, Nash Leaders,");
console.log("         Allen Keynotes, Chronic Diseases, Hering Guiding Symptoms\n");

await scrapeBoericke();
await scrapeOrganon();
await scrapeKentLectures();
await scrapeNash();
await scrapeAllen();
await scrapeChronicDiseases();
await scrapeHering();

// Final count
const { data } = await supabase.from("knowledge_documents").select("source", { count: "exact" });
const counts = {};
(data || []).forEach(r => counts[r.source] = (counts[r.source]||0)+1);
console.log("\n📊 Final Knowledge Base:\n");
Object.entries(counts).forEach(([k,v]) => console.log(`  ${k}: ${v} documents`));
console.log(`  TOTAL: ${Object.values(counts).reduce((a,b)=>a+b,0)} documents\n`);
