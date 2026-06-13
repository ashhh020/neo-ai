"use client";
import { authedFetch } from "@/lib/authed-fetch";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, FileText, BookOpen, Loader2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  created_at: string;
}

const tagColors: Record<string, string> = {
  "materia-medica": "#4e73df",
  "organon": "#4ECDC4",
  "repertory": "#8A2BE2",
  "sulphur": "#F59E0B",
  "key-aphorism": "#ef4444",
  "mind": "#8A2BE2",
  "clinical": "#F59E0B",
  "research": "#ef4444",
};

function getTagColor(tag: string): string {
  return tagColors[tag.toLowerCase()] ?? "#6b7280";
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await authedFetch("/api/notes");
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return !q ||
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      (n.tags ?? []).some(tag => tag.toLowerCase().includes(q));
  });

  async function addNote() {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const res = await authedFetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
          color: "#8A2BE2",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes([data.note, ...notes]);
        setNewTitle(""); setNewContent(""); setNewTags(""); setShowNew(false);
        toast.success("Note saved");
        // Award XP
        authedFetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activity: "note_created" }) });
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(id: string) {
    const res = await authedFetch(`/api/notes?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent }),
    });
    if (res.ok) {
      const data = await res.json();
      setNotes(notes.map(n => n.id === id ? data.note : n));
      setEditingId(null);
      toast.success("Note updated");
    }
  }

  async function deleteNote(id: string) {
    await authedFetch(`/api/notes?id=${id}`, { method: "DELETE" });
    setNotes(notes.filter((n) => n.id !== id));
    toast.success("Note deleted");
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
            <button onClick={addNote} disabled={saving || !newTitle.trim()}
              className="px-5 py-2 rounded-xl text-white font-semibold text-sm gradient-mineral disabled:opacity-60 flex items-center gap-2">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Note
            </button>
            <button onClick={() => setShowNew(false)} className="px-5 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-dim)" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent-mineral)" }} />
        </div>
      )}

      {/* Notes grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((note) => (
            <div key={note.id} className="shard p-5 group">
              {editingId === note.id ? (
                <div className="space-y-3">
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    className="w-full h-9 rounded-lg px-3 text-sm font-medium outline-none"
                    style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }} />
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={4}
                    className="w-full rounded-lg px-3 py-2 text-xs outline-none resize-none"
                    style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }} />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(note.id)} className="p-1.5 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}><X className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 flex-shrink-0" style={{ color: "var(--accent-mineral)" }} />
                      <h3 className="font-bold text-sm truncate" style={{ color: "var(--text-obsidian)" }}>{note.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(note.id); setEditTitle(note.title); setEditContent(note.content); }}
                        className="p-1 rounded-lg hover:bg-blue-50">
                        <Edit2 className="h-3.5 w-3.5 text-blue-400" />
                      </button>
                      <button onClick={() => deleteNote(note.id)} className="p-1 rounded-lg hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mb-3 line-clamp-3" style={{ color: "var(--text-dim)" }}>{note.content}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(note.tags ?? []).map((tag) => (
                      <span key={tag} className="text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${getTagColor(tag)}15`, color: getTagColor(tag) }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="shard p-12 text-center">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>No notes yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
            {search ? "No notes match your search" : "Click \"New Note\" to create your first note"}
          </p>
        </div>
      )}
    </div>
  );
}
