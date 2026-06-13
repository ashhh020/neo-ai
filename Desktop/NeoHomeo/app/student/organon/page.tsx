"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Search, ChevronLeft, ChevronRight, MessageCircle, BookMarked, Scroll, Layers } from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────

interface AphorismRow {
  id: string;
  source_abbrev: string;
  aphorism_num: number;
  title: string;
  content: string;
  footnotes?: string | null;
}

interface PhilosophyChapter {
  id: string;
  book_abbrev: string;
  chapter_num: number;
  chapter_title: string;
  content?: string;
}

// ─── meta ────────────────────────────────────────────────────────────────────

const SOURCE_META: Record<string, { label: string; color: string; short: string; primary?: boolean }> = {
  hahnemann6: { label: "6th Edition — Boericke Translation", color: "#4e73df", short: "H6", primary: true },
  hahnemann5: { label: "5th Edition — Dudgeon Translation", color: "#6a5acd", short: "H5" },
  outline:    { label: "Outline (Julian Winston)", color: "#20c997", short: "OL" },
  kent_lectures: { label: "Kent's Lectures", color: "#e67e22", short: "KL" },
  das:        { label: "A.K. Das Commentary", color: "#e74c3c", short: "AD" },
};

// Sources that are "other editions / commentary" (not the primary)
const OTHER_SOURCES = ["hahnemann5", "outline", "kent_lectures", "das"];

const BOOK_META: Record<string, { label: string; author: string; color: string }> = {
  roberts: { label: "The Art of Cure", author: "H.A. Roberts", color: "#e67e22" },
  close:   { label: "Genius of Homeopathy", author: "Stuart Close", color: "#9b59b6" },
  dhawale: { label: "Principles & Practice", author: "M.L. Dhawale", color: "#3498db" },
  hughes:  { label: "Principals & Practice", author: "Richard Hughes", color: "#27ae60" },
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function renderText(text: string) {
  if (!text) return null;
  return text.split("\n\n").map((para, i) => (
    <p key={i} className="mb-4 leading-relaxed" style={{ color: "var(--text-obsidian)", fontSize: "0.95rem" }}>
      {para.replace(/\n/g, " ")}
    </p>
  ));
}

// ─── main component ──────────────────────────────────────────────────────────

export default function OrganonPage() {
  const [tab, setTab] = useState<"organon" | "philosophy">("organon");

  // organon state — aphNums is a flat sorted number[] of H6 aphorism numbers
  const [aphNums, setAphNums] = useState<number[]>([]);
  const [currentNum, setCurrentNum] = useState(1);
  const [aphorismRows, setAphorismRows] = useState<AphorismRow[]>([]);
  // Edition toggle: "6th" | "5th" | "both"
  const [edition, setEdition] = useState<"6th" | "5th" | "both">("6th");
  // Derived active sources from edition selection + optional commentary
  const editionSources = edition === "6th" ? ["hahnemann6"] : edition === "5th" ? ["hahnemann5"] : ["hahnemann6","hahnemann5"];
  const [activeSources, setActiveSources] = useState<string[]>(["hahnemann6"]);
  const [showOtherEditions, setShowOtherEditions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AphorismRow[] | null>(null);
  const [loadingAph, setLoadingAph] = useState(true);

  // philosophy state
  const [allChapters, setAllChapters] = useState<PhilosophyChapter[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<PhilosophyChapter | null>(null);
  const [chapterContent, setChapterContent] = useState<string>("");
  const [loadingPhi, setLoadingPhi] = useState(false);

  // Navigation grid — use aphNums once loaded, fallback to 1-291
  const allNums = aphNums.length ? aphNums : Array.from({ length: 291 }, (_, i) => i + 1);
  const maxNum = allNums[allNums.length - 1] ?? 291;

  // load aphorism content — always includes edition sources + any extra commentary
  const loadAphorism = useCallback(async (num: number, overrideSources?: string[]) => {
    setLoadingAph(true);
    setSearchResults(null);
    const sources = (overrideSources ?? activeSources).join(",");
    const r = await fetch(`/api/organon?type=aphorism&num=${num}&sources=${sources}`);
    const d = await r.json();
    setAphorismRows(d.rows ?? []);
    setCurrentNum(num);
    setLoadingAph(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSources]);

  // On mount: load §1 immediately AND fetch number index in parallel
  useEffect(() => {
    loadAphorism(1, ["hahnemann6"]);
    fetch("/api/organon?type=aphorism")
      .then(r => r.json())
      .then(d => setAphNums((d.nums as number[] | undefined) ?? []));
    fetch("/api/organon?type=philosophy")
      .then(r => r.json())
      .then(d => setAllChapters(d.chapters ?? []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When edition toggle changes, merge edition sources with commentary sources and reload
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    const commentarySources = activeSources.filter(s => !s.startsWith("hahnemann"));
    const merged = [...editionSources, ...commentarySources];
    setActiveSources(merged);
    loadAphorism(currentNum, merged);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edition]);

  useEffect(() => {
    if (mounted && tab === "organon") loadAphorism(currentNum);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // search
  async function handleSearch(q: string) {
    if (!q.trim()) { setSearchResults(null); return; }
    setLoadingAph(true);
    const r = await fetch(`/api/organon?type=aphorism&search=${encodeURIComponent(q)}`);
    const d = await r.json();
    setSearchResults(d.rows ?? []);
    setLoadingAph(false);
  }

  // load philosophy chapter
  async function loadChapter(chapter: PhilosophyChapter) {
    setSelectedChapter(chapter);
    setLoadingPhi(true);
    const r = await fetch(`/api/organon?type=philosophy&book=${chapter.book_abbrev}&chapter=${chapter.chapter_num}`);
    const d = await r.json();
    setChapterContent(d.chapter?.content ?? "No content available.");
    setLoadingPhi(false);
  }

  function toggleSource(src: string) {
    if (src === "hahnemann6") return; // always active
    setActiveSources(prev =>
      prev.includes(src)
        ? prev.filter(s => s !== src)
        : [...prev, src]
    );
  }

  const bookChapters = selectedBook
    ? allChapters.filter(c => c.book_abbrev === selectedBook)
    : [];

  const books = Object.keys(BOOK_META).filter(b =>
    allChapters.some(c => c.book_abbrev === b)
  );

  // ─── render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--silica-bg)" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b" style={{ borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#4e73df,#9b59b6)" }}>
            <Scroll className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
              Organon & Philosophy
            </h1>
            <p className="text-xs" style={{ color: "var(--text-dim)" }}>
              Primary: Hahnemann 6th Ed. · Commentary: Kent, Das · Philosophy: Roberts, Close, Dhawale
            </p>
          </div>
        </div>

        {/* Main tabs + edition toggle on same row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Organon / Philosophy tabs */}
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "rgba(0,0,0,0.04)" }}>
            {(["organon", "philosophy"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
                style={tab === t
                  ? { background: "linear-gradient(135deg,#4e73df,#9b59b6)", color: "#fff" }
                  : { color: "var(--text-dim)" }}
              >
                {t === "organon" ? "📜 Organon" : "📚 Philosophy"}
              </button>
            ))}
          </div>

          {/* Edition toggle — only visible on Organon tab */}
          {tab === "organon" && (
            <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "rgba(0,0,0,0.04)" }}>
              {([
                { key: "6th", label: "6th Edition" },
                { key: "5th", label: "5th Edition" },
                { key: "both", label: "Both" },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setEdition(key)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={edition === key
                    ? { background: key === "6th" ? "#4e73df" : key === "5th" ? "#6a5acd" : "linear-gradient(135deg,#4e73df,#6a5acd)", color: "#fff" }
                    : { color: "var(--text-dim)" }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Edition subtitle */}
        {tab === "organon" && (
          <p className="text-[10px] mt-1.5 font-medium" style={{ color: "var(--text-dim)" }}>
            {edition === "6th" && "6th Edition · Boericke Translation (1921)"}
            {edition === "5th" && "5th Edition · Dudgeon Translation (1893)"}
            {edition === "both" && "Showing both editions side-by-side — differences highlighted"}
          </p>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ═══ ORGANON TAB ═══════════════════════════════════════════════════ */}
        {tab === "organon" && (
          <>
            {/* Left sidebar — aphorism navigator */}
            <div className="hidden md:flex w-56 flex-shrink-0 flex-col border-r overflow-hidden"
              style={{ borderColor: "var(--glass-border)" }}>

              {/* Search */}
              <div className="p-3 border-b" style={{ borderColor: "var(--glass-border)" }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-dim)" }} />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch(searchQuery)}
                    placeholder="Search aphorisms…"
                    className="w-full rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none"
                    style={{ background: "rgba(0,0,0,0.04)", color: "var(--text-obsidian)" }}
                  />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    className="mt-1.5 w-full text-xs font-semibold py-1 rounded-lg"
                    style={{ background: "linear-gradient(135deg,#4e73df,#9b59b6)", color: "#fff" }}
                  >
                    Search
                  </button>
                )}
              </div>

              {/* Commentary sources (editions handled by top toggle) */}
              <div className="p-2 border-b" style={{ borderColor: "var(--glass-border)" }}>
                <p className="text-[10px] font-mono-neo uppercase tracking-widest mb-1.5 px-1" style={{ color: "var(--text-dim)" }}>
                  + Add Commentary
                </p>
                <div className="flex flex-col gap-1">
                  {OTHER_SOURCES.filter(k => !k.startsWith("hahnemann")).map(key => {
                    const meta = SOURCE_META[key];
                    const on = activeSources.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleSource(key)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-left"
                        style={on
                          ? { background: meta.color + "18", color: meta.color, border: `1px solid ${meta.color}40` }
                          : { color: "var(--text-dim)", border: "1px solid transparent" }}
                      >
                        <span className="w-6 h-6 flex items-center justify-center rounded-md font-mono font-bold text-[10px] flex-shrink-0"
                          style={{ background: meta.color + "20", color: meta.color }}>
                          {meta.short}
                        </span>
                        <span className="truncate">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aphorism list */}
              <div className="flex-1 overflow-y-auto p-2">
                <p className="text-[10px] font-mono-neo uppercase tracking-widest mb-1.5 px-1" style={{ color: "var(--text-dim)" }}>
                  Aphorisms ({allNums.length})
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {allNums.map(n => (
                    <button
                      key={n}
                      onClick={() => loadAphorism(n)}
                      className="h-7 rounded-lg text-xs font-bold transition-all"
                      style={currentNum === n && !searchResults
                        ? { background: "linear-gradient(135deg,#4e73df,#9b59b6)", color: "#fff" }
                        : { background: "rgba(0,0,0,0.04)", color: "var(--text-dim)" }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Mobile: nav bar */}
              <div className="flex items-center gap-2 mb-4 md:hidden">
                <button onClick={() => loadAphorism(Math.max(1, currentNum - 1))}
                  className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center text-sm font-bold" style={{ color: "var(--text-obsidian)" }}>
                  §{currentNum}
                </span>
                <button onClick={() => loadAphorism(Math.min(maxNum, currentNum + 1))}
                  className="p-2 rounded-xl" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Search results mode */}
              {searchResults !== null ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold" style={{ color: "var(--text-obsidian)" }}>
                      Search Results ({searchResults.length})
                    </h2>
                    <button onClick={() => setSearchResults(null)}
                      className="text-xs font-semibold px-3 py-1 rounded-xl"
                      style={{ background: "rgba(0,0,0,0.06)", color: "var(--text-dim)" }}>
                      Clear
                    </button>
                  </div>
                  {searchResults.length === 0 ? (
                    <p style={{ color: "var(--text-dim)" }}>No aphorisms found.</p>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map(row => {
                        const meta = SOURCE_META[row.source_abbrev];
                        return (
                          <div key={row.id} className="shard p-4 cursor-pointer hover:shadow-md transition-all"
                            onClick={() => { loadAphorism(row.aphorism_num); setSearchResults(null); }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: (meta?.color ?? "#888") + "18", color: meta?.color ?? "#888" }}>
                                §{row.aphorism_num}
                              </span>
                              <span className="text-xs" style={{ color: "var(--text-dim)" }}>{meta?.label}</span>
                            </div>
                            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "var(--text-obsidian)" }}>
                              {row.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Aphorism view */
                <div>
                  {/* Navigation header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
                        §{currentNum}
                      </h2>
                      <div className="hidden md:flex items-center gap-1">
                        <button onClick={() => loadAphorism(Math.max(1, currentNum - 1))}
                          disabled={currentNum <= 1}
                          className="p-1.5 rounded-lg disabled:opacity-30 transition-all"
                          style={{ background: "rgba(0,0,0,0.06)" }}>
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={() => loadAphorism(Math.min(maxNum, currentNum + 1))}
                          disabled={currentNum >= maxNum}
                          className="p-1.5 rounded-lg disabled:opacity-30 transition-all"
                          style={{ background: "rgba(0,0,0,0.06)" }}>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <a
                      href={`/student/chat?q=${encodeURIComponent(`Explain Organon §${currentNum} by Hahnemann in clinical context`)}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: "linear-gradient(135deg,#4e73df,#9b59b6)", color: "#fff" }}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Ask Hahnemann AI
                    </a>
                  </div>

                  {loadingAph ? (
                    <div className="flex items-center gap-2 py-10" style={{ color: "var(--text-dim)" }}>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Loading…
                    </div>
                  ) : aphorismRows.length === 0 ? (
                    <div className="shard p-6 text-center">
                      <p style={{ color: "var(--text-dim)" }}>No content for §{currentNum} in selected sources.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aphorismRows.map(row => {
                        const meta = SOURCE_META[row.source_abbrev];
                        return (
                          <div key={row.id} className="shard overflow-hidden">
                            {/* Source badge */}
                            <div className="flex items-center gap-2 px-5 py-3 border-b"
                              style={{ borderColor: "var(--glass-border)", background: (meta?.color ?? "#888") + "08" }}>
                              <span className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-extrabold"
                                style={{ background: (meta?.color ?? "#888") + "20", color: meta?.color ?? "#888" }}>
                                {meta?.short ?? "?"}
                              </span>
                              <span className="font-semibold text-sm" style={{ color: "var(--text-obsidian)" }}>
                                {meta?.label ?? row.source_abbrev}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                              {row.title && row.title !== `§${currentNum}` && (
                                <h3 className="font-bold mb-3 text-sm" style={{ color: "var(--text-dim)" }}>
                                  {row.title}
                                </h3>
                              )}
                              {renderText(row.content)}

                              {row.footnotes && (
                                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--glass-border)" }}>
                                  <p className="text-[10px] font-mono-neo uppercase tracking-widest mb-2"
                                    style={{ color: "var(--text-dim)" }}>Footnotes</p>
                                  <div className="text-sm italic" style={{ color: "var(--text-dim)" }}>
                                    {renderText(row.footnotes)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══ PHILOSOPHY TAB ══════════════════════════════════════════════ */}
        {tab === "philosophy" && (
          <>
            {/* Left — book list */}
            <div className="hidden md:flex w-56 flex-shrink-0 flex-col border-r overflow-hidden"
              style={{ borderColor: "var(--glass-border)" }}>
              <div className="p-3 border-b" style={{ borderColor: "var(--glass-border)" }}>
                <p className="text-[10px] font-mono-neo uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
                  Philosophy Books
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {books.map(b => {
                  const meta = BOOK_META[b];
                  const isActive = selectedBook === b;
                  return (
                    <button key={b}
                      onClick={() => { setSelectedBook(b); setSelectedChapter(null); setChapterContent(""); }}
                      className="w-full text-left px-3 py-2.5 rounded-xl transition-all"
                      style={isActive
                        ? { background: (meta.color) + "18", border: `1px solid ${meta.color}40` }
                        : { border: "1px solid transparent" }}>
                      <p className="text-xs font-bold truncate" style={{ color: isActive ? meta.color : "var(--text-obsidian)" }}>
                        {meta.label}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-dim)" }}>{meta.author}</p>
                    </button>
                  );
                })}
              </div>

              {/* Chapter list */}
              {selectedBook && bookChapters.length > 0 && (
                <div className="border-t flex-1 overflow-y-auto p-2"
                  style={{ borderColor: "var(--glass-border)" }}>
                  <p className="text-[10px] font-mono-neo uppercase tracking-widest mb-1.5 px-1"
                    style={{ color: "var(--text-dim)" }}>Chapters</p>
                  <div className="space-y-0.5">
                    {bookChapters.map(ch => (
                      <button key={ch.id}
                        onClick={() => loadChapter(ch)}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all"
                        style={selectedChapter?.id === ch.id
                          ? { background: "rgba(78,115,223,0.12)", color: "#4e73df", fontWeight: 600 }
                          : { color: "var(--text-dim)" }}>
                        {ch.chapter_num > 0 && (
                          <span className="font-mono mr-1">{ch.chapter_num}.</span>
                        )}
                        <span className="truncate">{ch.chapter_title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {!selectedBook ? (
                /* Book picker cards */
                <div>
                  <h2 className="font-extrabold text-lg mb-4" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
                    Homeopathic Philosophy
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {books.map(b => {
                      const meta = BOOK_META[b];
                      const chCount = allChapters.filter(c => c.book_abbrev === b).length;
                      return (
                        <button key={b}
                          onClick={() => setSelectedBook(b)}
                          className="shard p-5 text-left hover:shadow-lg transition-all">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                            style={{ background: meta.color + "18" }}>
                            <BookMarked className="h-5 w-5" style={{ color: meta.color }} />
                          </div>
                          <h3 className="font-bold mb-0.5" style={{ color: "var(--text-obsidian)" }}>{meta.label}</h3>
                          <p className="text-xs mb-2" style={{ color: "var(--text-dim)" }}>by {meta.author}</p>
                          <p className="text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit"
                            style={{ background: meta.color + "12", color: meta.color }}>
                            {chCount} chapters
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : !selectedChapter ? (
                /* Chapter list cards (mobile fallback / desktop center) */
                <div>
                  <button onClick={() => setSelectedBook(null)}
                    className="flex items-center gap-1 text-sm mb-4 font-semibold"
                    style={{ color: "var(--text-dim)" }}>
                    <ChevronLeft className="h-4 w-4" /> Books
                  </button>
                  <h2 className="font-extrabold text-lg mb-1" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
                    {BOOK_META[selectedBook]?.label}
                  </h2>
                  <p className="text-sm mb-5" style={{ color: "var(--text-dim)" }}>
                    by {BOOK_META[selectedBook]?.author}
                  </p>
                  <div className="space-y-2">
                    {bookChapters.map(ch => (
                      <button key={ch.id}
                        onClick={() => loadChapter(ch)}
                        className="shard w-full text-left px-4 py-3 hover:shadow-md transition-all flex items-center gap-3">
                        {ch.chapter_num > 0 && (
                          <span className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: (BOOK_META[selectedBook]?.color ?? "#888") + "18",
                              color: BOOK_META[selectedBook]?.color ?? "#888" }}>
                            {ch.chapter_num}
                          </span>
                        )}
                        <span className="font-medium text-sm" style={{ color: "var(--text-obsidian)" }}>
                          {ch.chapter_title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Chapter reader */
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <button onClick={() => { setSelectedChapter(null); setChapterContent(""); }}
                      className="flex items-center gap-1 text-sm font-semibold"
                      style={{ color: "var(--text-dim)" }}>
                      <ChevronLeft className="h-4 w-4" />
                      {BOOK_META[selectedBook ?? ""]?.label}
                    </button>
                    <span style={{ color: "var(--text-dim)" }}>·</span>
                    <a
                      href={`/student/chat?q=${encodeURIComponent(`Discuss the concept: "${selectedChapter.chapter_title}" from ${BOOK_META[selectedBook ?? ""]?.author}`)}`}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl ml-auto"
                      style={{ background: "linear-gradient(135deg,#4e73df,#9b59b6)", color: "#fff" }}>
                      <MessageCircle className="h-3.5 w-3.5" />
                      Ask Hahnemann AI
                    </a>
                  </div>

                  <h2 className="text-xl font-extrabold mb-1" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
                    {selectedChapter.chapter_title}
                  </h2>
                  <p className="text-xs mb-6" style={{ color: "var(--text-dim)" }}>
                    {BOOK_META[selectedBook ?? ""]?.author} · {BOOK_META[selectedBook ?? ""]?.label}
                  </p>

                  {loadingPhi ? (
                    <div className="flex items-center gap-2 py-10" style={{ color: "var(--text-dim)" }}>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Loading…
                    </div>
                  ) : (
                    <div className="shard p-6 max-w-3xl">
                      {renderText(chapterContent)}
                    </div>
                  )}

                  {/* Next/Prev chapter */}
                  <div className="flex gap-3 mt-6">
                    {bookChapters.findIndex(c => c.id === selectedChapter.id) > 0 && (
                      <button
                        onClick={() => {
                          const idx = bookChapters.findIndex(c => c.id === selectedChapter.id);
                          loadChapter(bookChapters[idx - 1]);
                        }}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: "rgba(0,0,0,0.06)", color: "var(--text-dim)" }}>
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </button>
                    )}
                    {bookChapters.findIndex(c => c.id === selectedChapter.id) < bookChapters.length - 1 && (
                      <button
                        onClick={() => {
                          const idx = bookChapters.findIndex(c => c.id === selectedChapter.id);
                          loadChapter(bookChapters[idx + 1]);
                        }}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold ml-auto"
                        style={{ background: "linear-gradient(135deg,#4e73df,#9b59b6)", color: "#fff" }}>
                        Next <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
