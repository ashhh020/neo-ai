"use client";

import { useState } from "react";
import { remedies } from "@/lib/data/remedies";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { sm2, SM2Grade } from "@/lib/sm2";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Generate flashcards from remedies data
const flashcards = remedies.slice(0, 20).map((r) => ({
  id: r.id,
  front: `What are the keynote mental symptoms of ${r.name}?`,
  back: r.mind.slice(0, 4).join("\n• "),
  remedy: r.name,
  deck: "materia-medica" as const,
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  nextReviewDate: new Date().toISOString().split("T")[0],
}));

const GRADE_BUTTONS: Array<{ grade: SM2Grade; label: string; color: string; desc: string }> = [
  { grade: 0, label: "Again", color: "#E11D48", desc: "< 1 min" },
  { grade: 2, label: "Hard", color: "#F59E0B", desc: "< 6 min" },
  { grade: 4, label: "Good", color: "#5BB85A", desc: "4 days" },
  { grade: 5, label: "Easy", color: "#2A5C8D", desc: "7 days" },
];

export default function FlashcardsPage() {
  const [cards, setCards] = useState(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  const currentCard = cards[currentIndex];
  const progress = (currentIndex / cards.length) * 100;

  function handleGrade(grade: SM2Grade) {
    const updated = sm2(currentCard, grade);
    setCards((prev) => prev.map((c, i) => i === currentIndex ? { ...c, ...updated } : c));
    setSessionStats((s) => ({ reviewed: s.reviewed + 1, correct: s.correct + (grade >= 3 ? 1 : 0) }));
    setFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setSessionDone(true);
    }
  }

  if (sessionDone) {
    const accuracy = Math.round((sessionStats.correct / sessionStats.reviewed) * 100);
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold font-poppins mb-2">Session Complete!</h2>
          <p className="text-muted-foreground mb-6">You reviewed {sessionStats.reviewed} cards with {accuracy}% accuracy</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold font-poppins">{sessionStats.reviewed}</p>
              <p className="text-xs text-muted-foreground">Cards Reviewed</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold font-poppins" style={{ color: "#5BB85A" }}>{accuracy}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </CardContent></Card>
          </div>
          <Button onClick={() => { setCurrentIndex(0); setFlipped(false); setSessionDone(false); setSessionStats({ reviewed: 0, correct: 0 }); }}
            className="gap-2 gradient-brand text-white border-0">
            <RotateCcw className="h-4 w-4" /> Review Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold font-poppins">Flashcards</h1>
          <Badge variant="secondary">{currentIndex + 1} / {cards.length}</Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{sessionStats.reviewed} reviewed</span>
          <span>{cards.length - currentIndex} remaining</span>
        </div>
      </div>

      {/* Card */}
      <div className="relative perspective-1000 mb-6">
        <div
          className={cn(
            "relative w-full cursor-pointer transition-transform duration-500",
            flipped ? "[transform:rotateY(180deg)]" : ""
          )}
          style={{ transformStyle: "preserve-3d", minHeight: "280px" }}
          onClick={() => setFlipped(!flipped)}
        >
          {/* Front */}
          <Card className="absolute inset-0 [backface-visibility:hidden]">
            <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center">
              <Badge variant="secondary" className="mb-4 text-xs">
                {currentCard.deck.replace("-", " ")}
              </Badge>
              <p className="text-lg font-semibold leading-relaxed">{currentCard.front}</p>
              <p className="text-sm text-muted-foreground mt-4">
                {flipped ? "" : "Click to reveal answer"}
              </p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ background: "linear-gradient(135deg, #8A2BE205, #4ECDC410)", borderColor: "#8A2BE230" }}>
            <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center">
              <p className="text-xs font-medium mb-3" style={{ color: "#8A2BE2" }}>{currentCard.remedy}</p>
              <div className="text-left w-full">
                {currentCard.back.split("\n").map((line, i) => (
                  <p key={i} className="text-sm text-muted-foreground mb-1.5">
                    {line.startsWith("•") ? line : `• ${line}`}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" disabled={currentIndex === 0}
          onClick={() => { setCurrentIndex((i) => i - 1); setFlipped(false); }}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setFlipped(!flipped)}>
          {flipped ? "Show Question" : "Show Answer"}
        </Button>
        <Button variant="ghost" size="icon" disabled={currentIndex === cards.length - 1}
          onClick={() => { setCurrentIndex((i) => i + 1); setFlipped(false); }}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Grade buttons */}
      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {GRADE_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              onClick={() => handleGrade(btn.grade)}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border hover:opacity-90 transition-all"
              style={{ borderColor: btn.color + "40", backgroundColor: btn.color + "10" }}
            >
              <span className="font-semibold text-sm" style={{ color: btn.color }}>{btn.label}</span>
              <span className="text-[10px] text-muted-foreground">{btn.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
