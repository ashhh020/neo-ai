"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, Plus, Trash2, BookOpen, X, ChevronRight, Loader2,
  FlaskConical, BarChart3, AlertCircle, Save, FolderOpen,
  Grid3X3, List, ChevronDown, Tag, Filter, Bookmark,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Remedy = [string, string, number]; // [abbrev, name, grade]

interface Rubric {
  id: string;
  chapter: string;
  fullpath: string;
  path: string;
  is_mother: boolean;
  remedies: Remedy[];
}

interface CaseRubric {
  rubric: Rubric;
  weight: 1 | 2 | 3;
  label: string;
}

interface CaseFile {
  id: string;
  name: string;
}

interface SavedCase {
  id: string;
  name: string;
  file_id: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REPERTORIES = [
  { abbrev: "publicum", title: "Repertorium Publicum",    author: "Polony", year: 2008,    status: "live",  note: "74,667 rubrics · DB" },
  { abbrev: "kent",     title: "Kent's Repertory",        author: "Kent, J.T.", year: 1897, status: "live",  note: "Live · homeoint.org" },
  { abbrev: "boericke", title: "Pocket Manual Repertory", author: "Boericke, O.E.", year: 1906, status: "live", note: "Live · homeoint.org" },
  { abbrev: "bogersyn", title: "Synoptic Key",            author: "Boger, C.M.", year: 1915, status: "live",  note: "Live · homeoint.org" },
  { abbrev: "boen",     title: "Therapeutic Pocketbook",  author: "Boenninghausen", year: 1846, status: "soon", note: "" },
  { abbrev: "boger",    title: "General Analysis",        author: "Boger, C.M.", year: 1931, status: "soon", note: "" },
  { abbrev: "hering",   title: "Guiding Symptoms",        author: "Hering, C.", year: 1879, status: "soon", note: "" },
  { abbrev: "robasif",  title: "Sensations As If",        author: "Roberts, H.A.", year: 1937, status: "soon", note: "" },
  { abbrev: "tylercold",title: "Cold & Flu Mini Rep",     author: "Tyler, M.L.", year: 1942, status: "soon", note: "" },
  { abbrev: "cowpert",  title: "Clinical Index",          author: "Cowperthwaite", year: 1892, status: "soon", note: "" },
];

// Kent has same chapters as publicum (Kent-style)
const CHAPTERS_BY_ABBREV: Record<string, string[]> = {
  publicum: [
    "All","Mind","Vertigo","Head","Eye","Vision","Ear","Hearing","Nose","Face",
    "Mouth","Teeth","Throat","Stomach","Abdomen","Rectum","Stool","Bladder",
    "Kidney","Prostate","Urethra","Urine","Male genitalia","Female genitalia",
    "Larynx and trachea","Respiration","Cough","Expectoration","Chest","Back",
    "Extremities","Sleep","Dreams","Chill","Fever","Sweat","Skin","Generalities",
  ],
  kent: [
    "All","Mind","Vertigo","Head","Eye","Vision","Ear","Hearing","Nose","Face",
    "Mouth","Teeth","Throat","External throat","Stomach","Abdomen","Rectum","Stool",
    "Urinary organs","Bladder","Kidneys","Prostate gland","Urethra","Urine",
    "Male genitalia","Female genitalia","Larynx and trachea","Respiration","Cough",
    "Expectoration","Chest","Back","Extremities","Sleep","Chill","Fever","Perspiration","Skin","Generalities",
  ],
  boen: ["All","Mind & Intellect","Head","Parts of Body","Sensations","Sleep","Fever","Modalities"],
  boericke: ["All","Mind","Head","Eyes","Ears","Nose","Face","Mouth","Tongue","Teeth","Throat","Stomach","Abdomen","Rectum","Urinary organs","Male","Female","Respiratory","Nervous system","Extremities","Skin","Fever","Generalities"],
  bogersyn: ["All","Time","Conditions","Generalities","Mind","Vertigo","Head","External head","Eyes","Vision","Ears","Hearing","Nose","Face","Mouth","Throat","Stomach","Abdomen","Rectum","Urinary","Male","Female","Respiratory","Chest","Back","Extremities","Skin","Sleep","Fever"],
  boger: ["All","Mind","Sensorium","Head","Eyes","Ears","Nose","Face","Mouth","Throat","Digestive","Urinary","Sexual","Respiratory","Circulation","Extremities","Skin","Fever","General Modalities"],
  bogsk: ["All","General Analysis","Modalities","Concomitants","Causation","Pathological Generals","Clinical Conditions","Regional Symptoms"],
  hering: ["All","Mind","Head","Eyes","Ears","Nose","Face","Mouth","Throat","Digestive","Urinary","Sexual","Respiratory","Chest","Extremities","Skin","Sleep","Fever","Generalities"],
  robasif: ["All","Mind","Head","Eyes","Ears","Nose","Face","Mouth","Throat","Stomach","Abdomen","Chest","Back","Extremities","Skin","Generalities"],
  tylercold: ["All","Fever","Chill","Coryza","Sneezing","Cough","Sore Throat","Influenza","Generalities"],
  cowpert: ["All","Clinical Conditions"],
};

const CHAPTERS = CHAPTERS_BY_ABBREV["publicum"];

const CHAPTER_COLORS: Record<string, string> = {
  Mind:"#8A2BE2",Head:"#4e73df",Eye:"#4ECDC4",Ear:"#F59E0B",
  Nose:"#60a5fa",Face:"#f472b6",Mouth:"#ef4444",Throat:"#10b981",
  Stomach:"#f97316",Abdomen:"#6366f1",Rectum:"#84cc16",
  "Genitalia male":"#06b6d4","Genitalia female":"#ec4899",
  Chest:"#0ea5e9",Back:"#8b5cf6",Extremities:"#14b8a6",
  Sleep:"#a78bfa",Skin:"#fb923c",Generalities:"#64748b",
  Fever:"#f87171",Vision:"#34d399",Cough:"#fbbf24",
};

const chColor = (ch: string) => CHAPTER_COLORS[ch] ?? "#6b7280";
const gradeColor = (g: number) => g >= 3 ? "#ef4444" : g === 2 ? "#4e73df" : "#9ca3af";
const gradeDot   = (g: number) => g >= 3 ? "●●●" : g === 2 ? "●●" : "●";

// ─── Remedy Analysis Grid (OOREP-style) ───────────────────────────────────────

function RemedyGrid({ caseRubrics }: { caseRubrics: CaseRubric[] }) {
  if (caseRubrics.length === 0) return null;

  // Compute scores
  const scoreMap: Record<string, { abbrev: string; name: string; score: number; count: number }> = {};
  for (const cr of caseRubrics) {
    for (const [abbrev, name, grade] of cr.rubric.remedies) {
      if (!scoreMap[abbrev]) scoreMap[abbrev] = { abbrev, name, score: 0, count: 0 };
      scoreMap[abbrev].score += grade * cr.weight;
      scoreMap[abbrev].count += 1;
    }
  }
  const remedies = Object.values(scoreMap).sort((a, b) => b.score - a.score).slice(0, 30);
  if (!remedies.length) return null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--glass-border)" }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.7)", borderBottom: "1px solid var(--glass-border)" }}>
        <Grid3X3 className="h-4 w-4" style={{ color: "var(--accent-mineral)" }} />
        <p className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>Remedy Analysis</p>
        <span className="text-[11px] ml-auto font-mono-neo" style={{ color: "var(--text-dim)" }}>
          {remedies.length} remedies · {caseRubrics.length} rubrics
        </span>
      </div>

      {/* Grid: rubrics × remedies */}
      <div className="overflow-auto max-h-96 scrollbar-thin" style={{ background: "rgba(255,255,255,0.45)" }}>
        <table className="w-full text-[11px] border-collapse min-w-max">
          <thead>
            <tr style={{ position: "sticky", top: 0, background: "rgba(248,248,255,0.97)", zIndex: 10 }}>
              <th className="text-left px-3 py-2 font-semibold sticky left-0 z-20 min-w-48"
                style={{ color: "var(--text-dim)", background: "rgba(248,248,255,0.97)", borderBottom: "1px solid var(--glass-border)" }}>
                Rubric
              </th>
              {remedies.map(r => (
                <th key={r.abbrev} className="px-2 py-2 font-bold text-center whitespace-nowrap"
                  style={{ color: "var(--text-obsidian)", borderBottom: "1px solid var(--glass-border)", minWidth: "44px" }}>
                  {r.abbrev}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {caseRubrics.map((cr, i) => {
              const remedyMap = Object.fromEntries(cr.rubric.remedies.map(([a, , g]) => [a, g]));
              return (
                <tr key={cr.rubric.id}
                  style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(245,245,255,0.4)" }}>
                  <td className="px-3 py-1.5 sticky left-0 z-10 max-w-xs"
                    style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.95)" : "rgba(245,245,255,0.95)", borderRight: "1px solid var(--glass-border)" }}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ background: `${chColor(cr.rubric.chapter)}22`, color: chColor(cr.rubric.chapter) }}>
                        {cr.rubric.chapter.slice(0, 3)}
                      </span>
                      <span className="truncate max-w-[180px]" style={{ color: "var(--text-obsidian)" }} title={cr.rubric.fullpath}>
                        {cr.rubric.fullpath.split(", ").slice(1).join(", ") || cr.rubric.fullpath}
                      </span>
                      {cr.weight > 1 && (
                        <span className="text-[9px] font-bold px-1 rounded flex-shrink-0"
                          style={{ background: "rgba(78,115,223,0.15)", color: "#4e73df" }}>
                          ×{cr.weight}
                        </span>
                      )}
                      {cr.label && (
                        <span className="text-[9px] italic truncate max-w-16 flex-shrink-0" style={{ color: "var(--text-dim)" }}>
                          {cr.label}
                        </span>
                      )}
                    </div>
                  </td>
                  {remedies.map(r => {
                    const grade = remedyMap[r.abbrev];
                    return (
                      <td key={r.abbrev} className="text-center py-1.5 px-1">
                        {grade ? (
                          <span className="font-bold" style={{ color: gradeColor(grade), fontSize: "10px" }}>
                            {gradeDot(grade)}
                          </span>
                        ) : (
                          <span style={{ color: "rgba(0,0,0,0.1)" }}>·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* Totals row */}
            <tr style={{ background: "rgba(78,115,223,0.08)", position: "sticky", bottom: 0 }}>
              <td className="px-3 py-2 font-bold text-xs sticky left-0 z-10"
                style={{ background: "rgba(230,235,255,0.97)", borderTop: "2px solid #4e73df22", borderRight: "1px solid var(--glass-border)", color: "#4e73df" }}>
                Total score
              </td>
              {remedies.map(r => (
                <td key={r.abbrev} className="text-center py-2 font-bold text-xs"
                  style={{ color: "#4e73df", borderTop: "2px solid #4e73df22" }}>
                  {r.score}
                  <div className="text-[9px] font-normal" style={{ color: "var(--text-dim)" }}>{r.count}×</div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Bar Chart (compact view) ─────────────────────────────────────────────────

function RemedyBars({ caseRubrics }: { caseRubrics: CaseRubric[] }) {
  const scores: Record<string, { abbrev: string; name: string; score: number; count: number }> = {};
  for (const cr of caseRubrics) {
    for (const [abbrev, name, grade] of cr.rubric.remedies) {
      if (!scores[abbrev]) scores[abbrev] = { abbrev, name, score: 0, count: 0 };
      scores[abbrev].score += grade * cr.weight;
      scores[abbrev].count += 1;
    }
  }
  const sorted = Object.values(scores).sort((a, b) => b.score - a.score).slice(0, 15);
  const max = sorted[0]?.score ?? 1;
  if (!sorted.length) return null;

  return (
    <div className="space-y-1.5">
      {sorted.map((r, i) => (
        <div key={r.abbrev} className="flex items-center gap-2">
          <span className="text-[10px] w-3 text-right font-mono-neo flex-shrink-0" style={{ color: "var(--text-dim)" }}>{i + 1}</span>
          <span className="text-xs font-semibold w-16 flex-shrink-0" style={{ color: "var(--text-obsidian)" }}>{r.abbrev}</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
            <div className="h-full rounded-full" style={{
              width: `${(r.score / max) * 100}%`,
              background: i < 3 ? "var(--accent-mineral)" : i < 8 ? "#4e73df" : "#9ca3af",
            }} />
          </div>
          <span className="text-[10px] w-6 font-bold text-right" style={{ color: "var(--text-dim)" }}>{r.score}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Save Case Modal ──────────────────────────────────────────────────────────

function SaveCaseModal({
  caseRubrics,
  onClose,
  onSaved,
}: {
  caseRubrics: CaseRubric[];
  onClose: () => void;
  onSaved: (caseId: string) => void;
}) {
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [caseName, setCaseName] = useState("New Case");
  const [saving, setSaving] = useState(false);
  const [creatingFile, setCreatingFile] = useState(false);

  useEffect(() => {
    fetch("/api/cases")
      .then(r => r.json())
      .then(d => { setFiles(d.files ?? []); if (d.files?.length) setSelectedFile(d.files[0].id); })
      .catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    try {
      let fileId = selectedFile;

      if (!fileId && newFileName.trim()) {
        const r = await fetch("/api/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "file", name: newFileName.trim() }),
        });
        const d = await r.json();
        fileId = d.file?.id;
      }

      if (!fileId) return;

      const caseRes = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "case", fileId, name: caseName }),
      });
      const caseData = await caseRes.json();
      const caseId = caseData.case?.id;
      if (!caseId) return;

      for (const cr of caseRubrics) {
        await fetch("/api/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "rubric",
            caseId,
            rubricId: cr.rubric.id,
            rubricFullpath: cr.rubric.fullpath,
            rubricChapter: cr.rubric.chapter,
            rubricRemedies: cr.rubric.remedies,
            weight: cr.weight,
            label: cr.label,
          }),
        });
      }

      onSaved(caseId);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="m-auto w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: "var(--silica-bg)", border: "1px solid var(--glass-border)" }}
        onClick={e => e.stopPropagation()}>
        <div className="p-5 pb-4" style={{ borderBottom: "1px solid var(--glass-border)" }}>
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-base" style={{ color: "var(--text-obsidian)" }}>Save Case</p>
            <button onClick={onClose} style={{ color: "var(--text-dim)" }}><X className="h-4 w-4" /></button>
          </div>
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>{caseRubrics.length} rubrics</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-dim)" }}>Case Name</label>
            <input value={caseName} onChange={e => setCaseName(e.target.value)}
              className="w-full h-10 rounded-xl px-3 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }} />
          </div>

          {files.length > 0 && (
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-dim)" }}>File</label>
              <select value={selectedFile} onChange={e => setSelectedFile(e.target.value)}
                className="w-full h-10 rounded-xl px-3 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}>
                {files.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                <option value="">+ New file…</option>
              </select>
            </div>
          )}

          {(!files.length || selectedFile === "") && (
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-dim)" }}>New File Name</label>
              <input value={newFileName} onChange={e => setNewFileName(e.target.value)}
                placeholder="My Homeopathy Cases"
                className="w-full h-10 rounded-xl px-3 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }} />
            </div>
          )}

          <button onClick={save} disabled={saving || (!selectedFile && !newFileName.trim())}
            className="w-full h-11 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "var(--accent-mineral)", color: "white" }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save to File
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Load Case Modal ──────────────────────────────────────────────────────────

function LoadCaseModal({ onLoad, onClose }: { onLoad: (rubrics: CaseRubric[]) => void; onClose: () => void }) {
  const [files, setFiles] = useState<(CaseFile & { cases: SavedCase[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cases").then(r => r.json()).then(d => setFiles(d.files ?? [])).finally(() => setLoading(false));
  }, []);

  async function loadCase(caseId: string) {
    const r = await fetch(`/api/cases?caseId=${caseId}`);
    const d = await r.json();
    if (!d.rubrics) return;
    const loaded: CaseRubric[] = d.rubrics.map((cr: { rubric_id: string; rubric_fullpath: string; rubric_chapter: string; rubric_remedies: Remedy[]; weight: 1|2|3; label: string }) => ({
      rubric: { id: cr.rubric_id, fullpath: cr.rubric_fullpath, chapter: cr.rubric_chapter, remedies: cr.rubric_remedies, is_mother: false, path: "" },
      weight: cr.weight,
      label: cr.label ?? "",
    }));
    onLoad(loaded);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="m-auto w-full max-w-sm rounded-3xl overflow-hidden max-h-[80vh] flex flex-col"
        style={{ background: "var(--silica-bg)", border: "1px solid var(--glass-border)" }}
        onClick={e => e.stopPropagation()}>
        <div className="p-5 pb-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: "1px solid var(--glass-border)" }}>
          <p className="font-bold text-base" style={{ color: "var(--text-obsidian)" }}>Load Case</p>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }}><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {loading && <div className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" style={{ color: "var(--accent-mineral)" }} /></div>}
          {!loading && !files.length && (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-dim)" }}>No saved cases yet</p>
          )}
          {files.map(file => (
            <div key={file.id}>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--accent-mineral)" }}>
                <FolderOpen className="h-3 w-3 inline mr-1" />{file.name}
              </p>
              {(file.cases ?? []).map((c: SavedCase) => (
                <button key={c.id} onClick={() => loadCase(c.id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all hover:scale-[1.01]"
                  style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}>
                  {c.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Rubric Row ───────────────────────────────────────────────────────────────

function RubricRow({ rubric, onAdd, inCase }: { rubric: Rubric; onAdd: (r: Rubric) => void; inCase: boolean }) {
  const [saved, setSaved] = useState(false);
  async function saveRubric(e: React.MouseEvent) {
    e.stopPropagation();
    const res = await fetch("/api/saved-rubrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rubric_path: rubric.fullpath,
        chapter: rubric.chapter,
        source_abbrev: "",
        remedies: rubric.remedies.map(([, name, grade]) => ({ name, grade })),
      }),
    });
    if (res.ok || res.status === 409) {
      setSaved(true);
      toast.success("Rubric saved");
    }
  }
  const [open, setOpen] = useState(false);
  const color = chColor(rubric.chapter);

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ background: "rgba(255,255,255,0.55)", border: `1px solid ${open ? color : "var(--glass-border)"}`, backdropFilter: "blur(12px)" }}>
      <div className="flex items-center gap-2.5 p-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${color}20`, color }}>{rubric.chapter}</span>
        <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--text-obsidian)" }}>{rubric.fullpath}</span>
        <span className="text-[11px] flex-shrink-0 font-mono-neo" style={{ color: "var(--text-dim)" }}>{rubric.remedies.length}</span>
        <button onClick={saveRubric}
          className="flex-shrink-0 p-1.5 rounded-xl transition-all"
          title="Save rubric"
          style={{
            background: saved ? "rgba(138,43,226,0.1)" : "rgba(255,255,255,0.7)",
            color: saved ? "#8A2BE2" : "var(--text-dim)",
            border: `1px solid ${saved ? "#8A2BE2" : "var(--glass-border)"}`,
          }}>
          <Bookmark className="h-3.5 w-3.5" fill={saved ? "#8A2BE2" : "none"} />
        </button>
        <button onClick={e => { e.stopPropagation(); onAdd(rubric); }}
          className="flex-shrink-0 p-1.5 rounded-xl transition-all"
          style={{
            background: inCase ? `${color}20` : "rgba(255,255,255,0.7)",
            color: inCase ? color : "var(--text-dim)",
            border: `1px solid ${inCase ? color : "var(--glass-border)"}`,
          }}>
          {inCase ? <ChevronRight className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3 flex flex-wrap gap-1">
          {rubric.remedies.map(([abbrev,, grade], i) => (
            <span key={i} className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${gradeColor(grade)}18`, color: gradeColor(grade), border: `1px solid ${gradeColor(grade)}25` }}
              title={rubric.remedies[i][1]}>
              {abbrev} <span style={{ opacity: 0.6 }}>{gradeDot(grade)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function RepertoryPageInner() {
  const searchParams = useSearchParams();
  const [repertory, setRepertory] = useState("publicum");
  const [showRepPicker, setShowRepPicker] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [remedyFilter, setRemedyFilter] = useState("");
  const [activeChapter, setActiveChapter] = useState(searchParams.get("chapter") ?? "All");
  const chapters = CHAPTERS_BY_ABBREV[repertory] ?? CHAPTERS_BY_ABBREV["publicum"];
  const activeRep = REPERTORIES.find(r => r.abbrev === repertory)!;
  const [minWeight, setMinWeight] = useState(1);
  const [results, setResults] = useState<Rubric[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [caseRubrics, setCaseRubrics] = useState<CaseRubric[]>([]);
  const [view, setView] = useState<"grid" | "bars">("grid");
  const [showSave, setShowSave] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const PER_PAGE = 50;

  const doSearch = useCallback(async (p = 0) => {
    const q = query.trim();
    const rf = remedyFilter.trim();
    if (!q && activeChapter === "All" && !rf) return;
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ limit: String(PER_PAGE), page: String(p), minWeight: String(minWeight), abbrev: repertory });
      if (q) params.set("q", q);
      if (activeChapter !== "All") params.set("chapter", activeChapter);
      if (rf) params.set("remedy", rf);
      const res = await fetch(`/api/repertory?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Search failed");
      if (p === 0) setResults(json.results ?? []);
      else setResults(prev => [...prev, ...(json.results ?? [])]);
      setTotal(json.total ?? 0);
      setPage(p);
      setSearched(true);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, [query, remedyFilter, activeChapter, minWeight, repertory]);

  function addToCase(rubric: Rubric) {
    setCaseRubrics(prev => prev.find(cr => cr.rubric.id === rubric.id) ? prev : [...prev, { rubric, weight: 1, label: "" }]);
  }

  function removeFromCase(id: string) {
    setCaseRubrics(prev => prev.filter(cr => cr.rubric.id !== id));
  }

  function setWeight(id: string, w: 1 | 2 | 3) {
    setCaseRubrics(prev => prev.map(cr => cr.rubric.id === id ? { ...cr, weight: w } : cr));
  }

  function setLabel(id: string, label: string) {
    setCaseRubrics(prev => prev.map(cr => cr.rubric.id === id ? { ...cr, label } : cr));
  }

  const caseIds = new Set(caseRubrics.map(cr => cr.rubric.id));

  // Load a saved case from URL param ?caseId=X (M6)
  useEffect(() => {
    const caseId = searchParams.get("caseId");
    if (!caseId) return;
    fetch(`/api/cases?caseId=${caseId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.rubrics) return;
        const loaded: CaseRubric[] = (data.rubrics as Array<{ rubric_path: string; chapter: string; weight: number; label: string; rubric_id: string; remedies?: Remedy[] }>).map(r => ({
          rubric: {
            id: r.rubric_id ?? r.rubric_path,
            chapter: r.chapter,
            fullpath: r.rubric_path,
            path: r.rubric_path,
            is_mother: false,
            remedies: r.remedies ?? [],
          },
          weight: (r.weight ?? 1) as 1 | 2 | 3,
          label: r.label ?? "",
        }));
        setCaseRubrics(loaded);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-run search if ?q or ?chapter was provided via URL
  useEffect(() => {
    const urlQ = searchParams.get("q");
    const urlCh = searchParams.get("chapter");
    if (urlQ || urlCh) {
      doSearch(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 md:p-5 max-w-[1600px] mx-auto">
      {showSave && <SaveCaseModal caseRubrics={caseRubrics} onClose={() => setShowSave(false)} onSaved={id => { setShowSave(false); setSavedMsg("Case saved!"); setTimeout(() => setSavedMsg(""), 3000); }} />}
      {showLoad && <LoadCaseModal onLoad={rubrics => { setCaseRubrics(rubrics); }} onClose={() => setShowLoad(false)} />}

      {/* Repertory picker dropdown */}
      {showRepPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowRepPicker(false)}>
          <div className="absolute top-20 left-4 w-80 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "var(--silica-bg)", border: "1px solid var(--glass-border)" }}
            onClick={e => e.stopPropagation()}>
            <div className="p-3 border-b" style={{ borderColor: "var(--glass-border)" }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-dim)" }}>Select Repertory</p>
            </div>
            {REPERTORIES.map(rep => (
              <button key={rep.abbrev}
                onClick={() => { setRepertory(rep.abbrev); setActiveChapter("All"); setResults([]); setSearched(false); setShowRepPicker(false); }}
                disabled={rep.status === "soon"}
                className="w-full text-left px-4 py-3 flex items-center gap-3 transition-all disabled:opacity-40"
                style={{
                  background: repertory === rep.abbrev ? "rgba(78,115,223,0.1)" : "transparent",
                  borderBottom: "1px solid var(--glass-border)",
                }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {rep.status === "live" && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: "#10b981" }} />
                    )}
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-obsidian)" }}>{rep.title}</p>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--text-dim)" }}>{rep.author} · {rep.year}{rep.note ? ` · ${rep.note}` : ""}</p>
                </div>
                {rep.status === "soon" && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "#fef3c7", color: "#d97706" }}>SOON</span>
                )}
                {rep.status === "live" && repertory === rep.abbrev && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "#d1fae5", color: "#065f46" }}>ACTIVE</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowRepPicker(s => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all"
            style={{ background: showRepPicker ? "var(--accent-mineral)" : "rgba(255,255,255,0.7)", color: showRepPicker ? "white" : "var(--text-obsidian)", border: "1px solid var(--glass-border)" }}>
            <BookOpen className="h-4 w-4" />
            {activeRep.title}
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
          <div>
            <p className="text-[11px] font-mono-neo" style={{ color: "var(--text-dim)" }}>{activeRep.author} · {activeRep.year} · GPL-3.0</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {savedMsg && <span className="text-xs font-semibold px-3 py-1.5 rounded-xl" style={{ background: "#d1fae5", color: "#065f46" }}>{savedMsg}</span>}
          {caseRubrics.length > 0 && (
            <>
              <button onClick={() => setShowLoad(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}>
                <FolderOpen className="h-3.5 w-3.5" />Load
              </button>
              <button onClick={() => setShowSave(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: "var(--accent-mineral)", color: "white" }}>
                <Save className="h-3.5 w-3.5" />Save Case
              </button>
            </>
          )}
          {!caseRubrics.length && (
            <button onClick={() => setShowLoad(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}>
              <FolderOpen className="h-3.5 w-3.5" />Load Case
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* ── Left: Search (3/5 cols) ── */}
        <div className="xl:col-span-3 space-y-3">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-dim)" }} />
              <input ref={inputRef} type="text" placeholder="Search symptoms, rubrics…"
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doSearch(0)}
                className="w-full h-11 rounded-2xl pl-10 pr-4 text-sm outline-none font-medium"
                style={{ background: "rgba(255,255,255,0.65)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }} />
            </div>
            <button onClick={() => setShowFilters(s => !s)}
              className="h-11 px-3 rounded-2xl text-sm font-semibold flex items-center gap-1.5 transition-all"
              style={{ background: showFilters ? "var(--accent-mineral)" : "rgba(255,255,255,0.65)", border: "1px solid var(--glass-border)", color: showFilters ? "white" : "var(--text-dim)" }}>
              <Filter className="h-4 w-4" />
            </button>
            <button onClick={() => doSearch(0)} disabled={loading}
              className="h-11 px-5 rounded-2xl text-sm font-semibold flex items-center gap-2 disabled:opacity-40"
              style={{ background: "var(--accent-mineral)", color: "white" }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </button>
          </div>

          {/* Filter row */}
          {showFilters && (
            <div className="flex gap-2 flex-wrap items-center p-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.5)", border: "1px solid var(--glass-border)" }}>
              <div className="flex items-center gap-2 flex-1 min-w-40">
                <FlaskConical className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--text-dim)" }} />
                <input type="text" placeholder="Remedy filter (e.g. Sulph, Puls)"
                  value={remedyFilter} onChange={e => setRemedyFilter(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doSearch(0)}
                  className="flex-1 h-8 rounded-xl px-3 text-xs outline-none"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold" style={{ color: "var(--text-dim)" }}>Min grade:</span>
                {[1,2,3].map(w => (
                  <button key={w} onClick={() => setMinWeight(w)}
                    className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: minWeight === w ? "var(--accent-mineral)" : "rgba(255,255,255,0.7)",
                      color: minWeight === w ? "white" : gradeColor(w),
                      border: `1px solid ${minWeight === w ? "var(--accent-mineral)" : "var(--glass-border)"}`,
                    }}>
                    {gradeDot(w)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chapter tabs */}
          <div className="flex gap-1 flex-wrap">
            {chapters.map(ch => {
              const active = activeChapter === ch;
              const color = ch === "All" ? "var(--accent-mineral)" : chColor(ch);
              return (
                <button key={ch} onClick={() => setActiveChapter(ch)}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
                  style={{ background: active ? color : "rgba(255,255,255,0.6)", color: active ? "white" : "var(--text-dim)", border: `1px solid ${active ? color : "var(--glass-border)"}` }}>
                  {ch}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-xs"
              style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444" }}>
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Results + Grade Legend */}
          {searched && !loading && (
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <p className="text-xs font-mono-neo" style={{ color: "var(--text-dim)" }}>
                {total.toLocaleString()} rubrics found · showing {results.length}
                {remedyFilter && ` · filtered by "${remedyFilter}"`}
              </p>
              <div className="flex items-center gap-3 text-[10px] font-semibold font-mono-neo">
                <span style={{ color: "#ef4444" }}>●●● Grade 3</span>
                <span style={{ color: "#4e73df" }}>●● Grade 2</span>
                <span style={{ color: "#9ca3af" }}>● Grade 1</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {results.map(r => <RubricRow key={r.id} rubric={r} onAdd={addToCase} inCase={caseIds.has(r.id)} />)}
          </div>

          {!loading && results.length > 0 && results.length < total && (
            <button onClick={() => doSearch(page + 1)} disabled={loading}
              className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Load more ({total - results.length} remaining)
            </button>
          )}

          {!searched && !loading && (
            <div className="text-center py-16" style={{ color: "var(--text-dim)" }}>
              <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">Search the Kent Repertory</p>
              <p className="text-xs mt-1">Type symptoms or chapter names and press Enter</p>
            </div>
          )}

          {searched && results.length === 0 && !loading && !error && (
            <div className="text-center py-12" style={{ color: "var(--text-dim)" }}>
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No rubrics found</p>
              <p className="text-xs mt-1">Try broader terms like &ldquo;fear&rdquo; or change chapter</p>
            </div>
          )}
        </div>

        {/* ── Right: Case Panel (2/5 cols) ── */}
        <div className="xl:col-span-2 space-y-3">
          {caseRubrics.length === 0 ? (
            <div className="rounded-2xl p-6 text-center"
              style={{ background: "rgba(255,255,255,0.4)", border: "1px dashed var(--glass-border)" }}>
              <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-20" style={{ color: "var(--text-obsidian)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--text-dim)" }}>Case Analysis</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>Add rubrics from results to build your case</p>
              <button onClick={() => setShowLoad(true)} className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}>
                <FolderOpen className="h-3 w-3 inline mr-1" />Load saved case
              </button>
            </div>
          ) : (
            <>
              {/* Case rubric list */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.55)", border: "1px solid var(--glass-border)" }}>
                <div className="p-3 flex items-center gap-2" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                  <FlaskConical className="h-4 w-4" style={{ color: "var(--accent-mineral)" }} />
                  <p className="font-bold text-sm flex-1" style={{ color: "var(--text-obsidian)" }}>
                    Case Rubrics <span className="font-normal text-xs" style={{ color: "var(--text-dim)" }}>({caseRubrics.length})</span>
                  </p>
                  <button onClick={() => setCaseRubrics([])} className="text-xs" style={{ color: "var(--text-dim)" }}>Clear</button>
                </div>
                <div className="max-h-72 overflow-y-auto scrollbar-thin divide-y" style={{ borderColor: "var(--glass-border)" }}>
                  {caseRubrics.map(cr => (
                    <div key={cr.rubric.id} className="p-2.5 space-y-1">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-tight" style={{ color: "var(--text-obsidian)" }}>
                            {cr.rubric.fullpath}
                          </p>
                        </div>
                        <div className="flex gap-0.5 flex-shrink-0">
                          {([1,2,3] as const).map(w => (
                            <button key={w} onClick={() => setWeight(cr.rubric.id, w)}
                              className="w-6 h-6 rounded-lg text-[10px] font-bold transition-all"
                              style={{ background: cr.weight === w ? "var(--accent-mineral)" : "rgba(0,0,0,0.06)", color: cr.weight === w ? "white" : "var(--text-dim)" }}>
                              {w}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => removeFromCase(cr.rubric.id)} style={{ color: "#9ca3af" }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input value={cr.label} onChange={e => setLabel(cr.rubric.id, e.target.value)}
                        placeholder="Label (optional)…"
                        className="w-full h-6 rounded-lg px-2 text-[11px] outline-none"
                        style={{ background: "rgba(0,0,0,0.04)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold flex-1" style={{ color: "var(--text-dim)" }}>Analysis View</p>
                <button onClick={() => setView("grid")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: view === "grid" ? "var(--accent-mineral)" : "rgba(255,255,255,0.7)", color: view === "grid" ? "white" : "var(--text-dim)", border: "1px solid var(--glass-border)" }}>
                  <Grid3X3 className="h-3 w-3" />Grid
                </button>
                <button onClick={() => setView("bars")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: view === "bars" ? "var(--accent-mineral)" : "rgba(255,255,255,0.7)", color: view === "bars" ? "white" : "var(--text-dim)", border: "1px solid var(--glass-border)" }}>
                  <BarChart3 className="h-3 w-3" />Bars
                </button>
              </div>

              {/* Analysis */}
              {view === "grid" ? (
                <RemedyGrid caseRubrics={caseRubrics} />
              ) : (
                <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid var(--glass-border)" }}>
                  <p className="font-bold text-sm mb-3" style={{ color: "var(--text-obsidian)" }}>
                    Top Remedies
                  </p>
                  <RemedyBars caseRubrics={caseRubrics} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RepertoryPage() {
  return (
    <Suspense>
      <RepertoryPageInner />
    </Suspense>
  );
}
