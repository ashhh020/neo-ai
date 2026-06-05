"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Trash2, ChevronDown, ChevronUp, Save, BookOpen, X } from "lucide-react";
import { KENT_REPERTORY, CHAPTERS, searchRubrics, type Rubric } from "@/lib/repertory-data";

interface CaseRubric {
  rubricId: string;
  path: string;
  chapter: string;
  weight: 1 | 2 | 3;
  remedies: Rubric["remedies"];
}

interface RemedyScore {
  name: string;
  abbrev: string;
  score: number;
  count: number;
}

const gradeLabel = (g: number) => g === 3 ? "●●●" : g === 2 ? "●●" : "●";
const gradeStyle = (g: number): React.CSSProperties => ({
  color: g === 3 ? "#ef4444" : g === 2 ? "#4e73df" : "#9ca3af",
  fontWeight: g === 3 ? 700 : g === 2 ? 600 : 400,
});

const CHAPTER_COLORS: Record<string, string> = {
  Mind: "#8A2BE2", Head: "#4e73df", Eye: "#4ECDC4", Nose: "#F59E0B",
  Mouth: "#ef4444", Throat: "#10b981", Stomach: "#f97316", Abdomen: "#6366f1",
  Rectum: "#84cc16", Bladder: "#06b6d4", Female: "#ec4899", Respiratory: "#0ea5e9",
  Back: "#8b5cf6", Extremities: "#14b8a6", Sleep: "#a78bfa", Skin: "#fb923c",
  Generals: "#64748b",
};

export default function RepertoryPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Rubric[]>([]);
  const [searched, setSearched] = useState(false);
  const [activeChapter, setActiveChapter] = useState("All");
  const [caseRubrics, setCaseRubrics] = useState<CaseRubric[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [caseName, setCaseName] = useState("New Case");
  const [mmRubric, setMmRubric] = useState<Rubric | null>(null);

  function doSearch() {
    const q = query.trim();
    if (!q) return;
    let found = searchRubrics(q);
    if (activeChapter !== "All") found = found.filter(r => r.chapter === activeChapter);
    setResults(found);
    setSearched(true);
  }

  function addRubric(r: Rubric) {
    if (caseRubrics.find(c => c.rubricId === r.id)) return;
    setCaseRubrics(prev => [...prev, { rubricId: r.id, path: r.path, chapter: r.chapter, weight: 1, remedies: r.remedies }]);
  }

  function removeRubric(id: string) {
    setCaseRubrics(prev => prev.filter(r => r.rubricId !== id));
  }

  function setWeight(id: string, w: 1 | 2 | 3) {
    setCaseRubrics(prev => prev.map(r => r.rubricId === id ? { ...r, weight: w } : r));
  }

  const remedyScores: RemedyScore[] = useMemo(() => {
    const map: Record<string, RemedyScore> = {};
    for (const cr of caseRubrics) {
      for (const rem of cr.remedies) {
        if (!map[rem.name]) map[rem.name] = { name: rem.name, abbrev: rem.abbrev, score: 0, count: 0 };
        map[rem.name].score += rem.grade * cr.weight;
        map[rem.name].count += 1;
      }
    }
    return Object.values(map).sort((a, b) => b.score - a.score);
  }, [caseRubrics]);

  const gridRemedies = remedyScores.slice(0, 14);
  const quickSearches = ["fear death", "grief", "burning", "consolation agg", "hungry 11", "restless night", "weeping music", "jealousy", "thirstless", "constipation morning"];

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
            Repertory Tool
          </h1>
          <p className="text-sm font-mono-neo" style={{ color: "var(--text-dim)" }}>
            Kent Repertory · {KENT_REPERTORY.length} rubrics · multi-word search · exclusion with -word
          </p>
        </div>
        <div className="flex items-center gap-2">
          {caseRubrics.length > 0 && (
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-semibold text-sm gradient-mineral"
            >
              {showGrid ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showGrid ? "Hide" : "Show"} Grid
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="shard p-3 flex items-center gap-3">
        <Search className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-dim)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
          placeholder='e.g. "fear death" · "burning externally" · "grief" · -word to exclude'
          className="flex-1 bg-transparent outline-none text-sm font-medium"
          style={{ color: "var(--text-obsidian)" }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); setSearched(false); }} style={{ color: "var(--text-dim)" }}>
            <X className="h-4 w-4" />
          </button>
        )}
        <button onClick={doSearch} className="px-4 py-2 rounded-xl text-white font-semibold text-sm gradient-mineral flex-shrink-0">
          Search
        </button>
      </div>

      {/* Chapter filter */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...CHAPTERS].map(ch => (
          <button
            key={ch}
            onClick={() => setActiveChapter(ch)}
            className="px-3 py-1 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: activeChapter === ch ? (CHAPTER_COLORS[ch] ?? "var(--accent-mineral)") : "rgba(255,255,255,0.5)",
              color: activeChapter === ch ? "white" : "var(--text-dim)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {ch}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Search results */}
        <div className="lg:col-span-2 space-y-3">
          {!searched && (
            <div className="shard p-8 text-center">
              <div className="text-4xl mb-3">🗂️</div>
              <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>Search Kent Repertory</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
                {KENT_REPERTORY.length} rubrics across {CHAPTERS.length} chapters
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {quickSearches.map(s => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); setTimeout(doSearch, 0); }}
                    className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all hover:shadow-md"
                    style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-dim)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {searched && results.length === 0 && (
            <div className="shard p-8 text-center">
              <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>No rubrics found</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>Try fewer words or select a different chapter</p>
            </div>
          )}

          {searched && results.length > 0 && (
            <p className="text-xs font-mono-neo px-1" style={{ color: "var(--text-dim)" }}>
              {results.length} rubric{results.length !== 1 ? "s" : ""} found
            </p>
          )}

          {results.map(r => {
            const added = !!caseRubrics.find(c => c.rubricId === r.id);
            const chColor = CHAPTER_COLORS[r.chapter] ?? "var(--accent-mineral)";
            return (
              <div key={r.id} className="shard p-4 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${chColor}15`, color: chColor }}>
                        {r.chapter}
                      </span>
                      <span className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(0,0,0,0.04)", color: "var(--text-dim)" }}>
                        {r.section}
                      </span>
                    </div>
                    <p className="text-sm font-bold font-mono-neo leading-snug" style={{ color: "var(--text-obsidian)" }}>
                      {r.path}
                    </p>
                    <p className="text-[10px] font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>
                      {r.remedies.length} remedies
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => addRubric(r)}
                      disabled={added}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: "rgba(78,115,223,0.1)", color: "var(--accent-mineral)" }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {added ? "Added" : "Add to case"}
                    </button>
                    <button
                      onClick={() => setMmRubric(mmRubric?.id === r.id ? null : r)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: "rgba(138,43,226,0.08)", color: "#8A2BE2" }}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      MM info
                    </button>
                  </div>
                </div>

                {/* Remedy grade pills */}
                <div className="flex flex-wrap gap-1.5">
                  {r.remedies.sort((a, b) => b.grade - a.grade).map(rem => (
                    <span
                      key={rem.name}
                      title={rem.name}
                      className="text-[11px] px-2 py-0.5 rounded-lg font-mono-neo cursor-help"
                      style={{
                        background: "rgba(255,255,255,0.6)",
                        border: "1px solid var(--glass-border)",
                        ...gradeStyle(rem.grade),
                      }}
                    >
                      {rem.abbrev} {gradeLabel(rem.grade)}
                    </span>
                  ))}
                </div>

                {/* MM info panel */}
                {mmRubric?.id === r.id && (
                  <div className="mt-3 p-3 rounded-2xl" style={{ background: "rgba(138,43,226,0.05)", border: "1px solid rgba(138,43,226,0.15)" }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "#8A2BE2" }}>Materia Medica — Top remedies for this rubric</p>
                    <div className="space-y-1">
                      {r.remedies.filter(rem => rem.grade === 3).map(rem => (
                        <p key={rem.name} className="text-xs font-mono-neo" style={{ color: "var(--text-obsidian)" }}>
                          <span className="font-bold">{rem.name}</span> — Grade {rem.grade} (major remedy for this rubric)
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Case panel */}
        <div className="space-y-4">
          <div className="shard p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>Case</h3>
                {caseRubrics.length > 0 && (
                  <span className="text-[10px] font-mono-neo px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(78,115,223,0.1)", color: "var(--accent-mineral)" }}>
                    {caseRubrics.length} rubrics
                  </span>
                )}
              </div>
              {caseRubrics.length > 0 && (
                <button onClick={() => setCaseRubrics([])} className="text-[10px] font-mono-neo text-red-400 hover:text-red-600">
                  Clear
                </button>
              )}
            </div>

            {caseRubrics.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: "var(--text-dim)" }}>
                Add rubrics from search results to start repertorising
              </p>
            ) : (
              <div className="space-y-2">
                {caseRubrics.map(cr => {
                  const chColor = CHAPTER_COLORS[cr.chapter] ?? "var(--accent-mineral)";
                  return (
                    <div key={cr.rubricId} className="rounded-2xl p-3 group"
                      style={{ background: "rgba(255,255,255,0.5)", border: "1px solid var(--glass-border)" }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 pr-2">
                          <span className="text-[9px] font-mono-neo font-bold" style={{ color: chColor }}>{cr.chapter} · </span>
                          <span className="text-[11px] font-mono-neo font-semibold leading-tight" style={{ color: "var(--text-obsidian)" }}>
                            {cr.path.split("; ").slice(-1)[0]}
                          </span>
                        </div>
                        <button onClick={() => removeRubric(cr.rubricId)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>Wt:</span>
                        {([1, 2, 3] as const).map(w => (
                          <button key={w} onClick={() => setWeight(cr.rubricId, w)}
                            className="w-6 h-6 rounded-lg text-[10px] font-bold transition-all"
                            style={{
                              background: cr.weight === w ? "var(--accent-mineral)" : "rgba(255,255,255,0.6)",
                              color: cr.weight === w ? "white" : "var(--text-dim)",
                              border: "1px solid var(--glass-border)",
                            }}>
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top remedies */}
          {remedyScores.length > 0 && (
            <div className="shard p-4">
              <h3 className="font-bold text-sm mb-3" style={{ color: "var(--text-obsidian)" }}>
                Top Remedies
              </h3>
              <div className="space-y-2.5">
                {remedyScores.slice(0, 10).map((rem, i) => (
                  <div key={rem.name} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono-neo w-4 text-right flex-shrink-0" style={{ color: "var(--text-dim)" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-xs font-semibold" style={{ color: "var(--text-obsidian)" }}>{rem.name}</span>
                        <span className="text-[10px] font-mono-neo font-bold" style={{ color: "var(--accent-mineral)" }}>
                          {rem.score}pt · {rem.count}r
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (rem.score / (remedyScores[0]?.score || 1)) * 100)}%`,
                            background: i === 0 ? "#ef4444" : i === 1 ? "#f97316" : "var(--accent-mineral)",
                          }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--glass-border)" }}>
                <p className="text-[10px] font-mono-neo mb-2" style={{ color: "var(--text-dim)" }}>Grade legend</p>
                <div className="flex gap-3 text-[10px] font-mono-neo">
                  <span style={{ color: "#ef4444", fontWeight: 700 }}>●●● Grade 3</span>
                  <span style={{ color: "#4e73df", fontWeight: 600 }}>●● Grade 2</span>
                  <span style={{ color: "#9ca3af" }}>● Grade 1</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Repertorisation Grid */}
      {showGrid && caseRubrics.length > 0 && (
        <div className="shard p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "var(--text-obsidian)" }}>Repertorisation Grid</h3>
            <div className="flex items-center gap-2">
              <input
                value={caseName}
                onChange={e => setCaseName(e.target.value)}
                className="text-sm font-semibold bg-transparent outline-none"
                style={{ color: "var(--text-obsidian)", borderBottom: "1px solid var(--glass-border)" }}
              />
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold gradient-mineral text-white">
                <Save className="h-3 w-3" /> Save Case
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono-neo border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 min-w-52 sticky left-0"
                    style={{ color: "var(--text-dim)", borderBottom: "1px solid var(--glass-border)", background: "rgba(242,244,247,0.95)" }}>
                    Rubric
                  </th>
                  <th className="text-center py-2 px-2"
                    style={{ color: "var(--text-dim)", borderBottom: "1px solid var(--glass-border)" }}>
                    Wt
                  </th>
                  {gridRemedies.map(r => (
                    <th key={r.name} className="text-center py-2 px-2 min-w-10"
                      style={{ color: "var(--text-dim)", borderBottom: "1px solid var(--glass-border)" }}
                      title={r.name}>
                      {r.abbrev.replace(".", "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {caseRubrics.map(cr => (
                  <tr key={cr.rubricId} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    <td className="py-2 pr-4 font-semibold sticky left-0"
                      style={{ color: "var(--text-obsidian)", background: "rgba(242,244,247,0.9)" }}>
                      {cr.path.split("; ").slice(-2).join("; ")}
                    </td>
                    <td className="text-center py-2 px-2 font-bold" style={{ color: "var(--accent-mineral)" }}>
                      {cr.weight}
                    </td>
                    {gridRemedies.map(gr => {
                      const rem = cr.remedies.find(r => r.name === gr.name);
                      return (
                        <td key={gr.name} className="text-center py-2 px-2"
                          style={rem ? gradeStyle(rem.grade) : { color: "#e5e7eb" }}>
                          {rem ? rem.grade : "·"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid var(--accent-mineral)" }}>
                  <td className="py-2 pr-4 font-bold text-xs sticky left-0"
                    style={{ color: "var(--text-obsidian)", background: "rgba(242,244,247,0.9)" }}>
                    TOTAL SCORE
                  </td>
                  <td />
                  {gridRemedies.map((gr, i) => (
                    <td key={gr.name} className="text-center py-2 px-2 font-bold"
                      style={{ color: i === 0 ? "#ef4444" : i === 1 ? "#f97316" : "var(--accent-mineral)" }}>
                      {gr.score}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-1 pr-4 text-[10px] sticky left-0"
                    style={{ color: "var(--text-dim)", background: "rgba(242,244,247,0.9)" }}>
                    Rubric coverage
                  </td>
                  <td />
                  {gridRemedies.map(gr => (
                    <td key={gr.name} className="text-center py-1 px-2 text-[10px]" style={{ color: "var(--text-dim)" }}>
                      {gr.count}/{caseRubrics.length}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[10px] font-mono-neo mt-3" style={{ color: "var(--text-dim)" }}>
            Source: Kent Repertory (public domain) · Score = sum of (grade × weight) · First 14 remedies shown
          </p>
        </div>
      )}
    </div>
  );
}
