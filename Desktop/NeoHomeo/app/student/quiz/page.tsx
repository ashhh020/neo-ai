"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const questions = [
  {
    id: 1,
    question: "Which remedy is indicated when the patient says 'I am fine' despite being clearly very ill?",
    options: ["Belladonna", "Arnica Montana", "Aconite", "Ignatia"],
    correct: 1,
    explanation: "Arnica patients characteristically insist they are well and don't need help, even when in obvious distress. This is a classic keynote.",
    difficulty: "easy" as const,
    topic: "Materia Medica",
  },
  {
    id: 2,
    question: "A patient worsens after sleep and cannot tolerate anything tight around the neck. What remedy do you consider?",
    options: ["Natrum Muriaticum", "Lycopodium", "Lachesis", "Sulphur"],
    correct: 2,
    explanation: "Lachesis is the primary remedy for aggravation after sleep (sleeps into aggravation) and intolerance to anything tight around the throat or waist.",
    difficulty: "medium" as const,
    topic: "Materia Medica",
  },
  {
    id: 3,
    question: "In Kent's Repertory, which section covers the mental and emotional symptoms?",
    options: ["GENERALS", "MIND", "HEAD", "PARTICULARS"],
    correct: 1,
    explanation: "The MIND section in Kent's Repertory is the first and most important section, covering all mental, emotional, and psychological symptoms.",
    difficulty: "easy" as const,
    topic: "Repertory",
  },
  {
    id: 4,
    question: "Which miasm is associated with destructiveness, syphilitic tendency, and ulcerative processes?",
    options: ["Psora", "Sycosis", "Syphilis", "Tubercular"],
    correct: 2,
    explanation: "The Syphilitic miasm is associated with destruction, degeneration, ulceration, and nihilistic tendencies. It corresponds to Hahnemann's Syphilis classification.",
    difficulty: "hard" as const,
    topic: "Organon",
  },
  {
    id: 5,
    question: "Pulsatilla is thirstless even in fever. True or False?",
    options: ["True", "False"],
    correct: 0,
    explanation: "True. Thirstlessness despite high fever is a classic keynote of Pulsatilla. This is in contrast to Arsenicum which has great thirst for small sips.",
    difficulty: "easy" as const,
    topic: "Materia Medica",
  },
  {
    id: 6,
    question: "A child is brought in screaming with pain, one cheek red and hot, one pale and cold. The mother says the child can only be soothed by carrying. Which remedy?",
    options: ["Belladonna", "Pulsatilla", "Chamomilla", "Calcarea Carb"],
    correct: 2,
    explanation: "Chamomilla: extreme irritability and hypersensitivity to pain, better from being carried, one cheek red and hot, one pale cold — classic keynotes.",
    difficulty: "medium" as const,
    topic: "Materia Medica",
  },
];

const difficultyColor: Record<string, string> = {
  easy: "#5BB85A",
  medium: "#F59E0B",
  hard: "#E11D48",
};

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const current = questions[currentIndex];
  const isCorrect = selected === current.correct;

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = idx;
    setAnswers(newAnswers);
    if (idx === current.correct) setScore((s) => s + 1);
  }

  function handleNext() {
    setSelected(null);
    setShowExplanation(false);
    setTimeLeft(30);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setQuizDone(true);
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers(new Array(questions.length).fill(null));
    setQuizDone(false);
    setTimeLeft(30);
  }

  if (quizDone) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="text-center py-10">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold font-poppins mb-2">Quiz Complete!</h2>
          <p className="text-muted-foreground mb-6">You scored {score}/{questions.length} ({percent}%)</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Correct", value: score, color: "#5BB85A" },
              { label: "Incorrect", value: questions.length - score, color: "#E11D48" },
              { label: "Accuracy", value: `${percent}%`, color: "#2A5C8D" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold font-poppins" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Per-question review */}
          <div className="text-left mb-6 space-y-2">
            <p className="text-sm font-medium mb-2">Question Review:</p>
            {questions.map((q, i) => (
              <div key={q.id} className="flex items-center gap-2 text-sm">
                {answers[i] === q.correct
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                <span className={cn("flex-1 truncate", answers[i] !== q.correct && "text-muted-foreground")}>{q.question}</span>
              </div>
            ))}
          </div>
          <Button onClick={handleRestart} className="gap-2 gradient-brand text-white border-0">
            <RotateCcw className="h-4 w-4" /> Retry Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold font-poppins">Quiz Engine</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className={cn("font-mono font-medium", timeLeft <= 10 && "text-red-500")}>{timeLeft}s</span>
            </div>
            <Badge variant="secondary">{currentIndex + 1}/{questions.length}</Badge>
          </div>
        </div>
        <Progress value={((currentIndex) / questions.length) * 100} className="h-1.5" />
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className="text-xs"
              style={{ backgroundColor: difficultyColor[current.difficulty] + "20", color: difficultyColor[current.difficulty] }}
            >
              {current.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">{current.topic}</Badge>
          </div>
          <CardTitle className="text-base leading-relaxed font-normal">{current.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {current.options.map((option, i) => (
            <button
              key={i}
              disabled={selected !== null}
              onClick={() => handleSelect(i)}
              className={cn(
                "w-full text-left p-3 rounded-xl border text-sm transition-all",
                selected === null && "hover:bg-muted cursor-pointer",
                selected !== null && i === current.correct && "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300",
                selected === i && i !== current.correct && "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300",
                selected !== null && i !== selected && i !== current.correct && "opacity-50"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
                {selected !== null && i === current.correct && (
                  <CheckCircle2 className="ml-auto h-4 w-4 text-green-500 flex-shrink-0" />
                )}
                {selected === i && i !== current.correct && (
                  <XCircle className="ml-auto h-4 w-4 text-red-500 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {showExplanation && (
        <Card className="mb-4" style={{ borderColor: isCorrect ? "#5BB85A40" : "#E11D4840", backgroundColor: isCorrect ? "#5BB85A08" : "#E11D4808" }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
              <span className="text-sm font-medium" style={{ color: isCorrect ? "#5BB85A" : "#E11D48" }}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{current.explanation}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Score: <span className="font-bold text-foreground">{score}/{currentIndex + (selected !== null ? 1 : 0)}</span></div>
        <Button onClick={handleNext} disabled={selected === null} className="gradient-brand text-white border-0">
          {currentIndex < questions.length - 1 ? "Next Question →" : "See Results →"}
        </Button>
      </div>
    </div>
  );
}
