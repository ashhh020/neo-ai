"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertTriangle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIBadge } from "./AIBadge";
import { MessageRenderer } from "./MessageRenderer";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";
import { generateId } from "@/lib/utils";

interface DrNeoChatProps {
  mode: "patient" | "doctor" | "student" | "organon" | "materia-medica" | "general" | "repertory" | "clinical" | "research";
  caseData?: unknown;
  initialMessage?: string;
  placeholder?: string;
  className?: string;
  quickPrompts?: string[];
  onCaseSummary?: (summary: unknown) => void;
}

export function DrNeoChat({
  mode,
  caseData,
  initialMessage,
  placeholder = "Type your message...",
  className,
  quickPrompts = [],
  onCaseSummary,
}: DrNeoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMsgRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialMessage) {
      setMessages([
        {
          id: generateId(),
          role: "assistant",
          content: initialMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
    } else {
      sendMessage("Hello", true);
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    // New assistant answer → align its top so the reader starts at the
    // beginning and scrolls down. User's own message → jump to bottom.
    if (last.role === "assistant") {
      lastMsgRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function sendMessage(text: string, isInit = false) {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = isInit ? messages : [...messages, userMessage];
    if (!isInit) setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    const assistantId = generateId();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
      },
    ]);

    try {
      // Build the last user message to send
      const userText = isInit ? "Hello, introduce yourself and what you can help with." : text;

      const response = await fetch("/api/dr-neo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          mode,
          caseData,
          // Send recent history (excluding the optimistic assistant placeholder)
          history: updatedMessages
            .filter((m) => m.content && m.role !== "assistant" || m.content)
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Failed to get response");
      }

      const data = await response.json();
      const fullText: string = data.reply ?? "No response generated.";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: fullText, isStreaming: false } : m
        )
      );

      if (fullText.includes('"chiefComplaint"') && onCaseSummary) {
        try {
          const jsonMatch = fullText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const summary = JSON.parse(jsonMatch[0]);
            onCaseSummary(summary);
          }
        } catch {
          // not valid json
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMsg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const modeColors: Record<string, string> = {
    patient: "#4ECDC4",
    doctor: "#2A5C8D",
    student: "#8A2BE2",
    organon: "#4e73df",
    "materia-medica": "#16a34a",
    general: "#8A2BE2",
    repertory: "#e67e22",
    clinical: "#e74c3c",
    research: "#9b59b6",
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message, idx) => (
          <div
            key={message.id}
            ref={idx === messages.length - 1 ? lastMsgRef : undefined}
            className={cn("flex gap-3 scroll-mt-4", message.role === "user" ? "justify-end" : "justify-start")}
          >
            {message.role === "assistant" && (
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: modeColors[mode] + "20", color: modeColors[mode] }}
              >
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "max-w-[75%] bg-primary text-primary-foreground ml-auto"
                  : "max-w-[85%] bg-muted text-foreground"
              )}
            >
              {message.role === "assistant" ? (
                <>
                  <MessageRenderer content={message.content || (message.isStreaming ? "…" : "")} />
                  {message.isStreaming && (
                    <span className="inline-block w-1.5 h-3.5 rounded-sm animate-pulse ml-1 align-middle"
                      style={{ background: modeColors[mode] ?? "#888" }} />
                  )}
                </>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: modeColors[mode] + "20" }}
            >
              <Bot className="h-4 w-4" style={{ color: modeColors[mode] }} />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-xl text-sm border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {quickPrompts.length > 0 && messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <AIBadge size="sm" />
          <span>
            {mode === "patient"
              ? "AI pre-assessment — not a prescription. All output requires doctor review."
              : mode === "doctor"
              ? "AI suggestions require your clinical review and approval."
              : "AI tutor — always verify with classical sources."}
          </span>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[48px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-12 w-12 flex-shrink-0"
            style={{ backgroundColor: modeColors[mode] }}
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
