"use client";

import { DrNeoChat } from "@/components/shared/DrNeoChat";
import { AIBadge } from "@/components/shared/AIBadge";
import { GraduationCap } from "lucide-react";

const QUICK_PROMPTS = [
  "Explain Sulphur mentals in detail",
  "Compare Pulsatilla vs Natrum Mur",
  "Quiz me on Phosphorus",
  "What is the sycotic miasm?",
  "Explain MIND > Grief rubric",
  "Describe Lycopodium constitution",
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
            <span className="font-semibold">Dr. Neo · AI Tutor</span>
            <AIBadge />
          </div>
          <p className="text-xs text-muted-foreground">Socratic teaching mode · Classical homeopathy</p>
        </div>
        <div className="ml-auto text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1">
          Powered by Gemini
        </div>
      </div>

      <DrNeoChat
        mode="student"
        placeholder="Ask anything about homeopathy..."
        quickPrompts={QUICK_PROMPTS}
        initialMessage="Welcome to your AI tutoring session! I'm Dr. Neo in Socratic tutor mode.

I'll guide your learning through questions, examples, and classical references rather than just giving you answers. This helps build deeper understanding.

**What would you like to explore today?**
- A specific remedy (e.g., &quot;Tell me about Sulphur&quot;)
- Compare remedies (e.g., &quot;Compare Pulsatilla and Natrum Mur&quot;)
- A quiz on any topic (e.g., &quot;Quiz me on Phosphorus&quot;)
- Repertory and case-taking concepts
- Organon principles

*Note: I'll cite classical sources like Kent's Lectures, Boericke, and the Organon throughout.*"
        className="flex-1"
      />
    </div>
  );
}
