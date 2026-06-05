"use client";

import { useState } from "react";
import { Bookmark, Trash2, ChevronRight, User, Calendar } from "lucide-react";

const SAVED_CASES = [
  { id: "1", name: "Case: Young male, acne + anxiety", remedies: ["Sulphur", "Natrum Mur", "Pulsatilla"], date: "2026-05-28", notes: "Hot patient, burning acne. Anxious before exams. Craves sweets." },
  { id: "2", name: "Case: Chronic sinusitis with yellow discharge", remedies: ["Kali Bich", "Pulsatilla", "Hydrastis"], date: "2026-06-01", notes: "Thick yellow-green discharge. Worse in cold damp weather. Better warmth." },
  { id: "3", name: "Case: Infant with colic", remedies: ["Chamomilla", "Colocynth", "Nux Vomica"], date: "2026-06-03", notes: "Extremely irritable child. Better when carried. Greenish stools." },
];

export default function SavedCasesPage() {
  const [cases, setCases] = useState(SAVED_CASES);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Saved Cases</h1>
        <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>{cases.length} cases saved</p>
      </div>

      <div className="space-y-4">
        {cases.map((c) => (
          <div key={c.id} className="shard p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(78,115,223,0.1)" }}>
                  <User className="h-4 w-4" style={{ color: "var(--accent-mineral)" }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>{c.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>
                    <Calendar className="h-3 w-3" /> {c.date}
                  </div>
                </div>
              </div>
              <button onClick={() => setCases(cases.filter((x) => x.id !== c.id))}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-red-50">
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            </div>

            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>{c.notes}</p>

            <div className="mb-3">
              <p className="stat-label mb-1.5">Remedies Considered</p>
              <div className="flex flex-wrap gap-2">
                {c.remedies.map((r) => (
                  <span key={r} className="text-xs font-medium px-3 py-1 rounded-2xl"
                    style={{ background: "rgba(78,115,223,0.1)", color: "var(--accent-mineral)" }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--accent-mineral)" }}>
              Open in Repertory <ChevronRight className="h-3 w-3" />
            </button>
            <div className="accent-blob" style={{ bottom: "-20px", right: "-20px" }} />
          </div>
        ))}
      </div>

      {cases.length === 0 && (
        <div className="shard p-12 text-center">
          <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>No saved cases</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>Cases you save from the Repertory tool appear here</p>
        </div>
      )}
    </div>
  );
}
