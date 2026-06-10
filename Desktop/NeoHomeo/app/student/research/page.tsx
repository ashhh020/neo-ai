"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Book, Loader2 } from "lucide-react";

const SOURCES = [
  { id: "all", filter: "all", label: "All Sources", icon: "🔍", color: "#F59E0B" },
  { id: "mm", filter: "materia_medica", label: "Materia Medica", icon: "📖", color: "#4e73df" },
  { id: "organon", filter: "organon", label: "Organon", icon: "📜", color: "#4ECDC4" },
];

interface ResultItem {
  id: string;
  title: string;
  source: "materia_medica" | "organon";
  excerpt: string;
  author: string;
  pages: string;
}

const sourceColors: Record<string, string> = { materia_medica: "#4e73df", organon: "#4ECDC4" };
const sourceLabels: Record<string, string> = { materia_medica: "Materia Medica", organon: "Organon" };

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (q: string, f: string) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/research?q=${encodeURIComponent(q.trim())}&filter=${f}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search on query/filter change
  useEffect(() => {
    const t = setTimeout(() => runSearch(query, filter), 350);
    return () => clearTimeout(t);
  }, [query, filter, runSearch]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Research Library</h1>
        <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>Live full-text search across the Materia Medica &amp; Organon database</p>
      </div>

      {/* Search */}
      <div className="shard p-4 flex items-center gap-3">
        {loading ? (
          <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" style={{ color: "var(--accent-mineral)" }} />
        ) : (
          <Search className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-dim)" }} />
        )}
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search remedies, aphorisms, keywords… (e.g. sulphur, vital force, burning)"
          className="flex-1 bg-transparent outline-none text-sm font-medium" style={{ color: "var(--text-obsidian)" }} />
      </div>

      {/* Source filters */}
      <div className="flex gap-3 flex-wrap">
        {SOURCES.map((s) => (
          <button key={s.id} onClick={() => setFilter(s.filter)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all"
            style={{
              background: filter === s.filter ? s.color : "rgba(255,255,255,0.5)",
              color: filter === s.filter ? "white" : "var(--text-dim)",
              border: "1px solid var(--glass-border)",
            }}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {!query && (
        <div className="text-center py-20" style={{ color: "var(--text-dim)" }}>
          <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Search the classical literature</p>
          <p className="text-xs mt-1">Try &ldquo;sulphur&rdquo;, &ldquo;vital force&rdquo;, or &ldquo;§153&rdquo;</p>
        </div>
      )}

      {query && !loading && searched && results.length === 0 && (
        <div className="text-center py-20" style={{ color: "var(--text-dim)" }}>
          <Book className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-xs mt-1">Try a different keyword or source filter</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="text-xs font-mono-neo" style={{ color: "var(--text-dim)" }}>{results.length} results</p>
          <div className="space-y-4">
            {results.map((doc) => (
              <div key={doc.id} className="shard p-5 group">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${sourceColors[doc.source]}15` }}>
                    <Book className="h-4 w-4" style={{ color: sourceColors[doc.source] }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm mb-0.5" style={{ color: "var(--text-obsidian)" }}>{doc.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${sourceColors[doc.source]}15`, color: sourceColors[doc.source] }}>
                        {sourceLabels[doc.source]}
                      </span>
                      <span className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>— {doc.author}</span>
                      {doc.pages && <span className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>· {doc.pages}</span>}
                    </div>
                  </div>
                </div>
                <p className="text-xs leading-relaxed mt-3" style={{ color: "var(--text-dim)" }}>&ldquo;{doc.excerpt}&rdquo;</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
