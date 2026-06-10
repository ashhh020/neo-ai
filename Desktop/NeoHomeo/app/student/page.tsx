"use client";
import { authedFetch } from "@/lib/authed-fetch";

import { useState, useEffect } from "react";
import { Flame, BookOpen, RotateCcw, HelpCircle, Trophy, ChevronRight, Zap, MessageSquarePlus, Sun, Quote, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { Progress } from "@/components/ui/progress";
import { remedies } from "@/lib/data/remedies";

// ── Deterministic "of the day" pickers — rotate by day-of-year so every
//    student sees the same item each day and it changes daily. ──
function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

const _doy = dayOfYear();
const _r = remedies[_doy % remedies.length];
const remedyOfDay = {
  name: _r.name,
  abbrev: (_r.abbreviation ?? _r.name.slice(0, 2)).replace(/\.$/, ""),
  thermal: _r.constitution?.split(",")[0] ?? "Constitutional",
  keynotes: (_r.keynotes ?? []).slice(0, 4),
  worse: (_r.modalities?.worse ?? []).slice(0, 3),
  better: (_r.modalities?.better ?? []).slice(0, 3),
};

// Aphorism number rotates 1–291; full text loaded live from the DB.
const aphorismNumOfDay = (_doy % 291) + 1;

const ALL_QUIZ_OF_DAY = [
  [
    { q: "Thermal state of Sulphur?", options: ["Chilly", "Hot", "Ambi", "Cold"], answer: 1 },
    { q: "Aphorism defining the similar remedy?", options: ["§1", "§9", "§153", "§269"], answer: 2 },
    { q: "Pulsatilla is thirstless even in high fever?", options: ["True", "False"], answer: 0 },
    { q: "Which miasm is called the 'mother of all chronic diseases'?", options: ["Sycosis", "Syphilis", "Psora", "Tuberculinum"], answer: 2 },
    { q: "Lycopodium characteristically worsens at:", options: ["4–8 pm", "2–4 am", "9–11 am", "Midnight"], answer: 0 },
  ],
  [
    { q: "Arsenicum Album is constitutionally:", options: ["Hot", "Chilly", "Ambi-thermal", "Warm"], answer: 1 },
    { q: "§7 of the Organon says prescribing is based on:", options: ["Diagnosis", "Totality of symptoms", "Lab reports", "Chief complaint"], answer: 1 },
    { q: "Chamomilla children are better when:", options: ["Lying still", "In cold air", "Carried and rocked", "Eating"], answer: 2 },
    { q: "Hering's Law states cure proceeds:", options: ["From acute to chronic", "From within outward", "From skin inward", "Randomly"], answer: 1 },
    { q: "Nux Vomica suits ailments from:", options: ["Grief", "Overwork and stimulants", "Suppressed eruptions", "Fright"], answer: 1 },
  ],
  [
    { q: "Which remedy has 'burning pains relieved by heat'?", options: ["Sulphur", "Pulsatilla", "Arsenicum Album", "Belladonna"], answer: 2 },
    { q: "Lachesis is worse after:", options: ["Eating", "Sleep", "Exercise", "Cold air"], answer: 1 },
    { q: "Phosphorus craves:", options: ["Sweets", "Sour", "Cold food and drinks", "Warm milk"], answer: 2 },
    { q: "Miasm of excess, warts, and overgrowth is:", options: ["Psora", "Sycosis", "Syphilis", "Tuberculinum"], answer: 1 },
    { q: "§153 instructs prescribers to focus on:", options: ["Common disease symptoms", "Peculiar and striking symptoms", "Pathology reports", "Chief complaint only"], answer: 1 },
  ],
];
const quizOfDay = ALL_QUIZ_OF_DAY[_doy % ALL_QUIZ_OF_DAY.length];

// Rotate suggested prompts by day-of-year so they change daily
const ALL_PROMPTS = [
  "Explain Sulphur keynotes", "Compare Pulsatilla vs Sepia",
  "Teach me Aphorism 153", "Find rubrics for fear of death",
  "What is the thermal state of Arsenicum Album?", "Explain miasmatic theory",
  "Differentiate Natrum Mur and Ignatia in grief", "Describe the Lycopodium constitution",
  "What does §9 of the Organon say?", "Explain Hering's Law of Cure",
  "Compare Lachesis and Naja", "Describe Calcarea Carb keynotes",
  "What are Medorrhinum's peculiar modalities?", "Explain potentisation §270",
  "Describe the sycotic miasm", "Find rubrics for consolation aggravation",
];
const suggestedPrompts = [
  ALL_PROMPTS[_doy % ALL_PROMPTS.length],
  ALL_PROMPTS[(_doy + 1) % ALL_PROMPTS.length],
  ALL_PROMPTS[(_doy + 2) % ALL_PROMPTS.length],
  ALL_PROMPTS[(_doy + 3) % ALL_PROMPTS.length],
];

interface Profile {
  name: string;
  streak_days: number;
  xp_points: number;
}

interface QuizTopicAvg {
  topic: string;
  average: number;
  count: number;
}

const XP_PER_LEVEL = 500;

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "Student";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [topicAverages, setTopicAverages] = useState<QuizTopicAvg[]>([]);
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [threadCount, setThreadCount] = useState<number | null>(null);
  const [aphorism, setAphorism] = useState<{ number: number; text: string; source: string } | null>(null);
  const [quizPick, setQuizPick] = useState<Record<number, number>>({});

  // Load the aphorism of the day from the live Organon database
  useEffect(() => {
    fetch(`/api/organon?type=aphorism&num=${aphorismNumOfDay}&sources=hahnemann6`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const row = d?.rows?.[0];
        if (row?.content) {
          setAphorism({
            number: aphorismNumOfDay,
            text: row.content,
            source: "Organon, 6th Ed.",
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Load profile
    authedFetch("/api/profile").then(r => r.ok ? r.json() : null).then(d => { if (d) setProfile(d.profile); });
    // Load quiz averages
    authedFetch("/api/quiz-results?limit=50").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.topicAverages) setTopicAverages(d.topicAverages);
    });
    // Load due flashcards count
    authedFetch("/api/flashcards?deck=materia-medica").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.reviews) {
        const today = new Date().toISOString().split("T")[0];
        const due = d.reviews.filter((r: { next_review_at: string }) => r.next_review_at.split("T")[0] <= today).length;
        setDueCount(due);
      }
    });
    // Load thread count
    authedFetch("/api/chat").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.threads) setThreadCount(d.threads.length);
    });
  }, []);

  const xp = profile?.xp_points ?? 0;
  const streak = profile?.streak_days ?? 0;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpToNext = level * XP_PER_LEVEL;

  // Build mastery scores from quiz topic averages (fallback to 0)
  const topicMap = Object.fromEntries(topicAverages.map(t => [t.topic, t.average]));
  const masteryScores = [
    { subject: "Materia Medica", score: topicMap["Materia Medica"] ?? topicMap["Mixed"] ?? 0, color: "#4e73df" },
    { subject: "Organon", score: topicMap["Organon"] ?? 0, color: "#4ECDC4" },
    { subject: "Repertory", score: topicMap["Repertory"] ?? 0, color: "#8A2BE2" },
  ];

  // ── Achievements computed from real activity ──
  const totalQuizzes = topicAverages.reduce((sum, t) => sum + (t.count ?? 0), 0);
  const bestAvg = topicAverages.reduce((m, t) => Math.max(m, t.average ?? 0), 0);
  const threads = threadCount ?? 0;
  const achievements = [
    { icon: "🌱", label: "First Steps", unlocked: streak >= 1, progress: Math.min(streak, 1), max: 1 },
    { icon: "🔥", label: "7-Day Streak", unlocked: streak >= 7, progress: Math.min(streak, 7), max: 7 },
    { icon: "💎", label: "30-Day Streak", unlocked: streak >= 30, progress: Math.min(streak, 30), max: 30 },
    { icon: "⭐", label: "Quiz Master", unlocked: totalQuizzes >= 5, progress: Math.min(totalQuizzes, 5), max: 5 },
    { icon: "🏆", label: "MM Champion", unlocked: bestAvg >= 80, progress: Math.min(Math.round(bestAvg), 80), max: 80 },
    { icon: "💬", label: "Curious Mind", unlocked: threads >= 3, progress: Math.min(threads, 3), max: 3 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>
            Hello, {profile?.name?.split(" ")[0] ?? firstName}!
          </h1>
          <p className="text-sm mt-0.5 font-mono-neo" style={{ color: "var(--text-dim)" }}>True Practitioner of the Healing Art</p>
        </div>
        <Link href="/student/chat"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-semibold text-sm gradient-mineral hover:opacity-90 transition-opacity">
          <MessageSquarePlus className="h-4 w-4" />
          Ask Hahnemann AI
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
              <div className="stat-value text-orange-500">{streak}</div>
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
          <Progress value={Math.min((xp / xpToNext) * 100, 100)} className="h-1.5" />
        </div>

        {/* Quick stats */}
        <div className="shard p-5">
          <div className="stat-label mb-3">Activity Summary</div>
          <div className="space-y-2.5">
            {[
              { label: "Flashcards due today", value: dueCount === null ? null : dueCount },
              { label: "Chat sessions", value: threadCount === null ? null : threadCount },
              { label: "Quiz topics practiced", value: topicAverages.length },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--text-dim)" }}>{label}</span>
                {value === null
                  ? <span className="w-6 h-3 rounded animate-pulse" style={{ background: "rgba(0,0,0,0.08)" }} />
                  : <span className="font-bold font-mono-neo" style={{ color: "var(--text-obsidian)" }}>{value}</span>
                }
              </div>
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
              {remedyOfDay.abbrev}
            </div>
            <div>
              <h3 className="text-xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>{remedyOfDay.name}</h3>
              <span className="text-xs font-mono-neo px-2 py-0.5 rounded-full" style={{ background: "#4e73df15", color: "#4e73df" }}>
                {remedyOfDay.thermal}
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
          <Link href={`/student/materia-medica?q=${encodeURIComponent(remedyOfDay.name)}`}
            className="flex items-center justify-center gap-1 w-full py-2.5 rounded-2xl text-xs font-semibold transition-all hover:shadow-md"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--glass-border)", color: "var(--text-obsidian)" }}>
            Explore {remedyOfDay.name} <ChevronRight className="h-3 w-3" />
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
              <p className="text-3xl font-extrabold font-mono-neo mb-2" style={{ color: "#4ECDC4" }}>§{aphorism?.number ?? aphorismNumOfDay}</p>
              <p className="text-xs leading-relaxed italic" style={{ color: "var(--text-dim)" }}>
                {aphorism ? `"${aphorism.text.slice(0, 460)}${aphorism.text.length > 460 ? "..." : ""}"` : "Loading today's aphorism..."}
              </p>
              {aphorism && <p className="text-[10px] font-mono-neo mt-2" style={{ color: "var(--text-dim)" }}>— {aphorism.source}</p>}
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
              {quizOfDay.map((q, i) => {
                const picked = quizPick[i];
                const answered = picked !== undefined;
                return (
                  <div key={i}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-obsidian)" }}>{i + 1}. {q.q}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {q.options.map((opt, j) => {
                        const isCorrect = j === q.answer;
                        const isPicked = picked === j;
                        let bg = "rgba(255,255,255,0.6)";
                        let color = "var(--text-dim)";
                        let border = "var(--glass-border)";
                        if (answered && isCorrect) { bg = "rgba(34,197,94,0.12)"; color = "#16a34a"; border = "#16a34a"; }
                        else if (answered && isPicked && !isCorrect) { bg = "rgba(239,68,68,0.12)"; color = "#ef4444"; border = "#ef4444"; }
                        return (
                          <button key={j}
                            onClick={() => !answered && setQuizPick((p) => ({ ...p, [i]: j }))}
                            disabled={answered}
                            className="px-2.5 py-1.5 rounded-xl text-left text-xs font-medium transition-all hover:shadow-sm"
                            style={{ background: bg, border: `1px solid ${border}`, color }}>
                            {String.fromCharCode(65 + j)}. {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
                <span className="font-mono-neo font-bold" style={{ color: s.score > 0 ? s.color : "var(--text-dim)" }}>
                  {s.score > 0 ? `${s.score}%` : "—"}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
              </div>
              {s.score === 0 && (
                <p className="text-[10px] mt-1 font-mono-neo" style={{ color: "var(--text-dim)" }}>
                  Complete a {s.subject} quiz to track progress
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="accent-blob" style={{ top: "50%", right: "-30px", background: "linear-gradient(135deg,#4e73df,#a8c0ff)" }} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: RotateCcw, label: "Flashcards", sub: dueCount !== null ? `${dueCount} cards due today` : "Loading…", href: "/student/flashcards", color: "#4e73df" },
          { icon: HelpCircle, label: "Quiz Engine", sub: "Practice MCQs", href: "/student/quiz", color: "#4ECDC4" },
          { icon: BookOpen, label: "Materia Medica", sub: "3,700+ remedies · 9 authors", href: "/student/materia-medica", color: "#8A2BE2" },
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
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center transition-all ${a.unlocked ? "hover:shadow-md" : "opacity-50"}`}
              style={{ background: "rgba(255,255,255,0.5)", border: "1px solid var(--glass-border)" }}>
              <span className="text-2xl">{a.icon}</span>
              <span className="text-[10px] font-semibold leading-tight" style={{ color: "var(--text-obsidian)" }}>{a.label}</span>
              {a.unlocked
                ? <span className="text-[9px] font-mono-neo px-1.5 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>Unlocked</span>
                : (
                  <div className="w-full">
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(a.progress / a.max) * 100}%`, background: "var(--accent-mineral)" }} />
                    </div>
                    <span className="text-[9px] font-mono-neo" style={{ color: "var(--text-dim)" }}>{a.progress}/{a.max}</span>
                  </div>
                )
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
