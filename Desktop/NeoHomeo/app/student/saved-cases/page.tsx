"use client";
import { authedFetch } from "@/lib/authed-fetch";

import { useState, useEffect } from "react";
import { Bookmark, Trash2, ChevronRight, Calendar, Loader2, FolderOpen, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface CaseItem {
  id: string;
  name: string;
  created_at: string;
}

interface CaseFile {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  cases?: CaseItem[];
}

export default function SavedCasesPage() {
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await authedFetch("/api/cases");
        if (res.ok) {
          const data = await res.json();
          setFiles(data.files ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function deleteFile(id: string) {
    await authedFetch(`/api/cases?type=file&id=${id}`, { method: "DELETE" });
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success("Case file deleted");
  }

  async function deleteCase(fileId: string, caseId: string) {
    await authedFetch(`/api/cases?type=case&id=${caseId}`, { method: "DELETE" });
    setFiles((prev) => prev.map((f) =>
      f.id === fileId ? { ...f, cases: (f.cases ?? []).filter((c) => c.id !== caseId) } : f
    ));
    toast.success("Case deleted");
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const totalCases = files.reduce((sum, f) => sum + (f.cases?.length ?? 0), 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Saved Cases</h1>
          <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>
            {files.length} case file{files.length === 1 ? "" : "s"} · {totalCases} case{totalCases === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/student/take-case"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#4e73df,#8A2BE2)" }}>
          <Plus className="h-4 w-4" /> Take New Case
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent-mineral)" }} />
        </div>
      )}

      {!loading && files.length === 0 && (
        <div className="shard p-12 text-center">
          <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>No saved cases</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>Cases you save from the Repertory tool appear here</p>
        </div>
      )}

      {!loading && files.length > 0 && (
        <div className="space-y-4">
          {files.map((file) => {
            const cases = file.cases ?? [];
            return (
              <div key={file.id} className="shard p-5 group">
                <div className="flex items-start justify-between mb-1">
                  <button onClick={() => toggleExpand(file.id)} className="flex items-center gap-3 text-left flex-1">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(78,115,223,0.1)" }}>
                      <FolderOpen className="h-4 w-4" style={{ color: "var(--accent-mineral)" }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>{file.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>
                        <Calendar className="h-3 w-3" />
                        {new Date(file.created_at).toLocaleDateString()} · {cases.length} case{cases.length === 1 ? "" : "s"}
                      </div>
                    </div>
                  </button>
                  <button onClick={() => deleteFile(file.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-red-50">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>

                {file.description && (
                  <p className="text-xs leading-relaxed ml-12 mb-2" style={{ color: "var(--text-dim)" }}>{file.description}</p>
                )}

                {expanded.has(file.id) && cases.length > 0 && (
                  <div className="mt-3 ml-3 space-y-2 pl-3 border-l-2" style={{ borderColor: "var(--glass-border)" }}>
                    {cases.map((c) => (
                      <div key={c.id} className="group/case flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--text-dim)" }} />
                          <span className="text-xs font-semibold truncate" style={{ color: "var(--text-obsidian)" }}>{c.name}</span>
                          <span className="text-[10px] font-mono-neo flex-shrink-0" style={{ color: "var(--text-dim)" }}>
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/case:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => deleteCase(file.id, c.id)} className="p-1 rounded hover:bg-red-50">
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </button>
                          <Link href={`/student/repertory?caseId=${c.id}`}
                            className="flex items-center gap-0.5 text-[10px] font-semibold px-2 py-1 rounded-lg"
                            style={{ background: "rgba(78,115,223,0.1)", color: "var(--accent-mineral)" }}>
                            Open <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {expanded.has(file.id) && cases.length === 0 && (
                  <p className="text-xs ml-12 mt-1" style={{ color: "var(--text-dim)" }}>No cases in this file yet</p>
                )}
                <div className="accent-blob" style={{ bottom: "-20px", right: "-20px" }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
