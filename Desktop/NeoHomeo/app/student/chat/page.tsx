"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, BookOpen, Layers, FlaskConical, Stethoscope, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";

type AIMode = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
  placeholder: string;
};

const AI_MODES: AIMode[] = [
  {
    id: "general",
    label: "General",
    icon: Sparkles,
    color: "#8A2BE2",
    description: "Answers from all indexed sources",
    placeholder: "Ask anything about Homeopathy...",
  },
  {
    id: "materia-medica",
    label: "Materia Medica",
    icon: BookOpen,
    color: "#2A5C8D",
    description: "From Materia Medica books only",
    placeholder: "Ask about any remedy — keynotes, modalities, relationships...",
  },
  {
    id: "organon",
    label: "Organon",
    icon: FlaskConical,
    color: "#4ECDC4",
    description: "Organon & philosophy books",
    placeholder: "Ask about aphorisms, philosophy, principles...",
  },
  {
    id: "repertory",
    label: "Repertory",
    icon: Layers,
    color: "#F59E0B",
    description: "Rubrics and repertorization",
    placeholder: "Find rubrics, compare remedies in repertory...",
  },
  {
    id: "clinical",
    label: "Clinical",
    icon: Stethoscope,
    color: "#EF4444",
    description: "Clinical references & differentiation",
    placeholder: "Ask about clinical cases, remedy differentiation...",
  },
  {
    id: "research",
    label: "Research",
    icon: Library,
    color: "#6B7280",
    description: "Journals, articles, publications",
    placeholder: "Search research papers, journals...",
  },
];

const SUGGESTED_PROMPTS = [
  "Explain Sulphur.",
  "Compare Pulsatilla and Sepia.",
  "Teach me Aphorism 153.",
  "Find rubrics for fear of death.",
  "Compare Nux Vomica and Lycopodium.",
  "Explain Kent's philosophy.",
  "What are the keynotes of Arsenicum Album?",
  "Start Materia Medica study mode.",
];

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode: string;
};

export default function ChatPage() {
  const { user } = useAuthStore();
  const [selectedMode, setSelectedMode] = useState<AIMode>(AI_MODES[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isEmpty = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, mode: selectedMode.id };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "", mode: selectedMode.id }]);

    try {
      const res = await fetch("/api/dr-neo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          mode: selectedMode.id,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const parsed = JSON.parse(line.slice(6));
                accumulated += parsed.text || "";
                setMessages((m) => m.map((msg) => msg.id === assistantId ? { ...msg, content: accumulated } : msg));
              } catch { /* ignore parse errors */ }
            }
          }
        }
      }
    } catch {
      setMessages((m) => m.map((msg) =>
        msg.id === assistantId
          ? { ...msg, content: "I am here to assist with homeopathic knowledge. Please check your API configuration and try again." }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mode selector bar */}
      <div className="border-b bg-card px-4 py-2 flex gap-2 overflow-x-auto scrollbar-thin">
        {AI_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSelectedMode(mode)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
              selectedMode.id === mode.id
                ? "text-white border-transparent"
                : "bg-transparent hover:bg-muted border-transparent text-muted-foreground"
            )}
            style={selectedMode.id === mode.id ? { backgroundColor: mode.color, borderColor: mode.color } : {}}
          >
            <mode.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {mode.label}
          </button>
        ))}
      </div>

      {/* Messages or empty state */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white font-bold text-xl font-poppins"
              style={{ background: `linear-gradient(135deg, #2A5C8D, #8A2BE2)` }}
            >
              N
            </div>
            <h2 className="text-xl font-bold font-poppins mb-2">
              Hello, {user?.name?.split(" ")[0] || "Practitioner"}!
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mb-1">
              Welcome to NeoHomeo AI — your intelligent companion for Materia Medica, Repertory, Organon, Clinical Learning, and Homeopathic Research.
            </p>
            <p className="text-xs text-muted-foreground mb-8">
              Mode: <span className="font-semibold" style={{ color: selectedMode.color }}>{selectedMode.label}</span> — {selectedMode.description}
            </p>

            {/* Suggested prompts */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left px-4 py-3 rounded-xl border bg-card hover:bg-muted text-sm transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => {
              const mode = AI_MODES.find((m) => m.id === msg.mode);
              return (
                <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold font-poppins flex-shrink-0 mt-0.5"
                      style={{ background: `linear-gradient(135deg, #2A5C8D, #8A2BE2)` }}
                    >
                      N
                    </div>
                  )}
                  <div className={cn("max-w-[80%] space-y-1")}>
                    {msg.role === "assistant" && mode && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ color: mode.color, borderColor: mode.color + "40" }}>
                        {mode.label}
                      </Badge>
                    )}
                    <div
                      className={cn(
                        "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card border rounded-bl-sm"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold font-poppins flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, #2A5C8D, #8A2BE2)` }}
                >
                  N
                </div>
                <div className="px-4 py-3 rounded-2xl bg-card border rounded-bl-sm">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t bg-card p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 border rounded-2xl bg-background px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedMode.placeholder}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground min-h-[36px] max-h-[200px] py-2"
              style={{ overflowY: input.split("\n").length > 3 ? "auto" : "hidden" }}
            />
            <Button
              size="sm"
              className="h-9 w-9 p-0 rounded-xl flex-shrink-0 gradient-brand text-white border-0"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            NeoHomeo AI may make mistakes. Always verify clinical decisions with qualified sources.
          </p>
        </div>
      </div>
    </div>
  );
}
