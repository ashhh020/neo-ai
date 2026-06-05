/**
 * Scrape remaining books: Clarke, Hering, Allen, Kent MM + fix Organon aphorisms
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
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

async function clean(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, " ").replace(/&[a-z]+;/g, " ")
    .replace(/\s{3,}/g, "\n\n").trim();
}

async function fetchHtml(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    return r.ok ? r.text() : null;
  } catch { return null; }
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrapeBook(baseUrl, bookName, author, source) {
  console.log(`\n📚 ${bookName}...`);
  let total = 0;
  for (const letter of LETTERS) {
    const idxHtml = await fetchHtml(`${baseUrl}/${letter}.htm`);
    if (!idxHtml) continue;
    const links = [...new Set(
      [...idxHtml.matchAll(new RegExp(`href="(${letter}/[^"]+\\.htm)"`, "gi"))].map(m => m[1])
    )];
    for (const link of links) {
      const html = await fetchHtml(`${baseUrl}/${link}`);
      if (!html) continue;
      const text = await clean(html);
      if (text.length < 200) continue;
      const title = text.split("\n").find(l => l.trim().length > 5)?.trim().slice(0, 100) || link;
      const { error } = await supabase.from("knowledge_documents").upsert({
        source, category: title,
        title: `${bookName}: ${title}`,
        content: `SOURCE: ${bookName} by ${author}\n\n${text.slice(0, 14000)}`,
        metadata: { book: bookName, author, link }
      }, { onConflict: "title" });
      process.stdout.write(error ? "x" : ".");
      total++;
      await sleep(100);
    }
  }
  console.log(`\n  → ${total} pages`);
  return total;
}

// ─── BOOKS ────────────────────────────────────────────────────────────────────
const books = [
  ["http://www.homeoint.org/clarke",    "Clarke's Dictionary of Practical Materia Medica", "John Henry Clarke",   "materia_medica"],
  ["http://www.homeoint.org/hering",    "Hering's Guiding Symptoms",                        "Constantine Hering",  "materia_medica"],
  ["http://www.homeoint.org/allen",     "Allen's Encyclopedia of Pure Materia Medica",       "Timothy F. Allen",    "materia_medica"],
  ["http://www.homeoint.org/kent",      "Kent's Materia Medica",                             "James Tyler Kent",    "materia_medica"],
];

let grand = 0;
for (const [url, name, author, src] of books) {
  grand += await scrapeBook(url, name, author, src);
}

// ─── ORGANON — Individual aphorisms ──────────────────────────────────────────
console.log("\n📖 Organon — individual aphorisms...");
let aphCount = 0;
const pages = [1, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280];
for (const n of pages) {
  const url = `http://www.homeoint.org/books/hahorgan/organ${String(n).padStart(3, "0")}.htm`;
  const html = await fetchHtml(url);
  if (!html) continue;
  const text = await clean(html);
  const lines = text.split("\n");
  let cur = "", num = null;
  const aphs = [];
  for (const line of lines) {
    const m = line.match(/§\s*(\d+)/);
    if (m) {
      if (num !== null && cur.trim().length > 30) aphs.push({ num, text: cur.trim() });
      num = parseInt(m[1]); cur = line + "\n";
    } else if (num !== null) cur += line + "\n";
  }
  if (num !== null && cur.trim().length > 30) aphs.push({ num, text: cur.trim() });

  for (const a of aphs) {
    const { error } = await supabase.from("knowledge_documents").upsert({
      source: "organon",
      category: `Aphorism §${a.num}`,
      title: `Organon §${a.num} (Hahnemann 6th Ed.)`,
      content: `SOURCE: Organon of Medicine — Samuel Hahnemann, 6th Edition\nAPHORISM §${a.num}\n\n${a.text}`,
      metadata: { aphorism: a.num, book: "Organon", author: "Hahnemann" }
    }, { onConflict: "title" });
    process.stdout.write(error ? "x" : ".");
    aphCount++;
  }
  await sleep(250);
}
console.log(`\n  → ${aphCount} individual Organon aphorisms`);

// ─── FINAL COUNT ──────────────────────────────────────────────────────────────
const { data } = await supabase.from("knowledge_documents").select("source");
const counts = {};
(data || []).forEach(r => counts[r.source] = (counts[r.source] || 0) + 1);
const total = Object.values(counts).reduce((a, b) => a + b, 0);

console.log("\n\n📊 FINAL KNOWLEDGE BASE:");
console.log("─".repeat(40));
Object.entries(counts).forEach(([k, v]) => console.log(`  ${k.padEnd(22)} ${v} docs`));
console.log(`  ${"TOTAL".padEnd(22)} ${total} docs`);
console.log("─".repeat(40));
