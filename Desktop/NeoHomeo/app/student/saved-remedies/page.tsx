"use client";

import { useState } from "react";
import { FlaskConical, Trash2, ChevronRight } from "lucide-react";

const REMEDIES = [
  { id: "1", name: "Sulphur", abbrev: "Sul.", kingdom: "Mineral", miasm: "Psoric", keynote: "Burning sensations, hot patient, dirty appearance, hungry at 11AM", color: "#F59E0B" },
  { id: "2", name: "Natrum Muriaticum", abbrev: "Nat-m.", kingdom: "Mineral", miasm: "Psoric/Syphilitic", keynote: "Never well since grief. Aversion to consolation. Craves salt.", color: "#4e73df" },
  { id: "3", name: "Pulsatilla", abbrev: "Puls.", kingdom: "Plant", miasm: "Psoric/Sycotic", keynote: "Mild, yielding, weepy. Thirstless. Worse in warm rooms, better open air.", color: "#4ECDC4" },
  { id: "4", name: "Lycopodium", abbrev: "Lyc.", kingdom: "Plant", miasm: "Psoric/Sycotic", keynote: "Cowardly bully. Flatulence. Worse 4-8 PM. Right-sided.", color: "#8A2BE2" },
  { id: "5", name: "Arsenicum Album", abbrev: "Ars.", kingdom: "Mineral", miasm: "Psoric/Syphilitic", keynote: "Fastidious, anxious, restless. Burning pains better heat. Worse at midnight.", color: "#ef4444" },
];

const kingdomColors: Record<string, string> = {
  Mineral: "#4e73df", Plant: "#16a34a", Animal: "#F59E0B",
};

export default function SavedRemediesPage() {
  const [remedies, setRemedies] = useState(REMEDIES);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Saved Remedies</h1>
        <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>{remedies.length} remedies bookmarked</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {remedies.map((rem) => (
          <div key={rem.id} className="shard p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: rem.color }}>
                  {rem.abbrev.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>{rem.name}</h3>
                  <p className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>{rem.abbrev}</p>
                </div>
              </div>
              <button onClick={() => setRemedies(remedies.filter((r) => r.id !== rem.id))}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-red-50">
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              <span className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${kingdomColors[rem.kingdom]}15`, color: kingdomColors[rem.kingdom] }}>
                {rem.kingdom}
              </span>
              <span className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
                style={{ background: "rgba(138,43,226,0.1)", color: "#8A2BE2" }}>
                {rem.miasm}
              </span>
            </div>

            <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-dim)" }}>{rem.keynote}</p>

            <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--accent-mineral)" }}>
              View full profile <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {remedies.length === 0 && (
        <div className="shard p-12 text-center">
          <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>No saved remedies</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>Bookmark remedies from Materia Medica to see them here</p>
        </div>
      )}
    </div>
  );
}
