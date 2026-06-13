"use client";
import { authedFetch } from "@/lib/authed-fetch";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Plus, ChevronDown, BookOpen, Layers, FlaskConical, Stethoscope, Library, Trash2, Clock, Copy, Check } from "lucide-react";
import { MessageRenderer } from "@/components/shared/MessageRenderer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Thread {
  id: string;
  title: string;
  mode: string;
  messages: Message[];
  updatedAt: Date;
}

const MODES = [
  { id: "general", label: "General", icon: Sparkles, color: "#6b7280" },
  { id: "materia-medica", label: "Materia Medica", icon: BookOpen, color: "#4e73df" },
  { id: "organon", label: "Organon", icon: Layers, color: "#4ECDC4" },
  { id: "repertory", label: "Repertory", icon: Library, color: "#8A2BE2" },
  { id: "clinical", label: "Clinical", icon: Stethoscope, color: "#F59E0B" },
  { id: "research", label: "Research", icon: FlaskConical, color: "#ef4444" },
];

const MODE_COLORS: Record<string, string> = Object.fromEntries(MODES.map(m => [m.id, m.color]));

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.88 5.76L20 10l-6.12 1.24L12 17l-1.88-5.76L4 10l6.12-1.24z"/>
    </svg>
  );
}

export default function ChatPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [mode, setMode] = useState("general");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMsgRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const msgs = activeThread?.messages;
    if (!msgs || msgs.length === 0) return;
    const last = msgs[msgs.length - 1];
    // For a new assistant answer, align its TOP to the viewport so the reader
    // starts at the beginning and scrolls down. For the user's own message,
    // jump to the bottom so they see it land with the typing indicator.
    if (last.role === "assistant") {
      lastMsgRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeThread?.messages]);

  // Load threads from DB on mount
  useEffect(() => {
    async function loadThreads() {
      try {
        const res = await authedFetch("/api/chat");
        if (!res.ok) return;
        const data = await res.json();
        const loaded: Thread[] = (data.threads ?? []).map((t: { id: string; title: string; mode: string; updated_at: string }) => ({
          id: t.id,
          title: t.title,
          mode: t.mode,
          messages: [],
          updatedAt: new Date(t.updated_at),
        }));
        setThreads(loaded);

<<<<<<< HEAD
        // If ?thread=X in URL, load that thread
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const threadId = params.get("thread");
          if (threadId) {
            const found = loaded.find(t => t.id === threadId);
            if (found) loadThread(found);
=======
        // If ?thread=X in URL, load that thread — fetch directly in case it's not yet in list
        const threadId = searchParams.get("thread");
        if (threadId) {
          const found = loaded.find(t => t.id === threadId);
          if (found) {
            loadThread(found);
          } else {
            // Direct fetch for threads not yet in the list
            try {
              const tr = await authedFetch(`/api/chat?threadId=${threadId}`);
              if (tr.ok) {
                const td = await tr.json();
                const msgs: Message[] = (td.messages ?? []).map((m: { id: string; role: string; content: string; created_at: string }) => ({
                  id: m.id, role: m.role as "user" | "assistant", content: m.content, timestamp: new Date(m.created_at),
                }));
                const ghost: Thread = { id: threadId, title: td.thread?.title ?? "Chat", mode: td.thread?.mode ?? "general", messages: msgs, updatedAt: new Date() };
                setThreads(prev => [ghost, ...prev]);
                setActiveThread(ghost);
              }
            } catch { /* ignore */ }
>>>>>>> 1eff9d3dc3455fb15c5e7d07379e57d5ce95a203
          }
        }
      } finally {
        setThreadsLoading(false);
      }
    }
    loadThreads();
  }, []);

  async function loadThread(t: Thread) {
    if (t.messages.length > 0) { setActiveThread(t); return; }
    try {
      const res = await authedFetch(`/api/chat?threadId=${t.id}`);
      if (!res.ok) return;
      const data = await res.json();
      const msgs: Message[] = (data.messages ?? []).map((m: { id: string; role: string; content: string; created_at: string }) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date(m.created_at),
      }));
      const full = { ...t, mode: data.thread?.mode ?? t.mode, messages: msgs };
      setActiveThread(full);
      setThreads(prev => prev.map(x => x.id === t.id ? full : x));
    } catch { setActiveThread(t); }
  }

  // Cmd+N / Ctrl+N → new thread (L3)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        newThread();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function newThread() {
    const res = await authedFetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "thread", title: "New Chat", mode }),
    });
    if (!res.ok) return;
    const data = await res.json();
    const t: Thread = {
      id: data.thread.id,
      title: data.thread.title,
      mode,
      messages: [],
      updatedAt: new Date(),
    };
    setThreads(prev => [t, ...prev]);
    setActiveThread(t);
  }

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    setLoading(true);

    let thread = activeThread;
    let isNew = false;

    // Create thread in DB if none active
    if (!thread) {
      isNew = true;
      const res = await authedFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "thread", title: content.slice(0, 50), mode }),
      });
      if (res.ok) {
        const data = await res.json();
        thread = { id: data.thread.id, title: content.slice(0, 50), mode, messages: [], updatedAt: new Date() };
        setThreads(prev => [thread!, ...prev]);
        setActiveThread(thread);
      } else {
        // Fallback: local thread
        thread = { id: crypto.randomUUID(), title: content.slice(0, 50), mode, messages: [], updatedAt: new Date() };
      }
    }

    // If first message in existing thread, update title
    if (!isNew && thread.messages.length === 0) {
      const shortTitle = content.slice(0, 50);
      setActiveThread(prev => prev ? { ...prev, title: shortTitle } : prev);
      setThreads(prev => prev.map(t => t.id === thread!.id ? { ...t, title: shortTitle } : t));
    }

    // Add user message optimistically
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content, timestamp: new Date() };
    const withUser = { ...thread, messages: [...thread.messages, userMsg], updatedAt: new Date() };
    setActiveThread(withUser);
    setThreads(prev => prev.map(t => t.id === withUser.id ? { ...t, updatedAt: new Date() } : t));

    // Save user message to DB
    authedFetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "message", threadId: thread.id, role: "user", content }),
    }).catch(() => {});

    try {
      const res = await authedFetch("/api/dr-neo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, mode, history: withUser.messages.slice(-10) }),
      });
      const data = await res.json();
      const reply = data.reply ?? "I could not generate a response.";
      const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: reply, timestamp: new Date() };
      const final = { ...withUser, messages: [...withUser.messages, assistantMsg], updatedAt: new Date() };
      setActiveThread(final);
      setThreads(prev => prev.map(t => t.id === final.id ? { ...t, updatedAt: new Date() } : t));

      // Save assistant message to DB
      authedFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "message", threadId: thread!.id, role: "assistant", content: reply }),
      }).catch(() => {});
    } catch {
      const errMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "Connection error. Please check your API configuration.", timestamp: new Date() };
      const final = { ...withUser, messages: [...withUser.messages, errMsg], updatedAt: new Date() };
      setActiveThread(final);
      setThreads(prev => prev.map(t => t.id === final.id ? { ...t, updatedAt: new Date() } : t));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, activeThread, mode]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  async function deleteThread(id: string) {
    await authedFetch(`/api/chat?threadId=${id}`, { method: "DELETE" });
    setThreads(prev => prev.filter(t => t.id !== id));
    if (activeThread?.id === id) setActiveThread(null);
  }

  const currentMode = MODES.find(m => m.id === mode) ?? MODES[0];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Thread sidebar */}
      {sidebarOpen && (
        <div className="w-56 flex-shrink-0 hidden md:flex flex-col border-r overflow-hidden" style={{ background: "rgba(255,255,255,0.3)", backdropFilter: "blur(20px)", borderColor: "var(--glass-border)" }}>
          <div className="p-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            <button onClick={newThread}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-sm gradient-mineral text-white">
              <Plus className="h-4 w-4" /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {threadsLoading && (
              <p className="text-[11px] text-center py-6 px-2" style={{ color: "var(--text-dim)" }}>Loading…</p>
            )}
            {!threadsLoading && threads.length === 0 && (
              <p className="text-[11px] text-center py-6 px-2" style={{ color: "var(--text-dim)" }}>
                Start a conversation to see history
              </p>
            )}
            {threads.map(t => (
              <button key={t.id} onClick={() => loadThread(t)}
                className="w-full text-left px-3 py-2 rounded-xl group transition-all hover:bg-white/40 relative"
                style={{ background: activeThread?.id === t.id ? "rgba(78,115,223,0.1)" : "transparent", border: activeThread?.id === t.id ? "1px solid rgba(78,115,223,0.2)" : "1px solid transparent" }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: MODE_COLORS[t.mode] ?? "#6b7280" }} />
                  <p className="text-[11px] font-semibold truncate flex-1" style={{ color: "var(--text-obsidian)" }}>{t.title}</p>
                  <div role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); deleteThread(t.id); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); deleteThread(t.id); } }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-2.5 w-2.5" style={{ color: "var(--text-dim)" }} />
                  <p className="text-[9px] font-mono-neo" style={{ color: "var(--text-dim)" }}>{formatTime(t.updatedAt)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex p-1.5 rounded-lg hover:bg-white/40">
              <div className="w-4 h-3 flex flex-col justify-between">
                {[0,1,2].map(i => <div key={i} className="h-0.5 rounded-full" style={{ background: "var(--text-dim)" }} />)}
              </div>
            </button>
            {activeThread && (
              <p className="font-semibold text-sm truncate max-w-48" style={{ color: "var(--text-obsidian)" }}>
                {activeThread.title}
              </p>
            )}
          </div>

          {/* Mode selector */}
          <div className="relative">
            <button onClick={() => setShowModeMenu(!showModeMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: `${currentMode.color}15`, color: currentMode.color, border: `1px solid ${currentMode.color}30` }}>
              <currentMode.icon className="h-3.5 w-3.5" />
              {currentMode.label}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showModeMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-2xl shadow-xl z-50 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", border: "1px solid var(--glass-border)" }}>
                {MODES.map(m => (
                  <button key={m.id} onClick={() => { setMode(m.id); setShowModeMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold hover:bg-white/60 transition-all"
                    style={{ color: m.id === mode ? m.color : "var(--text-obsidian)" }}>
                    <m.icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!activeThread || activeThread.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="w-16 h-16 rounded-3xl gradient-mineral flex items-center justify-center mb-4">
                <currentMode.icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-extrabold mb-2" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
                Hahnemann AI
              </h2>
              <p className="text-sm mb-6 max-w-sm" style={{ color: "var(--text-dim)" }}>
                Your Intelligent Homeopathy Companion
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {activeThread.messages.map((msg, idx) => (
                <div key={msg.id}
                  ref={idx === activeThread.messages.length - 1 ? lastMsgRef : undefined}
                  className={`flex scroll-mt-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl gradient-mineral flex items-center justify-center text-white font-black text-xs flex-shrink-0 mr-3 mt-0.5">N</div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : "order-2"}`}>
                    <div
                      className="px-4 py-3 rounded-2xl"
                      style={msg.role === "user"
                        ? { background: "var(--accent-mineral)", color: "white", borderRadius: "18px 18px 4px 18px" }
                        : { background: "rgba(255,255,255,0.7)", border: "1px solid var(--glass-border)", borderRadius: "18px 18px 18px 4px", backdropFilter: "blur(12px)" }
                      }
                    >
                      {msg.role === "user"
                        ? <p className="text-sm leading-relaxed">{msg.content}</p>
                        : <MessageRenderer content={msg.content} />
                      }
                    </div>
                    <div className="flex items-center mt-1 px-1 gap-2" style={{ justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                      <p className="text-[10px] font-mono-neo" style={{ color: "var(--text-dim)" }}>
                        {formatTime(msg.timestamp)}
                      </p>
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            setCopiedId(msg.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="text-[10px] flex items-center gap-0.5 hover:opacity-80 transition-opacity"
                          style={{ color: "var(--text-dim)" }}
                          title="Copy response"
                        >
                          {copiedId === msg.id
                            ? <><Check className="h-3 w-3 text-green-500" /><span className="text-green-500">Copied</span></>
                            : <><Copy className="h-3 w-3" /><span>Copy</span></>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-xl gradient-mineral flex items-center justify-center text-white font-black text-xs flex-shrink-0 mr-3">N</div>
                  <div className="px-4 py-3 rounded-2xl flex items-center gap-1"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--glass-border)", backdropFilter: "blur(12px)" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: "var(--accent-mineral)", animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input composer */}
        <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(20px)" }}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 rounded-3xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid var(--glass-border)", backdropFilter: "blur(20px)" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"; }}
                onKeyDown={handleKey}
                placeholder={`Ask Hahnemann AI about ${currentMode.label.toLowerCase()}…`}
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-sm font-medium leading-relaxed"
                style={{ color: "var(--text-obsidian)", maxHeight: 160, minHeight: 24 }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 gradient-mineral hover:opacity-90"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
            <p className="text-[10px] font-mono-neo text-center mt-1.5 hidden sm:block" style={{ color: "var(--text-dim)" }}>
              Hahnemann AI · {currentMode.label} mode · Enter to send · Shift+Enter for new line
            </p>
            <p className="text-[10px] font-mono-neo text-center mt-1.5 sm:hidden" style={{ color: "var(--text-dim)" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
