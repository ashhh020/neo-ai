"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, BookOpen, Brain, FlaskConical } from "lucide-react";

const TAGLINES = [
  "Study smarter. Prescribe better.",
  "74,667 rubrics at your fingertips.",
  "9 classical authors. One platform.",
  "AI-powered Organon tutor.",
  "Spaced repetition for homeopathy.",
];

const STATS = [
  { value: "74,667", label: "Repertory Rubrics" },
  { value: "3,700+", label: "Materia Medica Remedies" },
  { value: "9", label: "Classical Authors" },
  { value: "161+", label: "Exam Questions" },
];

export function DHHero() {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => { setIdx(i => (i + 1) % TAGLINES.length); setFading(false); }, 350);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle,rgba(78,115,223,0.12) 0%,transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle,rgba(138,43,226,0.1) 0%,transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full blur-[80px]"
          style={{ background: "radial-gradient(circle,rgba(78,205,196,0.08) 0%,transparent 70%)" }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(var(--text-obsidian) 1px,transparent 1px),linear-gradient(90deg,var(--text-obsidian) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 w-full py-20 flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-8 text-xs font-semibold"
          style={{ background: "rgba(78,115,223,0.06)", borderColor: "rgba(78,115,223,0.2)", color: "var(--accent-mineral)" }}>
          <Sparkles className="h-3 w-3" />
          <span>Hahnemann AI · Powered by Qwen3 & Groq</span>
          <span className="h-1 w-1 rounded-full" style={{ background: "var(--accent-mineral)" }} />
          <span style={{ color: "var(--text-dim)" }}>Now in early access</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-center leading-[1.05] tracking-tight mb-5"
          style={{ color: "var(--text-obsidian)", fontFamily: "var(--font-jakarta)" }}>
          The AI Platform for<br />
          <span style={{ background: "linear-gradient(135deg,#4e73df 0%,#8A2BE2 50%,#4ECDC4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Homeopathy Professionals
          </span>
        </h1>

        {/* Rotating tagline */}
        <div className="h-8 flex items-center justify-center mb-6">
          <p className="text-lg md:text-xl font-semibold transition-opacity duration-300"
            style={{ color: "var(--accent-mineral)", opacity: fading ? 0 : 1 }}>
            {TAGLINES[idx]}
          </p>
        </div>

        {/* Subtext */}
        <p className="text-base md:text-lg text-center max-w-2xl mb-10 leading-relaxed"
          style={{ color: "var(--text-dim)" }}>
          DrHomeos is a professional-grade AI study platform for BHMS students and homeopathic practitioners.
          Master Materia Medica, Repertory, and Organon — the way the masters intended.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Link href="/register"
            className="flex items-center justify-center gap-2 h-12 px-8 rounded-2xl text-white font-bold text-sm shadow-xl transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg,#4e73df,#8A2BE2)" }}>
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/student"
            className="flex items-center justify-center gap-2 h-12 px-8 rounded-2xl font-bold text-sm border transition-colors hover:bg-white"
            style={{ color: "var(--text-obsidian)", borderColor: "var(--glass-border)", background: "rgba(255,255,255,0.6)" }}>
            <BookOpen className="h-4 w-4" />
            View demo dashboard
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mb-16">
          {STATS.map((s) => (
            <div key={s.label} className="text-center rounded-2xl py-4 px-3"
              style={{ background: "rgba(255,255,255,0.5)", border: "1px solid var(--glass-border)", backdropFilter: "blur(12px)" }}>
              <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: "var(--text-obsidian)", fontFamily: "var(--font-mono)" }}>
                {s.value}
              </div>
              <div className="text-xs font-semibold" style={{ color: "var(--text-dim)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div className="w-full max-w-5xl relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl border"
            style={{ background: "rgba(255,255,255,0.7)", borderColor: "var(--glass-border)", backdropFilter: "blur(20px)" }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--glass-border)", background: "rgba(255,255,255,0.8)" }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 mx-4 h-6 rounded-lg flex items-center px-3 text-xs font-mono"
                style={{ background: "rgba(0,0,0,0.05)", color: "var(--text-dim)" }}>
                drhomeos.com/student
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="flex" style={{ minHeight: "320px" }}>
              {/* Sidebar */}
              <div className="w-48 border-r flex-shrink-0 p-3 space-y-1"
                style={{ borderColor: "var(--glass-border)", background: "rgba(248,250,255,0.8)" }}>
                <div className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                  style={{ background: "rgba(78,115,223,0.1)", color: "var(--accent-mineral)" }}>
                  <span>🏠</span> Dashboard
                </div>
                {[["🧪","Materia Medica"],["📚","Repertory"],["📖","Organon Tutor"],["🃏","Flashcards"],["❓","Quiz"],["📝","Notes"]].map(([icon, label]) => (
                  <div key={label} className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2" style={{ color: "var(--text-dim)" }}>
                    <span>{icon}</span> {label}
                  </div>
                ))}
              </div>

              {/* Main content preview */}
              <div className="flex-1 p-5 space-y-4">
                {/* Welcome row */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold" style={{ color: "var(--text-obsidian)" }}>Good morning, Dr. Ashraf 👋</div>
                    <div className="text-xs" style={{ color: "var(--text-dim)" }}>Ready to study today?</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 px-3 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{ background: "rgba(78,115,223,0.1)", color: "var(--accent-mineral)" }}>
                      🔥 7 day streak
                    </div>
                    <div className="h-7 px-3 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{ background: "rgba(138,43,226,0.1)", color: "#8A2BE2" }}>
                      ⚡ 420 XP
                    </div>
                  </div>
                </div>

                {/* Cards row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: "🧪", label: "Remedy of the Day", value: "Sulphur", sub: "Polychrest · Psoric", color: "#4e73df" },
                    { icon: "🃏", label: "Flashcards Due", value: "12", sub: "cards to review", color: "#8A2BE2" },
                    { icon: "📊", label: "MM Mastery", value: "74%", sub: "Keep going!", color: "#16a34a" },
                  ].map((c) => (
                    <div key={c.label} className="rounded-2xl p-3"
                      style={{ background: "rgba(255,255,255,0.8)", border: "1px solid var(--glass-border)" }}>
                      <div className="text-base mb-1">{c.icon}</div>
                      <div className="text-[10px] font-semibold mb-0.5" style={{ color: "var(--text-dim)" }}>{c.label}</div>
                      <div className="text-sm font-black" style={{ color: c.color }}>{c.value}</div>
                      <div className="text-[9px]" style={{ color: "var(--text-dim)" }}>{c.sub}</div>
                    </div>
                  ))}
                </div>

                {/* AI chat preview */}
                <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.8)", border: "1px solid var(--glass-border)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ background: "linear-gradient(135deg,#4e73df,#8A2BE2)" }}>H</div>
                    <span className="text-xs font-bold" style={{ color: "var(--text-obsidian)" }}>Hahnemann AI</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>AI</span>
                  </div>
                  <div className="text-[10px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                    <span className="font-semibold" style={{ color: "var(--text-obsidian)" }}>§153 teaches us</span> to seek the most characteristic, striking, and peculiar symptoms — those that make the case individualise itself from all others…
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -top-4 -right-4 hidden lg:flex items-center gap-2 rounded-2xl px-3 py-2 shadow-lg text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.95)", border: "1px solid var(--glass-border)", color: "#16a34a" }}>
            <Brain className="h-3.5 w-3.5" /> Hahnemann AI
          </div>
          <div className="absolute -bottom-4 -left-4 hidden lg:flex items-center gap-2 rounded-2xl px-3 py-2 shadow-lg text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.95)", border: "1px solid var(--glass-border)", color: "#8A2BE2" }}>
            <FlaskConical className="h-3.5 w-3.5" /> 9 Classical Authors
          </div>
        </div>
      </div>
    </section>
  );
}
