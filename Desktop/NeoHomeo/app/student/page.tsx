"use client";

import { Flame, BookOpen, RotateCcw, HelpCircle, Trophy, ChevronRight, Zap, MessageSquarePlus, Sun, Quote, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { Progress } from "@/components/ui/progress";

const streakDays = 12;
const xp = 3240;
const level = 8;
const xpToNext = 4000;

const masteryScores = [
  { subject: "Materia Medica", score: 74, color: "#4e73df" },
  { subject: "Organon", score: 58, color: "#4ECDC4" },
  { subject: "Repertory", score: 61, color: "#8A2BE2" },
];

const achievements = [
  { icon: "🔥", label: "10-Day Streak", unlocked: true },
  { icon: "📚", label: "50 Cards", unlocked: true },
  { icon: "⭐", label: "Quiz Master", unlocked: true },
  { icon: "🏆", label: "MM Champion", unlocked: false },
  { icon: "💎", label: "30-Day Streak", unlocked: false },
  { icon: "🎯", label: "Perfect Quiz", unlocked: false },
];

const todayPlan = [
  { label: "Review 15 flashcards", done: true, href: "/student/flashcards" },
  { label: "Complete daily quiz (10 Qs)", done: false, href: "/student/quiz" },
  { label: "Read: Sulphur – Mind section", done: false, href: "/student/materia-medica" },
];

const remedyOfDay = {
  name: "Sulphur", thermal: "Hot",
  keynotes: ["Dirty, ragged appearance", "Burning sensations everywhere", "Worse heat, better cold", "Hungry at 11 AM"],
  worse: ["Heat", "Standing", "Washing"],
  better: ["Dry weather", "Motion"],
};

const aphorismOfDay = {
  number: 153,
  text: "In searching for the specific remedy, the more striking, singular, uncommon, and peculiar signs and symptoms of the case are chiefly to be taken into consideration.",
  source: "Organon, 6th Ed.",
};

const quizOfDay = [
  { q: "Thermal state of Sulphur?", options: ["Chilly", "Hot", "Ambi", "Cold"], answer: 1 },
  { q: "Aphorism defining the similar remedy?", options: ["§1", "§9", "§153", "§269"], answer: 2 },
];

const suggestedPrompts = [
  "Explain Sulphur keynotes", "Compare Pulsatilla vs Sepia",
  "Teach me Aphorism 153", "Find rubrics for fear of death",
];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "Student";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
            Hello, {firstName}!
          </h1>
          <p className="text-sm mt-0.5 font-mono-neo" style={{ color: "var(--text-dim)" }}>True Practitioner of the Healing Art</p>
        </div>
        <Link href="/student/chat"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-semibold text-sm gradient-mineral hover:opacity-90 transition-opacity">
          <MessageSquarePlus className="h-4 w-4" />
          Ask Dr. Neo
        </Link>
      </div>

      {/* AI suggested prompts */}
      <div className="shard p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4" style={{ color: "#8A2BE2" }} />
          <span className="text-sm font-bold" style={{ color: "var(--text-obsidian)" }}>Suggested for you</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((p) => (
            <Link key={p} href={`/student/chat?q=${encodeURIComponent(p)}`}
              className="px-3 py-1.5 rounded-2xl text-xs font-medium transition-all hover:shadow-md"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-dim)" }}>
              {p}
            </Link>
          ))}
        </div>
        <div className="accent-blob" style={{ top: "-20px", right: "-20px", background: "linear-gradient(135deg,#8A2BE2,#c084fc)" }} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak */}
        <div className="shard p-5">
          <div className="stat-label mb-2">Daily Streak</div>
          <div className="flex items-center gap-3">
            <Flame className="h-8 w-8 text-orange-500" />
            <div>
              <div className="stat-value text-orange-500">{streakDays}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>days 🔥</div>
            </div>
          </div>
          <div className="accent-blob" style={{ bottom: "-30px", right: "-30px", background: "linear-gradient(135deg,#f97316,#fbbf24)", opacity: 0.12 }} />
        </div>

        {/* XP */}
        <div className="shard p-5">
          <div className="stat-label mb-2">Total XP · Level {level}</div>
          <div className="flex items-center gap-3 mb-3">
            <Zap className="h-8 w-8" style={{ color: "#8A2BE2" }} />
            <div>
              <div className="stat-value" style={{ color: "#8A2BE2" }}>{xp.toLocaleString()}</div>
              <div className="text-xs" style={{ color: "var(--text-dim)" }}>xp</div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-mono-neo mb-1.5" style={{ color: "var(--text-dim)" }}>
            <span>Lv {level}</span><span>{xp}/{xpToNext}</span>
          </div>
          <Progress value={(xp / xpToNext) * 100} className="h-1.5" />
        </div>

        {/* Today's plan */}
        <div className="shard p-5">
          <div className="stat-label mb-3">Today&apos;s Plan</div>
          <div className="space-y-2.5">
            {todayPlan.map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center gap-2.5 group">
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${item.done ? "bg-green-500 border-green-500" : "border-gray-300 group-hover:border-blue-400"}`}>
                  {item.done && <span className="text-white text-[8px]">✓</span>}
                </div>
                <span className={`text-xs font-medium ${item.done ? "line-through" : ""}`}
                  style={{ color: item.done ? "var(--text-dim)" : "var(--text-obsidian)" }}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Remedy + Aphorism + Quiz */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Remedy of Day */}
        <div className="shard p-6">
          <div className="stat-label flex items-center gap-1.5 mb-4">
            <Sun className="h-3.5 w-3.5 text-yellow-500" /> Remedy of the Day
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl gradient-brand">
              Su
            </div>
            <div>
              <h3 className="text-xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>{remedyOfDay.name}</h3>
              <span className="text-xs font-mono-neo px-2 py-0.5 rounded-full" style={{ background: "#ef444415", color: "#ef4444" }}>
                Thermal: {remedyOfDay.thermal}
              </span>
            </div>
          </div>
          <div className="mb-3">
            <p className="stat-label mb-1.5">Keynotes</p>
            <ul className="space-y-1">
              {remedyOfDay.keynotes.map((k) => (
                <li key={k} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-obsidian)" }}>
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: "var(--accent-mineral)" }} />
                  {k}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="rounded-xl p-2.5" style={{ background: "rgba(239,68,68,0.07)" }}>
              <p className="stat-label text-red-500 mb-1">Worse</p>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>{remedyOfDay.worse.join(", ")}</p>
            </div>
            <div className="rounded-xl p-2.5" style={{ background: "rgba(34,197,94,0.07)" }}>
              <p className="stat-label text-green-600 mb-1">Better</p>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>{remedyOfDay.better.join(", ")}</p>
            </div>
          </div>
          <Link href="/student/materia-medica"
            className="flex items-center justify-center gap-1 w-full py-2.5 rounded-2xl text-xs font-semibold transition-all hover:shadow-md"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}>
            Explore Sulphur <ChevronRight className="h-3 w-3" />
          </Link>
          <div className="accent-blob" style={{ bottom: "-20px", left: "-20px", background: "linear-gradient(135deg,#4e73df,#a8c0ff)" }} />
        </div>

        {/* Aphorism + Quiz */}
        <div className="space-y-4">
          <div className="shard p-5">
            <div className="stat-label flex items-center gap-1.5 mb-3">
              <Quote className="h-3.5 w-3.5" style={{ color: "#4ECDC4" }} /> Aphorism of the Day
            </div>
            <div className="rounded-2xl p-4 mb-3" style={{ background: "rgba(78,205,196,0.08)" }}>
              <p className="text-3xl font-extrabold font-mono-neo mb-2" style={{ color: "#4ECDC4" }}>§{aphorismOfDay.number}</p>
              <p className="text-xs leading-relaxed italic" style={{ color: "var(--text-dim)" }}>&ldquo;{aphorismOfDay.text}&rdquo;</p>
              <p className="text-[10px] font-mono-neo mt-2" style={{ color: "var(--text-dim)" }}>— {aphorismOfDay.source}</p>
            </div>
            <Link href="/student/ai-tutor"
              className="flex items-center justify-center gap-1 w-full py-2 rounded-2xl text-xs font-semibold transition-all hover:shadow-md"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}>
              Explore in Organon Tutor <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="shard p-5">
            <div className="stat-label flex items-center gap-1.5 mb-3">
              <HelpCircle className="h-3.5 w-3.5" style={{ color: "#8A2BE2" }} /> Quiz of the Day
            </div>
            <div className="space-y-3">
              {quizOfDay.map((q, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-obsidian)" }}>{i + 1}. {q.q}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {q.options.map((opt, j) => (
                      <button key={j}
                        className="px-2.5 py-1.5 rounded-xl text-left text-xs font-medium transition-all hover:shadow-sm"
                        style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-dim)" }}>
                        {String.fromCharCode(65 + j)}. {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/student/quiz"
              className="flex items-center justify-center gap-1 w-full py-2 mt-3 rounded-2xl text-xs font-semibold transition-all hover:shadow-md"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}>
              Take Full Quiz <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Subject Mastery */}
      <div className="shard p-6">
        <div className="stat-label mb-4">Subject Mastery Progress</div>
        <div className="space-y-4">
          {masteryScores.map((s) => (
            <div key={s.subject}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold" style={{ color: "var(--text-obsidian)" }}>{s.subject}</span>
                <span className="font-mono-neo font-bold" style={{ color: s.color }}>{s.score}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="accent-blob" style={{ top: "50%", right: "-30px", background: "linear-gradient(135deg,#4e73df,#a8c0ff)" }} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: RotateCcw, label: "Flashcards", sub: "23 cards due today", href: "/student/flashcards", color: "#4e73df" },
          { icon: HelpCircle, label: "Quiz Engine", sub: "Practice MCQs", href: "/student/quiz", color: "#4ECDC4" },
          { icon: BookOpen, label: "Materia Medica", sub: "50 remedies indexed", href: "/student/materia-medica", color: "#8A2BE2" },
        ].map((item) => (
          <div key={item.label} className="shard p-5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: `${item.color}15` }}>
              <item.icon className="h-5 w-5" style={{ color: item.color }} strokeWidth={1.75} />
            </div>
            <h3 className="font-bold text-sm mb-0.5" style={{ color: "var(--text-obsidian)" }}>{item.label}</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>{item.sub}</p>
            <Link href={item.href}
              className="flex items-center justify-center gap-1 w-full py-2 rounded-2xl text-xs font-semibold transition-all hover:shadow-md"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}>
              Start <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="shard p-6">
        <div className="stat-label flex items-center gap-1.5 mb-4">
          <Trophy className="h-3.5 w-3.5 text-yellow-500" /> Achievements
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {achievements.map((a) => (
            <div key={a.label}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center transition-all ${a.unlocked ? "hover:shadow-md" : "opacity-35"}`}
              style={{ background: "rgba(255,255,255,0.5)", border: "1px solid var(--glass-border)" }}>
              <span className="text-2xl">{a.icon}</span>
              <span className="text-[10px] font-semibold leading-tight" style={{ color: "var(--text-obsidian)" }}>{a.label}</span>
              {a.unlocked && <span className="text-[9px] font-mono-neo px-1.5 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>Unlocked</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
