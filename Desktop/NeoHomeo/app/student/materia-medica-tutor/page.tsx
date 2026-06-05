"use client";

import { DrNeoChat } from "@/components/shared/DrNeoChat";
import { BookOpen } from "lucide-react";

export default function MateriaMediaTutorPage() {
  return (
    <div className="h-full flex flex-col p-6 gap-4 max-w-4xl mx-auto">
      <div className="shard p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(78,115,223,0.1)" }}>
          <BookOpen className="h-4 w-4" style={{ color: "var(--accent-mineral)" }} />
        </div>
        <div>
          <h1 className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>Materia Medica Tutor</h1>
          <p className="text-xs font-mono-neo" style={{ color: "var(--text-dim)" }}>
            AI mode: Materia Medica · Powered by Groq + RAG
          </p>
        </div>
        <span className="ml-auto text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
          style={{ background: "rgba(138,43,226,0.1)", color: "#8A2BE2" }}>AI</span>
      </div>

      <div className="flex-1 min-h-0">
        <DrNeoChat mode="student" placeholder="Ask about any remedy: 'Explain Sulphur mind symptoms'" className="h-full" />
      </div>
    </div>
  );
}
