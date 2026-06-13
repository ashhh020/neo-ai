"use client";

import { DrNeoChat } from "@/components/shared/DrNeoChat";
import { BookOpen } from "lucide-react";

const QUICK_PROMPTS = [
  "Give me the full picture of Sulphur",
  "Compare Pulsatilla vs Natrum Mur",
  "Explain the keynotes of Arsenicum Album",
  "What are the characteristic symptoms of Lycopodium?",
  "Describe the Phosphorus constitution",
  "When do I think of Lachesis in a case?",
  "Differentiate Belladonna from Stramonium",
  "Explain Calcarea Carb in children",
];

export default function MateriaMediaTutorPage() {
  return (
    <div className="h-[calc(100vh-56px)] flex flex-col overflow-hidden">
      <div className="p-4 border-b flex items-center gap-3 flex-shrink-0"
        style={{ background: "linear-gradient(135deg,rgba(78,115,223,0.06),rgba(22,163,74,0.04))", borderColor: "var(--glass-border)" }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#4e73df,#16a34a)" }}>
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: "var(--text-obsidian)" }}>Materia Medica Tutor · Hahnemann AI</p>
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            Boericke · Kent · Clarke · Phatak · Murphy · 9 classical authors
          </p>
        </div>
        <span className="ml-auto text-[10px] font-mono-neo px-2 py-0.5 rounded-full font-bold"
          style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>AI</span>
      </div>

      <DrNeoChat
        mode="materia-medica"
        placeholder="Ask about any remedy: 'Explain Sulphur', 'Compare Pulsatilla vs Natrum Mur'…"
        quickPrompts={QUICK_PROMPTS}
        initialMessage="Welcome to the **Materia Medica Tutor**. I'm **Hahnemann AI** in MM expert mode.

I draw from 9 classical authors: **Boericke, Kent, Clarke, Allen, Phatak, Murphy, Patil, Choudhuri, and Boger**.

**What remedy shall we study?**
- Full remedy picture (e.g., *'Tell me about Sulphur'*)
- Comparison (e.g., *'Compare Pulsatilla vs Natrum Mur'*)
- Keynotes only (e.g., *'Keynotes of Arsenicum'*)
- Constitutional type (e.g., *'Describe the Phosphorus constitution'*)
- Clinical case (e.g., *'Child with recurrent ear infections, clingy, weeps easily'*)

I'll structure answers with Overview, Keynotes, Mind, Modalities, and Clinical Uses."
        className="flex-1 min-h-0"
      />
    </div>
  );
}
