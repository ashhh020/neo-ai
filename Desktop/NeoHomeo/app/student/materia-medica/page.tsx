"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, BookOpen, X, ChevronRight, Leaf, Gem, Shell,
  FlaskConical, Loader2, ExternalLink, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Remedy {
  id: string;
  abbrev: string;
  remedy_slug: string;
  remedy_abbrev: string;
  name: string;
  intro: string;
  category: string;
  year: number;
  author: string;
  title: string;
  sections?: Record<string, string>;
  source_url?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTHORS = [
  {
    abbrev: "boericke",
    label: "Boericke",
    fullname: "William Boericke",
    title: "Pocket Manual of Homoeopathic Materia Medica",
    year: 1906,
    color: "#4e73df",
    badge: "619 remedies",
  },
  {
    abbrev: "allen",
    label: "H.C. Allen",
    fullname: "Henry C. Allen",
    title: "Keynotes and Characteristics",
    year: 1898,
    color: "#8A2BE2",
    badge: "184 remedies",
  },
  {
    abbrev: "kent",
    label: "Kent",
    fullname: "James Tyler Kent",
    title: "Lectures on Homoeopathic Materia Medica",
    year: 1905,
    color: "#10b981",
    badge: "96 remedies",
  },
  {
    abbrev: "clarke",
    label: "Clarke",
    fullname: "John Henry Clarke",
    title: "Dictionary of Practical Materia Medica",
    year: 1900,
    color: "#f97316",
    badge: "975 remedies",
  },
  {
    abbrev: "bogsk",
    label: "Boger",
    fullname: "Cyrus Maxwell Boger",
    title: "Synoptic Key of the Materia Medica",
    year: 1915,
    color: "#ef4444",
    badge: "217 remedies",
  },
] as const;

type AuthorAbbrev = typeof AUTHORS[number]["abbrev"];

const CATEGORIES = ["all", "plant", "mineral", "animal", "nosode"] as const;

const CATEGORY_META: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  plant:   { color: "#5BB85A", bg: "rgba(91,184,90,0.1)",   icon: <Leaf className="h-3 w-3" /> },
  mineral: { color: "#4e73df", bg: "rgba(78,115,223,0.1)",  icon: <Gem className="h-3 w-3" /> },
  animal:  { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  icon: <Shell className="h-3 w-3" /> },
  nosode:  { color: "#8A2BE2", bg: "rgba(138,43,226,0.1)",  icon: <FlaskConical className="h-3 w-3" /> },
};

const SECTION_PRIORITY = [
  "Introduction", "Full Text",
  "Mind", "Mental", "Head", "Eyes", "Ears", "Nose", "Face", "Mouth",
  "Tongue", "Throat", "Stomach", "Abdomen", "Rectum", "Stool",
  "Urinary", "Urine", "Male", "Female", "Respiratory", "Chest",
  "Heart", "Back", "Extremities", "Sleep", "Fever", "Skin",
  "Modalities", "Dose", "Relations", "Complementary",
  "Clinical", "Characteristics",
];

function sortSections(sections: Record<string, string>) {
  const ordered: Array<[string, string]> = [];
  for (const key of SECTION_PRIORITY) {
    if (sections[key]) ordered.push([key, sections[key]]);
  }
  for (const [k, v] of Object.entries(sections)) {
    if (!SECTION_PRIORITY.includes(k)) ordered.push([k, v]);
  }
  return ordered;
}

// ─── Remedy Card ─────────────────────────────────────────────────────────────

function RemedyCard({
  remedy,
  authorColor,
  onClick,
}: {
  remedy: Remedy;
  authorColor: string;
  onClick: () => void;
}) {
  const meta = CATEGORY_META[remedy.category] ?? CATEGORY_META.plant;
  return (
    <button
      onClick={onClick}
      className="text-left w-full rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: "rgba(255,255,255,0.55)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: "var(--text-obsidian)" }}>
            {remedy.name}
          </p>
          {remedy.remedy_abbrev && (
            <p className="text-[11px] font-mono-neo" style={{ color: "var(--text-dim)" }}>
              {remedy.remedy_abbrev}
            </p>
          )}
        </div>
        <span
          className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
          style={{ background: meta.bg, color: meta.color }}
        >
          {meta.icon}{remedy.category}
        </span>
      </div>
      {remedy.intro && (
        <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: "var(--text-dim)" }}>
          {remedy.intro}
        </p>
      )}
    </button>
  );
}

// ─── Remedy Detail Modal ──────────────────────────────────────────────────────

function RemedyDetail({
  remedy,
  authorColor,
  onClose,
}: {
  remedy: Remedy;
  authorColor: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<Remedy | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const meta = CATEGORY_META[remedy.category] ?? CATEGORY_META.plant;

  useEffect(() => {
    fetch(`/api/mm?id=${encodeURIComponent(remedy.id)}`)
      .then((r) => r.json())
      .then((d) => setDetail(d.remedy ?? remedy))
      .catch(() => setDetail(remedy))
      .finally(() => setLoadingDetail(false));
  }, [remedy.id]);

  const r = detail ?? remedy;
  const sections = r.sections ? sortSections(r.sections) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="m-auto w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: "var(--silica-bg)", border: "1px solid var(--glass-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4" style={{ borderBottom: "1px solid var(--glass-border)" }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="text-xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.02em" }}>
                {r.name}
              </h2>
              <span
                className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: meta.bg, color: meta.color }}
              >
                {meta.icon}{r.category}
              </span>
            </div>
            {r.remedy_abbrev && (
              <p className="text-sm font-mono-neo" style={{ color: "var(--text-dim)" }}>{r.remedy_abbrev}</p>
            )}
            <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
              {r.author} · {r.title} ({r.year})
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {r.source_url && (
              <a
                href={r.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl hover:bg-white/40 transition-colors"
                style={{ color: "var(--text-dim)" }}
                title="View original source"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/40 transition-colors" style={{ color: "var(--text-dim)" }}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Intro */}
        {r.intro && (
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--glass-border)", background: `${authorColor}08` }}>
            <p className="text-sm leading-relaxed italic" style={{ color: "var(--text-obsidian)" }}>
              {r.intro.slice(0, 400)}{r.intro.length > 400 ? "…" : ""}
            </p>
          </div>
        )}

        {loadingDetail ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: authorColor }} />
          </div>
        ) : (
          <>
            {/* Section tabs */}
            {sections.length > 1 && (
              <div
                className="flex gap-1.5 px-6 py-3 overflow-x-auto scrollbar-thin flex-shrink-0"
                style={{ borderBottom: "1px solid var(--glass-border)" }}
              >
                <button
                  onClick={() => setActiveSection(null)}
                  className="px-3 py-1 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
                  style={{
                    background: activeSection === null ? authorColor : "rgba(255,255,255,0.5)",
                    color: activeSection === null ? "white" : "var(--text-dim)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  All
                </button>
                {sections.map(([heading]) => (
                  <button
                    key={heading}
                    onClick={() => setActiveSection(activeSection === heading ? null : heading)}
                    className="px-3 py-1 rounded-xl text-xs font-semibold flex-shrink-0 transition-all"
                    style={{
                      background: activeSection === heading ? authorColor : "rgba(255,255,255,0.5)",
                      color: activeSection === heading ? "white" : "var(--text-dim)",
                      border: `1px solid ${activeSection === heading ? authorColor : "var(--glass-border)"}`,
                    }}
                  >
                    {heading}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
              {sections.length > 0 ? (
                sections
                  .filter(([h]) => activeSection === null || h === activeSection)
                  .map(([heading, content]) => (
                    <div key={heading}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: authorColor }}>
                        {heading}
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-obsidian)" }}>
                        {content}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-center py-8" style={{ color: "var(--text-dim)" }}>
                  Full text shown in introduction above.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MateriaMedicaPage() {
  const [author, setAuthor] = useState<AuthorAbbrev>("boericke");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [results, setResults] = useState<Remedy[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Remedy | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const PER_PAGE = 60;
  const activeAuthor = AUTHORS.find((a) => a.abbrev === author)!;

  // Fetch author counts on mount
  useEffect(() => {
    fetch("/api/mm?stats=1")
      .then((r) => r.json())
      .then((d) => d.counts && setCounts(d.counts))
      .catch(() => {});
  }, []);

  const fetchRemedies = useCallback(
    async (p = 0) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          author,
          limit: String(PER_PAGE),
          page: String(p),
        });
        if (search.trim()) params.set("q", search.trim());
        if (category !== "all") params.set("category", category);

        const res = await fetch(`/api/mm?${params}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load");

        if (p === 0) {
          setResults(json.results ?? []);
        } else {
          setResults((prev) => [...prev, ...(json.results ?? [])]);
        }
        setTotal(json.total ?? 0);
        setPage(p);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [author, search, category]
  );

  // Reload when author or category changes
  useEffect(() => {
    setPage(0);
    setResults([]);
    fetchRemedies(0);
  }, [author, category]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      setResults([]);
      fetchRemedies(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {selected && (
        <RemedyDetail
          remedy={selected}
          authorColor={activeAuthor.color}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Header */}
      <div className="mb-5">
        <h1
          className="text-2xl font-extrabold mb-0.5"
          style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}
        >
          Materia Medica
        </h1>
        <p className="text-sm font-mono-neo" style={{ color: "var(--text-dim)" }}>
          Public domain · 5 classical authors · ~2,100 remedies
        </p>
      </div>

      {/* Author tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {AUTHORS.map((a) => {
          const active = author === a.abbrev;
          const count = counts[a.abbrev] ?? null;
          return (
            <button
              key={a.abbrev}
              onClick={() => {
                setAuthor(a.abbrev);
                setSearch("");
                setCategory("all");
              }}
              className="flex flex-col items-start px-4 py-2.5 rounded-2xl transition-all"
              style={{
                background: active ? a.color : "rgba(255,255,255,0.6)",
                color: active ? "white" : "var(--text-obsidian)",
                border: `1.5px solid ${active ? a.color : "var(--glass-border)"}`,
                minWidth: "110px",
              }}
            >
              <span className="font-bold text-sm">{a.label}</span>
              <span className="text-[10px] opacity-75 mt-0.5">
                {count !== null ? `${count} remedies` : a.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Author info strip */}
      <div
        className="mb-4 px-4 py-2.5 rounded-2xl"
        style={{ background: `${activeAuthor.color}12`, border: `1px solid ${activeAuthor.color}30` }}
      >
        <span className="font-semibold text-sm" style={{ color: activeAuthor.color }}>
          {activeAuthor.fullname}
        </span>
        <span className="text-xs ml-2" style={{ color: "var(--text-dim)" }}>
          · {activeAuthor.title} ({activeAuthor.year}) · Public Domain
        </span>
      </div>

      {/* Search + category filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-56">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "var(--text-dim)" }}
          />
          <input
            type="text"
            placeholder="Search by remedy name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-2xl pl-10 pr-4 text-sm font-medium outline-none"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-obsidian)",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-dim)" }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-3 py-2 rounded-2xl text-xs font-semibold transition-all capitalize flex items-center gap-1.5"
                style={{
                  background: active ? (meta?.color ?? activeAuthor.color) : "rgba(255,255,255,0.6)",
                  color: active ? "white" : "var(--text-dim)",
                  border: `1px solid ${active ? (meta?.color ?? activeAuthor.color) : "var(--glass-border)"}`,
                }}
              >
                {meta?.icon}{cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      {!loading && !error && total > 0 && (
        <p className="text-xs mb-4 font-mono-neo" style={{ color: "var(--text-dim)" }}>
          {total.toLocaleString()} remedies · showing {results.length}
        </p>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl mb-4"
          style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: "#ef4444" }}>
              Database not seeded yet
            </p>
            <p className="text-xs mt-1" style={{ color: "#7f1d1d" }}>
              Run <code className="bg-red-100 px-1 rounded">scripts/create-mm-table.sql</code> in Supabase SQL Editor, then wait for the seeder script to complete.
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading && results.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: activeAuthor.color }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
          {results.map((remedy) => (
            <RemedyCard
              key={remedy.id}
              remedy={remedy}
              authorColor={activeAuthor.color}
              onClick={() => setSelected(remedy)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && !error && (
        <div className="text-center py-20" style={{ color: "var(--text-dim)" }}>
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No remedies found</p>
          {search && (
            <p className="text-xs mt-1">
              Try &ldquo;sulph&rdquo; or &ldquo;aconite&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Load more */}
      {results.length > 0 && results.length < total && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => fetchRemedies(page + 1)}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-40"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-obsidian)",
            }}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Load more ({total - results.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
