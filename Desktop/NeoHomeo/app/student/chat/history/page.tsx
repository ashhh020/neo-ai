"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Search, ChevronRight, Clock, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Thread {
  id: string;
  title: string;
  mode: string;
  message_count: number;
  updated_at: string;
}

const modeColors: Record<string, string> = {
  "general": "#6b7280", "materia-medica": "#4e73df", "organon": "#4ECDC4",
  "repertory": "#8A2BE2", "clinical": "#F59E0B", "research": "#ef4444",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ChatHistoryPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/chat");
        if (res.ok) {
          const data = await res.json();
          setThreads(data.threads ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function deleteThread(id: string) {
    await fetch(`/api/chat?threadId=${id}`, { method: "DELETE" });
    setThreads((prev) => prev.filter((t) => t.id !== id));
    toast.success("Conversation deleted");
  }

  const filtered = threads.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
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

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent-mineral)" }} />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="shard p-12 text-center">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-bold" style={{ color: "var(--text-obsidian)" }}>No conversations yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>Start chatting with Dr. Neo to see history here</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((thread) => {
            const color = modeColors[thread.mode] ?? "#6b7280";
            return (
              <div key={thread.id} className="shard p-4 group flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}>
                  <MessageSquare className="h-4 w-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-sm truncate" style={{ color: "var(--text-obsidian)" }}>{thread.title}</h3>
                    <span className="text-[10px] font-mono-neo px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                      style={{ background: `${color}15`, color }}>{thread.mode}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(thread.updated_at)}</span>
                    <span>{thread.message_count ?? 0} messages</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => deleteThread(thread.id)}
                    className="p-1.5 rounded-xl hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                  <Link href={`/student/chat?thread=${thread.id}`} className="p-1.5 rounded-xl hover:bg-white/50">
                    <ChevronRight className="h-4 w-4" style={{ color: "var(--accent-mineral)" }} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
