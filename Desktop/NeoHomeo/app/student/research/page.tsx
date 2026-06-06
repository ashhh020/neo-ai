"use client";

import { useState } from "react";
import { Search, Book, ChevronRight, ExternalLink } from "lucide-react";

const SOURCES = [
  { id: "mm", label: "Materia Medica", icon: "📖", color: "#4e73df" },
  { id: "organon", label: "Organon", icon: "📜", color: "#4ECDC4" },
  { id: "repertory", label: "Repertory", icon: "🗂️", color: "#8A2BE2" },
  { id: "all", label: "All Sources", icon: "🔍", color: "#F59E0B" },
];

const DOCUMENTS = [
  { id: "1", title: "Boericke's Materia Medica: Sulphur", source: "materia_medica", excerpt: "Sulphur is one of the most frequently indicated remedies. The typical Sulphur patient is dirty, ragged, and has a philosophical mind. Burning sensations are characteristic throughout. Worse from heat, better from cold applications.", author: "William Boericke", pages: "610-615" },
  { id: "2", title: "Kent's Lectures: Natrum Muriaticum", source: "materia_medica", excerpt: "The Natrum Mur patient has never been well since a grief or disappointment. There is a tendency to dwell on past disagreeable occurrences. Great aversion to consolation.", author: "James Tyler Kent", pages: "700-720" },
  { id: "3", title: "Organon §153: The Peculiar Symptom", source: "organon", excerpt: "In searching for the specific remedy for a disease, the more striking, singular, uncommon, and peculiar signs and symptoms of the case are chiefly and almost solely to be taken into consideration.", author: "Samuel Hahnemann", pages: "Aphorism 153" },
  { id: "4", title: "Organon §9: The Vital Force", source: "organon", excerpt: "In the healthy condition of man, the spiritual vital force animating the material human organism reigns in supreme sovereignty. It keeps all the parts of the organism in admirable, harmonious, vital operation.", author: "Samuel Hahnemann", pages: "Aphorism 9" },
  { id: "5", title: "Kent Repertory: Mind Chapter Introduction", source: "repertory", excerpt: "The Mind symptoms in the repertory represent the innermost nature of the patient. They are the most important rubrics for finding the similimum. Grade 3 remedies (bold italic) are most strongly represented.", author: "James Tyler Kent", pages: "1-10" },
  { id: "6", title: "Clarke's Dictionary: Lycopodium", source: "materia_medica", excerpt: "Lycopodium is a deep acting, long acting remedy. The patient is physically weak but mentally domineering. Worse 4-8 PM. Right-sided symptoms. Flatulence prominent. Cowardly bully.", author: "John Henry Clarke", pages: "402-420" },
];

const sourceColors: Record<string, string> = { materia_medica: "#4e73df", organon: "#4ECDC4", repertory: "#8A2BE2" };
const sourceLabels: Record<string, string> = { materia_medica: "Materia Medica", organon: "Organon", repertory: "Repertory" };

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = DOCUMENTS.filter((d) =>
    (filter === "all" || d.source === filter) &&
    (d.title.toLowerCase().includes(query.toLowerCase()) || d.excerpt.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Research Library</h1>
        <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>Search across Boericke, Kent, Hahnemann &amp; Clarke</p>
      </div>

      {/* Search */}
      <div className="shard p-4 flex items-center gap-3">
        <Search className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-dim)" }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search remedies, aphorisms, rubrics…"
          className="flex-1 bg-transparent outline-none text-sm font-medium" style={{ color: "var(--text-obsidian)" }} />
      </div>

      {/* Source filters */}
      <div className="flex gap-3 flex-wrap">
        {SOURCES.map((s) => (
          <button key={s.id} onClick={() => setFilter(s.id === "all" ? "all" : s.id.replace("-", "_"))}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition-all"
            style={{
              background: (filter === s.id || (s.id === "all" && filter === "all")) ? s.color : "rgba(255,255,255,0.5)",
              color: (filter === s.id || (s.id === "all" && filter === "all")) ? "white" : "var(--text-dim)",
              border: "1px solid var(--glass-border)",
            }}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filtered.map((doc) => (
          <div key={doc.id} className="shard p-5 group">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${sourceColors[doc.source]}15` }}>
                  <Book className="h-4 w-4" style={{ color: sourceColors[doc.source] }} />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-0.5" style={{ color: "var(--text-obsidian)" }}>{doc.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
                      style={{ background: `${sourceColors[doc.source]}15`, color: sourceColors[doc.source] }}>
                      {sourceLabels[doc.source]}
                    </span>
                    <span className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>— {doc.author}</span>
                    <span className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>p. {doc.pages}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed mt-3 mb-4" style={{ color: "var(--text-dim)" }}>&ldquo;{doc.excerpt}&rdquo;</p>
            <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--accent-mineral)" }}>
              Read full section <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
