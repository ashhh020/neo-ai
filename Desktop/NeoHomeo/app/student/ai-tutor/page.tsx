"use client";

import { DrNeoChat } from "@/components/shared/DrNeoChat";
import { AIBadge } from "@/components/shared/AIBadge";
import { GraduationCap } from "lucide-react";

const QUICK_PROMPTS = [
  "Explain §1 of the Organon in clinical terms",
  "What is the vital force according to Hahnemann?",
  "Explain the Law of Similars with an example",
  "What does §153 teach about case-taking?",
  "Difference between 5th and 6th edition of Organon",
  "What are the three miasms Hahnemann described?",
  "Explain primary and secondary action (§63)",
  "What is the minimum dose principle?",
];

export default function AITutorPage() {
  return (
    <div className="h-[calc(100vh-56px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #8A2BE208, #4ECDC408)" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
          style={{ background: "linear-gradient(135deg, #8A2BE2, #4ECDC4)" }}>
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Organon Tutor · Hahnemann AI</span>
            <AIBadge />
          </div>
          <p className="text-xs text-muted-foreground">Hahnemann · Kent · Roberts · Organon 6th &amp; 5th Ed.</p>
        </div>
        <div className="ml-auto text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1">
          Powered by Qwen3 · Groq
        </div>
      </div>

      <DrNeoChat
        mode="organon"
        placeholder="Ask about any aphorism, principle, or concept from the Organon…"
        quickPrompts={QUICK_PROMPTS}
        initialMessage="Welcome to the **Organon Tutor**. I'm **Hahnemann AI** in Organon expert mode.

I teach from Hahnemann's *Organon of Medicine* (6th & 5th editions), Kent's *Lectures on Homeopathic Philosophy*, and Roberts' *Art of Cure*.

**What shall we explore?**
- Any aphorism by number (e.g., *'Explain §153'*)
- Core concepts (e.g., *'What is the vital force?'*)
- Compare editions (e.g., *'How does §246 differ between 5th and 6th edition?'*)
- Clinical application (e.g., *'How does §63 apply when choosing potency?'*)
- Philosophy (e.g., *'Explain the miasm theory'*)

I'll cite the relevant aphorism numbers throughout and connect theory to clinical practice."
        className="flex-1"
      />
    </div>
  );
}
