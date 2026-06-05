"use client";

import { useState } from "react";
import { Search, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const RUBRIC_DB = [
  { id: "r1", chapter: "Mind", path: "MIND; FEAR; death, of", remedies: [{ name: "Aconite", abbrev: "Acon.", grade: 3 }, { name: "Arsenicum", abbrev: "Ars.", grade: 3 }, { name: "Calcarea", abbrev: "Calc.", grade: 2 }, { name: "Platina", abbrev: "Plat.", grade: 2 }, { name: "Phosphorus", abbrev: "Phos.", grade: 2 }, { name: "Pulsatilla", abbrev: "Puls.", grade: 1 }] },
  { id: "r2", chapter: "Mind", path: "MIND; FEAR; alone, being", remedies: [{ name: "Arsenicum", abbrev: "Ars.", grade: 3 }, { name: "Bismuth", abbrev: "Bism.", grade: 3 }, { name: "Kali-carb", abbrev: "Kali-c.", grade: 2 }, { name: "Lycopodium", abbrev: "Lyc.", grade: 2 }, { name: "Phosphorus", abbrev: "Phos.", grade: 2 }] },
  { id: "r3", chapter: "Mind", path: "MIND; GRIEF; ailments from", remedies: [{ name: "Ignatia", abbrev: "Ign.", grade: 3 }, { name: "Natrum Mur", abbrev: "Nat-m.", grade: 3 }, { name: "Phosphoric Acid", abbrev: "Ph-ac.", grade: 3 }, { name: "Causticum", abbrev: "Caust.", grade: 2 }, { name: "Staphysagria", abbrev: "Staph.", grade: 2 }] },
  { id: "r4", chapter: "Mind", path: "MIND; ANXIETY; health, about", remedies: [{ name: "Arsenicum", abbrev: "Ars.", grade: 3 }, { name: "Calcarea", abbrev: "Calc.", grade: 3 }, { name: "Kali-ars", abbrev: "Kali-ar.", grade: 2 }, { name: "Nitric Acid", abbrev: "Nit-ac.", grade: 2 }, { name: "Phosphorus", abbrev: "Phos.", grade: 2 }] },
  { id: "r5", chapter: "Stomach", path: "STOMACH; HUNGRY; 11 AM", remedies: [{ name: "Sulphur", abbrev: "Sul.", grade: 3 }, { name: "Zinc", abbrev: "Zinc.", grade: 2 }, { name: "Natrum Mur", abbrev: "Nat-m.", grade: 1 }] },
  { id: "r6", chapter: "Generals", path: "GENERALS; SIDE; right", remedies: [{ name: "Lycopodium", abbrev: "Lyc.", grade: 3 }, { name: "Chelidonium", abbrev: "Chel.", grade: 3 }, { name: "Belladonna", abbrev: "Bell.", grade: 2 }, { name: "Sanguin.", abbrev: "Sang.", grade: 2 }] },
  { id: "r7", chapter: "Generals", path: "GENERALS; HEAT; vital, lack of", remedies: [{ name: "Calcarea", abbrev: "Calc.", grade: 3 }, { name: "Silicea", abbrev: "Sil.", grade: 3 }, { name: "Psorinum", abbrev: "Psor.", grade: 2 }, { name: "Baryta Carb", abbrev: "Bar-c.", grade: 2 }] },
  { id: "r8", chapter: "Mind", path: "MIND; CONSOLATION; agg.", remedies: [{ name: "Natrum Mur", abbrev: "Nat-m.", grade: 3 }, { name: "Ignatia", abbrev: "Ign.", grade: 2 }, { name: "Sepia", abbrev: "Sep.", grade: 2 }, { name: "Nitric Acid", abbrev: "Nit-ac.", grade: 1 }] },
  { id: "r9", chapter: "Mind", path: "MIND; DELUSIONS; great person, being a", remedies: [{ name: "Sulphur", abbrev: "Sul.", grade: 3 }, { name: "Platinum", abbrev: "Plat.", grade: 3 }, { name: "Calcarea", abbrev: "Calc.", grade: 2 }, { name: "Lycopodium", abbrev: "Lyc.", grade: 1 }] },
  { id: "r10", chapter: "Generals", path: "GENERALS; BURNING; externally", remedies: [{ name: "Arsenicum", abbrev: "Ars.", grade: 3 }, { name: "Sulphur", abbrev: "Sul.", grade: 3 }, { name: "Phosphorus", abbrev: "Phos.", grade: 2 }, { name: "Sanguinaria", abbrev: "Sang.", grade: 2 }] },
  { id: "r11", chapter: "Mind", path: "MIND; FASTIDIOUS", remedies: [{ name: "Arsenicum", abbrev: "Ars.", grade: 3 }, { name: "Nux Vomica", abbrev: "Nux-v.", grade: 3 }, { name: "Calcarea", abbrev: "Calc.", grade: 2 }] },
  { id: "r12", chapter: "Mind", path: "MIND; WEEPING; causeless", remedies: [{ name: "Pulsatilla", abbrev: "Puls.", grade: 3 }, { name: "Phosphorus", abbrev: "Phos.", grade: 2 }, { name: "Lycopodium", abbrev: "Lyc.", grade: 1 }] },
  { id: "r13", chapter: "Generals", path: "GENERALS; AGGRAVATION; 4 PM", remedies: [{ name: "Lycopodium", abbrev: "Lyc.", grade: 3 }, { name: "Belladonna", abbrev: "Bell.", grade: 2 }, { name: "Pulsatilla", abbrev: "Puls.", grade: 2 }] },
  { id: "r14", chapter: "Generals", path: "GENERALS; FOOD; onions, aversion to", remedies: [{ name: "Thuja", abbrev: "Thuj.", grade: 3 }, { name: "Lycopodium", abbrev: "Lyc.", grade: 2 }, { name: "Sabadilla", abbrev: "Sabad.", grade: 2 }] },
  { id: "r15", chapter: "Mind", path: "MIND; IRRESOLUTION", remedies: [{ name: "Pulsatilla", abbrev: "Puls.", grade: 3 }, { name: "Lycopodium", abbrev: "Lyc.", grade: 2 }, { name: "Baryta Carb", abbrev: "Bar-c.", grade: 2 }] },
];

type Rubric = typeof RUBRIC_DB[0];

interface CaseRubric {
  rubricId: string;
  path: string;
  weight: number;
  remedies: { name: string; abbrev: string; grade: number }[];
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

export default function RepertoryPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Rubric[]>([]);
  const [caseRubrics, setCaseRubrics] = useState<CaseRubric[]>([]);
  const [searched, setSearched] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  function doSearch() {
    if (!query.trim()) return;
    const q = query.toLowerCase().replace(/\*/g, "").trim();
    const words = q.split(/\s+/);
    const found = RUBRIC_DB.filter((r) =>
      words.every((w) => r.path.toLowerCase().includes(w) || r.chapter.toLowerCase().includes(w))
    );
    setResults(found);
    setSearched(true);
  }

  function addRubric(rubric: Rubric) {
    if (caseRubrics.find((r) => r.rubricId === rubric.id)) return;
    setCaseRubrics((prev) => [...prev, { rubricId: rubric.id, path: rubric.path, weight: 1, remedies: rubric.remedies }]);
  }

  function removeRubric(id: string) {
    setCaseRubrics((prev) => prev.filter((r) => r.rubricId !== id));
  }

  function setWeight(id: string, w: number) {
    setCaseRubrics((prev) => prev.map((r) => r.rubricId === id ? { ...r, weight: w } : r));
  }

  const remedyScores: RemedyScore[] = (() => {
    const map: Record<string, RemedyScore> = {};
    for (const cr of caseRubrics) {
      for (const rem of cr.remedies) {
        if (!map[rem.name]) map[rem.name] = { name: rem.name, abbrev: rem.abbrev, score: 0, count: 0 };
        map[rem.name].score += rem.grade * cr.weight;
        map[rem.name].count += 1;
      }
    }
    return Object.values(map).sort((a, b) => b.score - a.score);
  })();

  const gridRemedies = remedyScores.slice(0, 12);
  const quickSearches = ["fear death", "grief", "burning", "hungry 11", "consolation agg"];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
            Repertory Tool
          </h1>
          <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>
            Kent repertory · rubric search · repertorisation grid
          </p>
        </div>
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

      {/* Search bar */}
      <div className="shard p-4 flex items-center gap-3">
        <Search className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-dim)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
          placeholder='Search rubrics (e.g. "fear death" or "grief" or "burning")… * wildcard supported'
          className="flex-1 bg-transparent outline-none text-sm font-medium"
          style={{ color: "var(--text-obsidian)" }}
        />
        <button
          onClick={doSearch}
          className="px-4 py-2 rounded-xl text-white font-semibold text-sm gradient-mineral hover:opacity-90 flex-shrink-0"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Search results */}
        <div className="lg:col-span-2 space-y-3">
          {!searched && (
            <div className="shard p-8 text-center">
              <div className="text-4xl mb-3">🗂️</div>
              <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>Search the Kent Repertory</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
                Enter a symptom, chapter, or rubric name above
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {quickSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); }}
                    className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all hover:shadow-md"
                    style={{
                      background: "rgba(255,255,255,0.6)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-dim)",
                    }}
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
              <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>Try broader search terms</p>
            </div>
          )}

          {results.map((r) => {
            const added = !!caseRubrics.find((c) => c.rubricId === r.id);
            return (
              <div key={r.id} className="shard p-4 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <span
                      className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold mr-2 inline-block mb-1"
                      style={{ background: "rgba(138,43,226,0.1)", color: "#8A2BE2" }}
                    >
                      {r.chapter}
                    </span>
                    <p className="text-sm font-bold font-mono-neo leading-snug" style={{ color: "var(--text-obsidian)" }}>
                      {r.path}
                    </p>
                  </div>
                  <button
                    onClick={() => addRubric(r)}
                    disabled={added}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all disabled:opacity-50"
                    style={{ background: "rgba(78,115,223,0.1)", color: "var(--accent-mineral)" }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {added ? "Added" : "Add"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {r.remedies.map((rem) => (
                    <span
                      key={rem.name}
                      className="text-[11px] px-2 py-0.5 rounded-lg font-mono-neo"
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
              </div>
            );
          })}
        </div>

        {/* Case panel */}
        <div className="space-y-4">
          <div className="shard p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>
                Case Rubrics
                {caseRubrics.length > 0 && (
                  <span className="ml-2 text-xs font-mono-neo" style={{ color: "var(--text-dim)" }}>
                    ({caseRubrics.length})
                  </span>
                )}
              </h3>
              {caseRubrics.length > 0 && (
                <button onClick={() => setCaseRubrics([])} className="text-[10px] font-mono-neo text-red-400 hover:text-red-600">
                  Clear all
                </button>
              )}
            </div>

            {caseRubrics.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: "var(--text-dim)" }}>
                Add rubrics from search results to start repertorising
              </p>
            ) : (
              <div className="space-y-2">
                {caseRubrics.map((cr) => (
                  <div
                    key={cr.rubricId}
                    className="rounded-2xl p-3 group"
                    style={{ background: "rgba(255,255,255,0.5)", border: "1px solid var(--glass-border)" }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p
                        className="text-[11px] font-mono-neo font-semibold leading-tight flex-1 pr-2"
                        style={{ color: "var(--text-obsidian)" }}
                      >
                        {cr.path}
                      </p>
                      <button
                        onClick={() => removeRubric(cr.rubricId)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>Wt:</span>
                      {[1, 2, 3].map((w) => (
                        <button
                          key={w}
                          onClick={() => setWeight(cr.rubricId, w)}
                          className="w-6 h-6 rounded-lg text-[10px] font-bold transition-all"
                          style={{
                            background: cr.weight === w ? "var(--accent-mineral)" : "rgba(255,255,255,0.6)",
                            color: cr.weight === w ? "white" : "var(--text-dim)",
                            border: "1px solid var(--glass-border)",
                          }}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top remedies */}
          {remedyScores.length > 0 && (
            <div className="shard p-4">
              <h3 className="font-bold text-sm mb-3" style={{ color: "var(--text-obsidian)" }}>Top Remedies</h3>
              <div className="space-y-2.5">
                {remedyScores.slice(0, 8).map((rem, i) => (
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
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (rem.score / (remedyScores[0]?.score || 1)) * 100)}%`,
                            background: "var(--accent-mineral)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Repertorisation Grid */}
      {showGrid && caseRubrics.length > 0 && (
        <div className="shard p-5">
          <h3 className="font-bold mb-4" style={{ color: "var(--text-obsidian)" }}>Repertorisation Grid</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono-neo border-collapse">
              <thead>
                <tr>
                  <th
                    className="text-left py-2 pr-4 min-w-52"
                    style={{ color: "var(--text-dim)", borderBottom: "1px solid var(--glass-border)" }}
                  >
                    Rubric
                  </th>
                  <th
                    className="text-center py-2 px-2"
                    style={{ color: "var(--text-dim)", borderBottom: "1px solid var(--glass-border)" }}
                  >
                    Wt
                  </th>
                  {gridRemedies.map((r) => (
                    <th
                      key={r.name}
                      className="text-center py-2 px-2 min-w-12"
                      style={{ color: "var(--text-dim)", borderBottom: "1px solid var(--glass-border)" }}
                    >
                      {r.abbrev}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {caseRubrics.map((cr) => (
                  <tr key={cr.rubricId} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                    <td className="py-2 pr-4 font-semibold" style={{ color: "var(--text-obsidian)" }}>
                      {cr.path.split("; ").slice(-2).join("; ")}
                    </td>
                    <td className="text-center py-2 px-2 font-bold" style={{ color: "var(--accent-mineral)" }}>
                      {cr.weight}
                    </td>
                    {gridRemedies.map((gr) => {
                      const rem = cr.remedies.find((r) => r.name === gr.name);
                      return (
                        <td key={gr.name} className="text-center py-2 px-2" style={rem ? gradeStyle(rem.grade) : { color: "#e5e7eb" }}>
                          {rem ? rem.grade : "·"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid var(--accent-mineral)" }}>
                  <td className="py-2 pr-4 font-bold text-xs" style={{ color: "var(--text-obsidian)" }}>
                    TOTAL SCORE
                  </td>
                  <td />
                  {gridRemedies.map((gr) => (
                    <td
                      key={gr.name}
                      className="text-center py-2 px-2 font-bold"
                      style={{ color: "var(--accent-mineral)" }}
                    >
                      {gr.score}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-1 pr-4 text-[10px]" style={{ color: "var(--text-dim)" }}>
                    Rubric coverage
                  </td>
                  <td />
                  {gridRemedies.map((gr) => (
                    <td
                      key={gr.name}
                      className="text-center py-1 px-2 text-[10px]"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {gr.count}/{caseRubrics.length}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[10px] font-mono-neo mt-3" style={{ color: "var(--text-dim)" }}>
            ●●● Grade 3 (bold red) · ●● Grade 2 (blue) · ● Grade 1 · Source: Kent Repertory
          </p>
        </div>
      )}
    </div>
  );
}
