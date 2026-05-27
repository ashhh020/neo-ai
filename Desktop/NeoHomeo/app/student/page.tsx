"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Star, BookOpen, RotateCcw, HelpCircle, Trophy, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

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

export default function StudentDashboard() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-poppins">Study Dashboard 📖</h1>
        <p className="text-muted-foreground text-sm">Keep up the momentum, Ashraf!</p>
      </div>

      {/* Streak + XP */}
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

      {/* Mastery scores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Subject Mastery</CardTitle>
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
