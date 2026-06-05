"use client";

import { useState } from "react";
import { Layers, Trash2, ChevronRight } from "lucide-react";

const RUBRICS = [
  { id: "1", chapter: "Mind", rubric: "FEAR; death, of", remedies: [{ name: "Aconite", grade: 3 }, { name: "Arsenicum", grade: 3 }, { name: "Platina", grade: 2 }], source: "Kent" },
  { id: "2", chapter: "Mind", rubric: "GRIEF; ailments from", remedies: [{ name: "Ignatia", grade: 3 }, { name: "Natrum Mur", grade: 3 }, { name: "Phosphoric Acid", grade: 2 }], source: "Kent" },
  { id: "3", chapter: "Stomach", rubric: "HUNGRY; 11 AM", remedies: [{ name: "Sulphur", grade: 3 }, { name: "Zinc", grade: 2 }, { name: "Natrum Mur", grade: 1 }], source: "Kent" },
  { id: "4", chapter: "Generals", rubric: "SIDE; right", remedies: [{ name: "Lycopodium", grade: 3 }, { name: "Chelidonium", grade: 3 }, { name: "Belladonna", grade: 2 }], source: "Kent" },
];

const gradeColors = ["", "#6b7280", "#4e73df", "#ef4444"];

export default function SavedRubricsPage() {
  const [rubrics, setRubrics] = useState(RUBRICS);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Saved Rubrics</h1>
        <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>{rubrics.length} rubrics saved</p>
      </div>

      <div className="space-y-4">
        {rubrics.map((r) => (
          <div key={r.id} className="shard p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
                    style={{ background: "rgba(138,43,226,0.1)", color: "#8A2BE2" }}>{r.chapter}</span>
                  <span className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>{r.source}</span>
                </div>
                <h3 className="font-bold font-mono-neo text-sm" style={{ color: "var(--text-obsidian)" }}>{r.rubric}</h3>
              </div>
              <button onClick={() => setRubrics(rubrics.filter((x) => x.id !== r.id))}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-red-50">
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            </div>

            <div>
              <p className="stat-label mb-2">Remedies (grade)</p>
              <div className="flex flex-wrap gap-2">
                {r.remedies.map((rem) => (
                  <span key={rem.name}
                    className={`text-xs font-medium px-3 py-1 rounded-xl ${rem.grade === 3 ? "font-bold" : rem.grade === 2 ? "font-semibold" : ""}`}
                    style={{ background: `${gradeColors[rem.grade]}15`, color: gradeColors[rem.grade] || "var(--text-dim)" }}>
                    {rem.name} {rem.grade === 3 ? "●●●" : rem.grade === 2 ? "●●" : "●"}
                  </span>
                ))}
              </div>
            </div>

            <button className="flex items-center gap-1 text-xs font-semibold mt-3" style={{ color: "var(--accent-mineral)" }}>
              Open in Repertory <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
