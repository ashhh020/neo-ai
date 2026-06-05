"use client";

import { useState } from "react";
import { Plus, Search, Trash2, FileText, BookOpen, Layers } from "lucide-react";

const INITIAL_NOTES = [
  { id: "1", title: "Sulphur — Mind Symptoms", content: "The Sulphur patient is philosophical, dirty, and ragged. They have a tendency to theorise. Burning sensations are characteristic throughout the body. Worse from heat and standing. Hungry at 11 AM.", tags: ["materia-medica", "sulphur"], createdAt: "2026-06-01" },
  { id: "2", title: "Aphorism §153 — Key Points", content: "The most striking, singular, uncommon and peculiar symptoms guide the remedy selection. These PQRS symptoms are most important. Common symptoms confirm but do not lead.", tags: ["organon", "key-aphorism"], createdAt: "2026-06-02" },
  { id: "3", title: "Repertory — Mind Chapter Notes", content: "Fear rubrics: Fear, death of; Fear, alone, being; Fear, dark; Fear, disease of. Note that Kent uses grades 1-3 for remedies. Grade 3 = bold italic (most important).", tags: ["repertory", "mind"], createdAt: "2026-06-03" },
];

const tagColors: Record<string, string> = {
  "materia-medica": "#4e73df",
  "organon": "#4ECDC4",
  "repertory": "#8A2BE2",
  "sulphur": "#F59E0B",
  "key-aphorism": "#ef4444",
  "mind": "#8A2BE2",
};

export default function NotesPage() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<null | typeof INITIAL_NOTES[0]>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [showNew, setShowNew] = useState(false);

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  function addNote() {
    if (!newTitle || !newContent) return;
    const note = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setNotes([note, ...notes]);
    setNewTitle(""); setNewContent(""); setNewTags(""); setShowNew(false);
  }

  function deleteNote(id: string) {
    setNotes(notes.filter((n) => n.id !== id));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Study Notes</h1>
          <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>{notes.length} notes</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-semibold text-sm gradient-mineral hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> New Note
        </button>
      </div>

      {/* Search */}
      <div className="shard p-3 flex items-center gap-3">
        <Search className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-dim)" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes…"
          className="flex-1 bg-transparent outline-none text-sm" style={{ color: "var(--text-obsidian)" }} />
      </div>

      {/* New note form */}
      {showNew && (
        <div className="shard p-6 space-y-4">
          <h3 className="font-bold" style={{ color: "var(--text-obsidian)" }}>New Note</h3>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title…"
            className="w-full h-10 rounded-xl px-4 text-sm font-medium outline-none"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }} />
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write your notes here…" rows={4}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }} />
          <input value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="Tags (comma separated): sulphur, organon…"
            className="w-full h-10 rounded-xl px-4 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }} />
          <div className="flex gap-2">
            <button onClick={addNote} className="px-5 py-2 rounded-xl text-white font-semibold text-sm gradient-mineral">Save Note</button>
            <button onClick={() => setShowNew(false)} className="px-5 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-dim)" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Notes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((note) => (
          <div key={note.id} className="shard p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 flex-shrink-0" style={{ color: "var(--accent-mineral)" }} />
                <h3 className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>{note.title}</h3>
              </div>
              <button onClick={() => deleteNote(note.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </button>
            </div>
            <p className="text-xs leading-relaxed mb-3 line-clamp-3" style={{ color: "var(--text-dim)" }}>{note.content}</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {note.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
                  style={{ background: `${tagColors[tag] || "#4e73df"}15`, color: tagColors[tag] || "#4e73df" }}>
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>{note.createdAt}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="shard p-12 text-center">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>No notes found</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>Create your first note above</p>
        </div>
      )}
    </div>
  );
}
