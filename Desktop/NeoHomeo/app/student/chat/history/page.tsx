"use client";

import { useState } from "react";
import { MessageSquare, Search, ChevronRight, Clock, Trash2 } from "lucide-react";
import Link from "next/link";

const THREADS = [
  { id: "1", title: "Explain Sulphur keynotes", mode: "materia-medica", lastMsg: "Sulphur is characterized by burning sensations, hot patient constitution...", time: "2 hours ago", msgs: 6 },
  { id: "2", title: "Aphorism 153 explained", mode: "organon", lastMsg: "§153 deals with the peculiar symptoms — the PQRS symptoms that guide remedy selection...", time: "Yesterday", msgs: 4 },
  { id: "3", title: "Compare Pulsatilla vs Sepia", mode: "general", lastMsg: "Both are female remedies but differ greatly: Pulsatilla is mild and yielding...", time: "2 days ago", msgs: 8 },
  { id: "4", title: "Fear rubrics in Kent repertory", mode: "repertory", lastMsg: "The main fear rubrics are: Fear, death of (grade 3: Acon, Ars); Fear, alone...", time: "3 days ago", msgs: 5 },
  { id: "5", title: "Lycopodium clinical picture", mode: "clinical", lastMsg: "Lycopodium is a Psoric/Sycotic remedy. The typical patient has...", time: "1 week ago", msgs: 12 },
];

const modeColors: Record<string, string> = {
  "general": "#6b7280", "materia-medica": "#4e73df", "organon": "#4ECDC4",
  "repertory": "#8A2BE2", "clinical": "#F59E0B", "research": "#ef4444",
};

export default function ChatHistoryPage() {
  const [threads, setThreads] = useState(THREADS);
  const [search, setSearch] = useState("");

  const filtered = threads.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.lastMsg.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Chat History</h1>
        <p className="text-sm font-mono-neo mt-0.5" style={{ color: "var(--text-dim)" }}>{threads.length} conversations</p>
      </div>

      <div className="shard p-3 flex items-center gap-3">
        <Search className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-dim)" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations…"
          className="flex-1 bg-transparent outline-none text-sm" style={{ color: "var(--text-obsidian)" }} />
      </div>

      <div className="space-y-3">
        {filtered.map((thread) => (
          <div key={thread.id} className="shard p-4 group flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${modeColors[thread.mode]}15` }}>
              <MessageSquare className="h-4 w-4" style={{ color: modeColors[thread.mode] }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-sm truncate" style={{ color: "var(--text-obsidian)" }}>{thread.title}</h3>
                <span className="text-[10px] font-mono-neo px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                  style={{ background: `${modeColors[thread.mode]}15`, color: modeColors[thread.mode] }}>{thread.mode}</span>
              </div>
              <p className="text-xs truncate" style={{ color: "var(--text-dim)" }}>{thread.lastMsg}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{thread.time}</span>
                <span>{thread.msgs} messages</span>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setThreads(threads.filter((t) => t.id !== thread.id))}
                className="p-1.5 rounded-xl hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </button>
              <Link href={`/student/chat?thread=${thread.id}`} className="p-1.5 rounded-xl hover:bg-white/50">
                <ChevronRight className="h-4 w-4" style={{ color: "var(--accent-mineral)" }} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
