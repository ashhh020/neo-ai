"use client";

import { useState, useEffect } from "react";
import { Bookmark, Trash2, ChevronRight, Calendar, Loader2, FolderOpen, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface CaseFile {
  id: string;
  title: string;
  created_at: string;
  cases?: CaseItem[];
}

interface CaseItem {
  id: string;
  chief_complaint: string;
  prescription?: string;
  created_at: string;
  case_rubrics?: Array<{ rubric_path: string; weightage: number }>;
}

export default function SavedCasesPage() {
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/cases");
        if (res.ok) {
          const data = await res.json();
          setCaseFiles(data.caseFiles ?? data.cases ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function deleteCaseFile(id: string) {
    await fetch(`/api/cases?type=file&id=${id}`, { method: "DELETE" });
    setCaseFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success("Case file deleted");
  }

  async function deleteCase(fileId: string, caseId: string) {
    await fetch(`/api/cases?type=case&id=${caseId}`, { method: "DELETE" });
    setCaseFiles((prev) => prev.map((f) =>
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Saved Cases</h1>
        <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>{caseFiles.length} case files</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent-mineral)" }} />
        </div>
      )}

      {!loading && caseFiles.length === 0 && (
        <div className="shard p-12 text-center">
          <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>No saved cases</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>Cases you save from the Repertory tool appear here</p>
        </div>
      )}

      {!loading && caseFiles.length > 0 && (
        <div className="space-y-4">
          {caseFiles.map((file) => (
            <div key={file.id} className="shard p-5 group">
              <div className="flex items-start justify-between mb-3">
                <button onClick={() => toggleExpand(file.id)} className="flex items-center gap-3 text-left flex-1">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(78,115,223,0.1)" }}>
                    <FolderOpen className="h-4 w-4" style={{ color: "var(--accent-mineral)" }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>{file.title}</h3>
                    <div className="flex items-center gap-1 text-[10px] font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>
                      <Calendar className="h-3 w-3" />
                      {new Date(file.created_at).toLocaleDateString()} · {(file.cases ?? []).length} cases
                    </div>
                  </div>
                </button>
                <button onClick={() => deleteCaseFile(file.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-red-50">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>

              {expanded.has(file.id) && (file.cases ?? []).length > 0 && (
                <div className="mt-3 space-y-3 pl-3 border-l-2" style={{ borderColor: "var(--glass-border)" }}>
                  {(file.cases ?? []).map((c) => (
                    <div key={c.id} className="group/case">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <User className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--text-dim)" }} />
                          <div>
                            <p className="text-xs font-semibold" style={{ color: "var(--text-obsidian)" }}>{c.chief_complaint}</p>
                            {c.prescription && (
                              <p className="text-[10px] font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>
                                Rx: {c.prescription}
                              </p>
                            )}
                            {(c.case_rubrics ?? []).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(c.case_rubrics ?? []).slice(0, 3).map((r, i) => (
                                  <span key={i} className="text-[9px] font-mono-neo px-1.5 py-0.5 rounded"
                                    style={{ background: "rgba(78,115,223,0.08)", color: "var(--accent-mineral)" }}>
                                    {r.rubric_path}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/case:opacity-100 transition-opacity">
                          <button onClick={() => deleteCase(file.id, c.id)}
                            className="p-1 rounded hover:bg-red-50">
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </button>
                          <Link href={`/student/repertory?caseId=${c.id}`}
                            className="flex items-center gap-0.5 text-[10px] font-semibold px-2 py-1 rounded-lg"
                            style={{ background: "rgba(78,115,223,0.1)", color: "var(--accent-mineral)" }}>
                            Open <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {expanded.has(file.id) && (file.cases ?? []).length === 0 && (
                <p className="text-xs pl-3 mt-2" style={{ color: "var(--text-dim)" }}>No cases in this file yet</p>
              )}
              <div className="accent-blob" style={{ bottom: "-20px", right: "-20px" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
