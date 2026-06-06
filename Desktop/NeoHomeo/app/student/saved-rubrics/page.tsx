"use client";

import { useState, useEffect } from "react";
import { Trash2, ChevronRight, Loader2, Bookmark } from "lucide-react";
import { toast } from "sonner";

interface SavedRubric {
  id: string;
  rubric_path: string;
  chapter: string;
  source_abbrev: string;
  created_at: string;
  remedies?: Array<{ name: string; grade: number }>;
}

const gradeColors = ["", "#6b7280", "#4e73df", "#ef4444"];

export default function SavedRubricsPage() {
  const [rubrics, setRubrics] = useState<SavedRubric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/saved-rubrics");
        if (res.ok) {
          const data = await res.json();
          setRubrics(data.rubrics ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function deleteRubric(id: string) {
    await fetch(`/api/saved-rubrics?id=${id}`, { method: "DELETE" });
    setRubrics((prev) => prev.filter((r) => r.id !== id));
    toast.success("Rubric removed");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Saved Rubrics</h1>
        <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>{rubrics.length} rubrics saved</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent-mineral)" }} />
        </div>
      )}

      {!loading && rubrics.length === 0 && (
        <div className="shard p-12 text-center">
          <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>No saved rubrics</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
            Bookmark rubrics from the Repertory tool to see them here
          </p>
        </div>
      )}

      {!loading && rubrics.length > 0 && (
        <div className="space-y-4">
          {rubrics.map((r) => {
            const remedies: Array<{ name: string; grade: number }> = r.remedies ?? [];
            return (
              <div key={r.id} className="shard p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "rgba(138,43,226,0.1)", color: "#8A2BE2" }}>{r.chapter}</span>
                      <span className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>{r.source_abbrev}</span>
                    </div>
                    <h3 className="font-bold font-mono-neo text-sm" style={{ color: "var(--text-obsidian)" }}>{r.rubric_path}</h3>
                  </div>
                  <button onClick={() => deleteRubric(r.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-red-50">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>

                {remedies.length > 0 && (
                  <div>
                    <p className="stat-label mb-2">Remedies (grade)</p>
                    <div className="flex flex-wrap gap-2">
                      {remedies.map((rem) => (
                        <span key={rem.name}
                          className={`text-xs font-medium px-3 py-1 rounded-xl ${rem.grade === 3 ? "font-bold" : rem.grade === 2 ? "font-semibold" : ""}`}
                          style={{ background: `${gradeColors[rem.grade] || "#6b7280"}15`, color: gradeColors[rem.grade] || "var(--text-dim)" }}>
                          {rem.name} {rem.grade === 3 ? "●●●" : rem.grade === 2 ? "●●" : "●"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <p className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--accent-mineral)" }}>
                    Open in Repertory <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
