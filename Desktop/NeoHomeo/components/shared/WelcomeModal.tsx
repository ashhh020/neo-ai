"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/authStore";

const STORAGE_KEY = "neohomeo-welcomed";

const suggestedPrompts = [
  "Explain Sulphur.",
  "Compare Pulsatilla and Sepia.",
  "Teach me Aphorism 153.",
  "Find rubrics for fear of death.",
  "Start Materia Medica study mode.",
];

export function WelcomeModal() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen && user) {
      setOpen(true);
    }
  }, [user]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-card border rounded-3xl shadow-2xl overflow-hidden">
        {/* Gradient top band */}
        <div className="h-2 w-full gradient-brand" />

        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl font-poppins"
              style={{ background: "linear-gradient(135deg, #2A5C8D, #8A2BE2)" }}
            >
              N
            </div>
            <div>
              <h2 className="font-bold font-poppins text-lg leading-tight">Welcome to NeoHomeo AI</h2>
              <p className="text-xs text-muted-foreground">Hello, {user?.name?.split(" ")[0] || "True Practitioner"}!</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground mb-4">
            The wisdom of <span className="font-semibold text-foreground">Hahnemann, Kent, Boericke, Allen, Clarke, Hering, Boger</span>, and many other masters is now searchable through one intelligent platform.
          </p>

          <p className="text-sm leading-relaxed text-muted-foreground mb-6">
            Ask a question, explore a remedy, repertorize a case, or deepen your understanding of the healing art.
          </p>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Try asking...</p>
          <div className="space-y-2 mb-6">
            {suggestedPrompts.map((prompt) => (
              <Link
                key={prompt}
                href={`/student/chat?q=${encodeURIComponent(prompt)}`}
                onClick={dismiss}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border hover:bg-muted transition-colors text-sm group"
              >
                <span className="flex-1">{prompt}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>

          <Button className="w-full gradient-brand text-white border-0 h-11" onClick={dismiss}>
            Start Exploring
          </Button>
        </div>
      </div>
    </div>
  );
}
