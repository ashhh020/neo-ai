"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Flame, BookOpen, RotateCcw, HelpCircle, Trophy, ChevronRight, Zap,
  MessageSquarePlus, Sun, Quote, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";

const streakDays = 12;
const xp = 3240;
const level = 8;
const xpToNext = 4000;

const masteryScores = [
  { subject: "Materia Medica", score: 74, color: "#2A5C8D" },
  { subject: "Organon", score: 58, color: "#4ECDC4" },
  { subject: "Repertory", score: 61, color: "#8A2BE2" },
];

const achievements = [
  { icon: "🔥", label: "10-Day Streak", unlocked: true },
  { icon: "📚", label: "50 Cards Reviewed", unlocked: true },
  { icon: "⭐", label: "Quiz Master", unlocked: true },
  { icon: "🏆", label: "Materia Champion", unlocked: false },
  { icon: "💎", label: "30-Day Streak", unlocked: false },
  { icon: "🎯", label: "Perfect Quiz", unlocked: false },
];

const todayPlan = [
  { label: "Review 15 flashcards", done: true, href: "/student/flashcards" },
  { label: "Complete daily quiz (10 questions)", done: false, href: "/student/quiz" },
  { label: "Read: Sulphur – Mind section", done: false, href: "/student/materia-medica" },
];

const remedyOfDay = {
  name: "Sulphur",
  thermal: "Hot",
  keynotes: ["Dirty, ragged appearance", "Burning sensations everywhere", "Worse heat, better cold applications", "Hungry at 11 AM"],
  modalities: { worse: ["Heat", "Standing", "Washing", "11 AM"], better: ["Dry weather", "Motion"] },
  relationships: ["Complementary: Nux Vomica, Calcarea", "Antidoted by: Camphor, Mercurius"],
};

const aphorismOfDay = {
  number: 153,
  text: "In searching for the specific remedy for a disease, the more striking, singular, uncommon, and peculiar signs and symptoms of the case are chiefly and almost solely to be taken into consideration.",
  source: "Organon of Medicine, 6th Edition",
};

const quizOfDay = [
  { q: "What is the thermal state of Sulphur?", options: ["Chilly", "Hot", "Ambi-thermal", "Cold"], answer: 1 },
  { q: "Which Organon aphorism defines the similar remedy?", options: ["§1", "§9", "§153", "§269"], answer: 2 },
];

const suggestedPrompts = [
  "Explain Sulphur.",
  "Compare Pulsatilla and Sepia.",
  "Teach me Aphorism 153.",
  "Find rubrics for fear of death.",
];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0] || "Practitioner";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-poppins">Hello, {firstName}!</h1>
          <p className="text-muted-foreground text-sm mt-0.5">True Practitioner of the Healing Art</p>
        </div>
        <Button asChild className="gradient-brand text-white border-0 gap-2 hidden sm:flex">
          <Link href="/student/chat">
            <MessageSquarePlus className="h-4 w-4" />
            Ask NeoHomeo AI
          </Link>
        </Button>
      </div>

      {/* AI suggested prompts */}
      <div className="bg-card border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4" style={{ color: "#8A2BE2" }} />
          <span className="text-sm font-semibold">Suggested for you</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((p) => (
            <Link key={p} href={`/student/chat?q=${encodeURIComponent(p)}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted transition-colors text-xs py-1 px-3">
                {p}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Streak + XP + Today's Plan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover" style={{ background: "linear-gradient(135deg, #FF6B3520, #F59E0B20)" }}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-3xl font-bold font-poppins text-orange-500">{streakDays}</p>
                <p className="text-sm text-muted-foreground">Day Streak 🔥</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover" style={{ background: "linear-gradient(135deg, #8A2BE220, #4ECDC420)" }}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8" style={{ color: "#8A2BE2" }} />
              <div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-3xl font-bold font-poppins">{xp.toLocaleString()}</p>
                  <span className="text-sm text-muted-foreground">XP</span>
                </div>
                <p className="text-sm text-muted-foreground">Level {level}</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress to Level {level + 1}</span>
                <span>{xp}/{xpToNext}</span>
              </div>
              <Progress value={(xp / xpToNext) * 100} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-3">Today&apos;s Plan</p>
            <div className="space-y-2">
              {todayPlan.map((item) => (
                <Link key={item.label} href={item.href} className="flex items-center gap-2 group">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${item.done ? "bg-green-500 border-green-500" : "border-muted-foreground"}`}>
                    {item.done && <span className="text-white text-[8px]">✓</span>}
                  </div>
                  <span className={`text-xs ${item.done ? "line-through text-muted-foreground" : "group-hover:text-primary"}`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Remedy of the Day + Aphorism of the Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Remedy of the Day */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              Remedy of the Day
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg font-poppins"
                style={{ background: "linear-gradient(135deg, #2A5C8D, #4ECDC4)" }}
              >
                Su
              </div>
              <div>
                <h3 className="font-bold font-poppins text-lg">{remedyOfDay.name}</h3>
                <Badge variant="outline" className="text-xs" style={{ color: "#EF4444", borderColor: "#EF4444" }}>
                  Thermal: {remedyOfDay.thermal}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Keynotes</p>
              <ul className="space-y-1">
                {remedyOfDay.keynotes.map((k) => (
                  <li key={k} className="flex items-start gap-1.5 text-xs">
                    <span className="mt-1 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                    {k}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-2">
                <p className="text-[10px] font-semibold text-red-600 mb-1">Worse</p>
                <p className="text-xs text-muted-foreground">{remedyOfDay.modalities.worse.join(", ")}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-2">
                <p className="text-[10px] font-semibold text-green-600 mb-1">Better</p>
                <p className="text-xs text-muted-foreground">{remedyOfDay.modalities.better.join(", ")}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full gap-1" asChild>
              <Link href="/student/materia-medica">
                Explore Sulphur <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Aphorism of the Day + Quiz of the Day */}
        <div className="space-y-4">
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Quote className="h-4 w-4 text-teal-500" />
                Aphorism of the Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-xl p-4">
                <p className="text-2xl font-bold font-poppins mb-2" style={{ color: "#4ECDC4" }}>
                  §{aphorismOfDay.number}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground italic mb-2">
                  &ldquo;{aphorismOfDay.text}&rdquo;
                </p>
                <p className="text-[10px] text-muted-foreground">— {aphorismOfDay.source}</p>
              </div>
              <Button size="sm" variant="outline" className="w-full gap-1 mt-3" asChild>
                <Link href="/student/ai-tutor">
                  Explore in Organon Tutor <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-purple-500" />
                Quiz of the Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quizOfDay.map((q, i) => (
                  <div key={i} className="text-xs">
                    <p className="font-medium mb-1.5">{i + 1}. {q.q}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {q.options.map((opt, j) => (
                        <button
                          key={j}
                          className="px-2 py-1.5 rounded-lg border text-left hover:bg-muted transition-colors"
                        >
                          {String.fromCharCode(65 + j)}. {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="w-full gap-1 mt-3" asChild>
                <Link href="/student/quiz">
                  Take Full Quiz <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subject Mastery */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Subject Mastery Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {masteryScores.map((s) => (
            <div key={s.subject}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium">{s.subject}</span>
                <span className="font-bold" style={{ color: s.color }}>{s.score}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: RotateCcw, label: "Flashcards", sub: "23 cards due today", href: "/student/flashcards", color: "#2A5C8D" },
          { icon: HelpCircle, label: "Quiz Engine", sub: "Practice MCQs", href: "/student/quiz", color: "#4ECDC4" },
          { icon: BookOpen, label: "Materia Medica", sub: "50 remedies", href: "/student/materia-medica", color: "#8A2BE2" },
        ].map((item) => (
          <Card key={item.label} className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + "20" }}>
                  <item.icon className="h-5 w-5" style={{ color: item.color }} strokeWidth={1.75} />
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-0.5">{item.label}</h3>
              <p className="text-xs text-muted-foreground mb-3">{item.sub}</p>
              <Button size="sm" variant="outline" className="w-full gap-1" asChild>
                <Link href={item.href}>
                  Start <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {achievements.map((a) => (
              <div
                key={a.label}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center ${a.unlocked ? "" : "opacity-40"}`}
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs font-medium leading-tight">{a.label}</span>
                {a.unlocked && <Badge className="text-[10px] px-1.5 py-0" variant="secondary">Unlocked</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
