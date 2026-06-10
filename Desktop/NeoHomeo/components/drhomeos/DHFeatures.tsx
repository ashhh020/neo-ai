"use client";

import { Brain, BookOpen, Search, Layers, Trophy, FileText, MessageSquare, StickyNote } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    color: "#4e73df",
    bg: "rgba(78,115,223,0.08)",
    title: "Hahnemann AI Tutor",
    desc: "Ask any question about Materia Medica, Organon, or clinical cases. Get structured, cited answers trained on classical homeopathy — not generic AI.",
    tag: "AI-Powered",
  },
  {
    icon: Search,
    color: "#8A2BE2",
    bg: "rgba(138,43,226,0.08)",
    title: "Repertory (74K+ Rubrics)",
    desc: "Full-text search across Kent, Boericke, and Boger repertories. OOREP-style remedy analysis grid with grade 1–3 colour coding. Build cases in one click.",
    tag: "Kent · Boericke · Boger",
  },
  {
    icon: BookOpen,
    color: "#16a34a",
    bg: "rgba(22,163,74,0.08)",
    title: "Materia Medica (9 Authors)",
    desc: "3,700+ remedies from Boericke, Kent, Clarke, Allen, Phatak, Murphy, Patil, Choudhuri, and Boger — complete text, searchable, bookmarkable.",
    tag: "9 Classical Authors",
  },
  {
    icon: Layers,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    title: "Organon Tutor",
    desc: "Powered by Hahnemann AI in Organon mode. Explains any aphorism by §-number, connects theory to clinical practice, cites the 5th and 6th editions.",
    tag: "§ Aphorism-aware",
  },
  {
    icon: Trophy,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    title: "SM2 Spaced Repetition",
    desc: "Flashcards that learn from you. The SM2 algorithm schedules exactly which cards to review — so you spend time on what you don't know, not what you do.",
    tag: "Science-backed",
  },
  {
    icon: FileText,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
    title: "Quiz Engine (161 Questions)",
    desc: "5 topics · 3 difficulty levels · timed mode. Covers Materia Medica, Organon, Repertory, Miasms, and Philosophy. Built for BHMS university exams.",
    tag: "Exam-ready",
  },
  {
    icon: MessageSquare,
    color: "#8A2BE2",
    bg: "rgba(138,43,226,0.08)",
    title: "Case Analysis",
    desc: "Save rubrics to a case tray, auto-calculate remedy totals with the OOREP grid, and store cases for future reference. Your digital case register.",
    tag: "Clinical tool",
  },
  {
    icon: StickyNote,
    color: "#4e73df",
    bg: "rgba(78,115,223,0.08)",
    title: "Study Notes",
    desc: "Rich-text study notes with tags, colour coding, and full-text search. Study notes live permanently — no more losing notes on app refresh.",
    tag: "Persistent",
  },
];

export function DHFeatures() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-bold"
            style={{ background: "rgba(78,115,223,0.08)", color: "var(--accent-mineral)", border: "1px solid rgba(78,115,223,0.15)" }}>
            Everything you need
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight"
            style={{ color: "var(--text-obsidian)", fontFamily: "var(--font-jakarta)" }}>
            Eight tools.<br />
            <span style={{ background: "linear-gradient(135deg,#4e73df,#8A2BE2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              One platform.
            </span>
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "var(--text-dim)" }}>
            Every tool a homeopathy student or practitioner needs — built together, not bolted together.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid var(--glass-border)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: f.bg }}>
                <f.icon className="h-5 w-5" style={{ color: f.color }} strokeWidth={1.75} />
              </div>
              <div className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-2"
                style={{ background: f.bg, color: f.color }}>
                {f.tag}
              </div>
              <h3 className="font-bold text-sm mb-2" style={{ color: "var(--text-obsidian)" }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
