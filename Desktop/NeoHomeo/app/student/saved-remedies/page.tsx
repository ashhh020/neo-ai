"use client";

import { useState, useEffect } from "react";
import { FlaskConical, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SavedRemedy {
  id: string;
  remedy_name: string;
  kingdom?: string;
  miasm?: string;
  keynotes?: string[];
  created_at: string;
}

const kingdomColors: Record<string, string> = {
  Mineral: "#4e73df", Plant: "#16a34a", Animal: "#F59E0B",
};

const remedyColor = (name: string) => {
  const colors = ["#4e73df", "#8A2BE2", "#4ECDC4", "#F59E0B", "#ef4444", "#16a34a"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function SavedRemediesPage() {
  const [remedies, setRemedies] = useState<SavedRemedy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/saved-remedies");
        if (res.ok) {
          const data = await res.json();
          setRemedies(data.remedies ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function deleteRemedy(id: string) {
    await fetch(`/api/saved-remedies?id=${id}`, { method: "DELETE" });
    setRemedies((prev) => prev.filter((r) => r.id !== id));
    toast.success("Remedy removed");
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Saved Remedies</h1>
        <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>{remedies.length} remedies bookmarked</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent-mineral)" }} />
        </div>
      )}

      {!loading && remedies.length === 0 && (
        <div className="shard p-12 text-center">
          <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>No saved remedies</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>Bookmark remedies from Materia Medica to see them here</p>
        </div>
      )}

      {!loading && remedies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {remedies.map((rem) => {
            const color = remedyColor(rem.remedy_name);
            const keynotes = rem.keynotes ?? [];
            return (
              <div key={rem.id} className="shard p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: color }}>
                      {rem.remedy_name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>{rem.remedy_name}</h3>
                      <p className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>
                        {new Date(rem.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteRemedy(rem.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-red-50">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>

                <div className="flex gap-2 mb-3 flex-wrap">
                  {rem.kingdom && (
                    <span className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
                      style={{ background: `${kingdomColors[rem.kingdom] ?? "#6b7280"}15`, color: kingdomColors[rem.kingdom] ?? "#6b7280" }}>
                      {rem.kingdom}
                    </span>
                  )}
                  {rem.miasm && (
                    <span className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
                      style={{ background: "rgba(138,43,226,0.1)", color: "#8A2BE2" }}>
                      {rem.miasm}
                    </span>
                  )}
                </div>

                {keynotes.length > 0 && (
                  <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-dim)" }}>
                    {keynotes.slice(0, 3).join(" · ")}
                  </p>
                )}

                <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--accent-mineral)" }}>
                  View full profile <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
