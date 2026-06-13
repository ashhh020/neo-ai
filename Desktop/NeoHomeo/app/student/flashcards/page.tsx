"use client";
import { authedFetch } from "@/lib/authed-fetch";

import { useState, useEffect } from "react";
import { remedies } from "@/lib/data/remedies";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { sm2, SM2Grade } from "@/lib/sm2";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  remedy: string;
  deck: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
}

// Generate a rich flashcard deck from ALL remedies in the database.
// Each remedy yields several card types (keynotes, mind, modalities) so a
// 50-remedy dataset produces ~150 study cards instead of 20.
const TODAY = new Date().toISOString().split("T")[0];

function makeCard(
  id: string,
  remedy: string,
  front: string,
  back: string
): Flashcard {
  return {
    id,
    front,
    back,
    remedy,
    deck: "materia-medica",
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: TODAY,
  };
}

const BASE_CARDS: Flashcard[] = remedies.flatMap((r) => {
  const cards: Flashcard[] = [];

  if (r.keynotes?.length) {
    cards.push(makeCard(`${r.id}_key`, r.name,
      `What are the keynote characteristics of ${r.name}?`,
      r.keynotes.slice(0, 5).join("\n• ")));
  }
  if (r.mind?.length) {
    cards.push(makeCard(`${r.id}_mind`, r.name,
      `Describe the mental / emotional picture of ${r.name}.`,
      r.mind.slice(0, 5).join("\n• ")));
  }
  const worse = r.modalities?.worse ?? [];
  const better = r.modalities?.better ?? [];
  if (worse.length || better.length) {
    cards.push(makeCard(`${r.id}_mod`, r.name,
      `What are the modalities (worse / better) of ${r.name}?`,
      `Worse: ${worse.join(", ") || "—"}\n• Better: ${better.join(", ") || "—"}`));
  }
  return cards;
});

// ── Organon deck: curated key aphorisms as Q&A flashcards ──
const ORGANON_QA: Array<[string, string, string]> = [
  ["§1", "What is the physician's highest and only calling?", "To restore the sick to health — to cure, as it is termed."],
  ["§2", "What is the ideal of cure?", "Rapid, gentle and permanent restoration of health; removal of the whole disease in the shortest, most reliable, harmless way, on easily comprehensible principles."],
  ["§5", "What helps the physician in the cure?", "The fundamental cause (exciting/maintaining), the miasm, and the most significant points of the patient's whole history."],
  ["§6", "What does the unprejudiced observer perceive in disease?", "Nothing but the morbid signs and symptoms — the outwardly reflected picture of the inner essence of the disease."],
  ["§7", "What guides the choice of remedy?", "The totality of the symptoms — the sole indication for the medicine to be chosen."],
  ["§9", "What is the vital force in health?", "The spirit-like dynamis (vital force) animating the organism reigns in supreme sovereignty, keeping all parts in harmonious, healthy operation."],
  ["§11", "What happens in disease, dynamically?", "The vital force is dynamically deranged by a morbific agent, producing abnormal sensations and functions we perceive as disease."],
  ["§19", "How can medicines cure?", "Only by their power to alter the state of health — to produce certain symptoms (their artificial disease power)."],
  ["§22", "Which symptoms must a curative medicine address?", "It must be able to produce, in healthy people, symptoms similar to those of the disease to be cured (similia similibus)."],
  ["§24", "What is the only suitable therapeutic method?", "The homeopathic method — choosing the medicine able to produce a similar artificial disease."],
  ["§28", "What is the law of cure called?", "Similia similibus curentur — let likes be cured by likes."],
  ["§61", "What did the homeopathic principle reveal about palliation?", "Antipathic (opposite) treatment gives short relief then worsens the disease — proving the value of the opposite, homeopathic, approach."],
  ["§63", "What are primary and secondary action?", "Primary action: the medicine's initial effect on the vital force. Secondary action: the vital force's opposite, counter-reaction restoring balance."],
  ["§153", "Which symptoms are most important in remedy selection?", "The more striking, singular, uncommon and peculiar (characteristic) signs and symptoms are chiefly and almost solely to be considered."],
  ["§246", "What governs repetition of the dose?", "A well-chosen dose may be repeated at suitable intervals — each time slightly modified (potency) — to speed cure without aggravation (LM/50-millesimal method)."],
  ["§270", "What is potentisation (dynamisation)?", "By successive dilution with succussion/trituration the medicinal powers latent in a crude substance are developed and freed to act on the vital force."],
];

const ORGANON_CARDS: Flashcard[] = ORGANON_QA.map(([num, q, a]) => ({
  id: `organon_${num.replace(/[§\s]/g, "")}`,
  front: `Organon ${num} — ${q}`,
  back: a,
  remedy: `Organon ${num}`,
  deck: "organon",
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  nextReviewDate: TODAY,
}));

const DECKS: Record<string, { label: string; cards: Flashcard[] }> = {
  "materia-medica": { label: "Materia Medica", cards: BASE_CARDS },
  organon: { label: "Organon", cards: ORGANON_CARDS },
};

const GRADE_BUTTONS: Array<{ grade: SM2Grade; label: string; color: string; desc: string }> = [
  { grade: 0, label: "Again", color: "#E11D48", desc: "< 1 min" },
  { grade: 2, label: "Hard", color: "#F59E0B", desc: "< 6 min" },
  { grade: 4, label: "Good", color: "#5BB85A", desc: "4 days" },
  { grade: 5, label: "Easy", color: "#2A5C8D", desc: "7 days" },
];

export default function FlashcardsPage() {
  const [deck, setDeck] = useState<string>("materia-medica");
  const [cards, setCards] = useState<Flashcard[]>(DECKS["materia-medica"].cards);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
  const [sessionDone, setSessionDone] = useState(false);

  // Load SM2 state from DB whenever the active deck changes
  useEffect(() => {
    let cancelled = false;
    async function loadSM2() {
      setLoading(true);
      setCurrentIndex(0);
      setFlipped(false);
      setSessionDone(false);
      setSessionStats({ reviewed: 0, correct: 0 });
      const base = DECKS[deck].cards;
      try {
        const res = await authedFetch(`/api/flashcards?deck=${deck}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          const reviews: Record<string, { ease_factor: number; interval_days: number; repetitions: number; next_review_at: string }> = {};
          for (const r of (data.reviews ?? [])) {
            reviews[r.card_id] = r;
          }
          setCards(base.map((c) => {
            const saved = reviews[c.id];
            if (!saved) return c;
            return {
              ...c,
              easeFactor: saved.ease_factor,
              interval: saved.interval_days,
              repetitions: saved.repetitions,
              nextReviewDate: saved.next_review_at.split("T")[0],
            };
          }));
        } else if (!cancelled) {
          setCards(base);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadSM2();
    return () => { cancelled = true; };
  }, [deck]);

  const dueCards = cards.filter((c) => c.nextReviewDate <= new Date().toISOString().split("T")[0]);
  const activeCards = dueCards;
  const currentCard = activeCards[currentIndex];
  const progress = activeCards.length > 0 ? (currentIndex / activeCards.length) * 100 : 0;

  // Spacebar to flip card (L6)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === " " && !sessionDone && currentCard) {
        e.preventDefault();
        setFlipped(f => !f);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [sessionDone, currentCard]);

  async function handleGrade(grade: SM2Grade) {
    const updated = sm2(currentCard, grade);
    // Save to DB
    authedFetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        card_id: currentCard.id,
        deck: currentCard.deck,
        grade,
        ease_factor: updated.easeFactor,
        interval_days: updated.interval,
        repetitions: updated.repetitions,
        next_review_at: new Date(updated.nextReviewDate).toISOString(),
      }),
    });

    setCards((prev) => prev.map((c) => c.id === currentCard.id ? { ...c, ...updated } : c));
    setSessionStats((s) => ({ reviewed: s.reviewed + 1, correct: s.correct + (grade >= 3 ? 1 : 0) }));
    setFlipped(false);
    if (currentIndex < activeCards.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setSessionDone(true);
      // Award XP for flashcard session
      authedFetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activity: "flashcard_session" }) });
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-lg mx-auto flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent-mineral)" }} />
      </div>
    );
  }

  if (sessionDone) {
    const accuracy = sessionStats.reviewed > 0 ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100) : 0;
    return (
      <div className="p-6 max-w-lg mx-auto space-y-5">
        <div className="shard p-8 text-center space-y-3">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-obsidian)", letterSpacing: "-0.03em" }}>Session Complete!</h2>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>You reviewed {sessionStats.reviewed} cards with {accuracy}% accuracy</p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="shard p-4 text-center">
              <p className="text-2xl font-black" style={{ color: "var(--text-obsidian)" }}>{sessionStats.reviewed}</p>
              <p className="text-xs font-mono-neo" style={{ color: "var(--text-dim)" }}>Cards Reviewed</p>
            </div>
            <div className="shard p-4 text-center">
              <p className="text-2xl font-black" style={{ color: accuracy >= 70 ? "#16a34a" : "#F59E0B" }}>{accuracy}%</p>
              <p className="text-xs font-mono-neo" style={{ color: "var(--text-dim)" }}>Accuracy</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setCurrentIndex(0); setFlipped(false); setSessionDone(false); setSessionStats({ reviewed: 0, correct: 0 }); }}
            className="flex-1 h-11 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 gradient-mineral">
            <RotateCcw className="h-4 w-4" /> Review Again
          </button>
          <a href="/student"
            className="flex-1 h-11 rounded-2xl font-bold text-sm flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.05)", color: "var(--text-dim)" }}>
            Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="shard p-12 text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-extrabold" style={{ color: "var(--text-obsidian)" }}>All caught up!</h2>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>No cards due for review today. Come back tomorrow!</p>
          <div className="flex gap-3 justify-center mt-2">
            <button onClick={() => {
              // Allow reviewing all cards even when none are due
              setCards(DECKS[deck].cards);
              setCurrentIndex(0);
              setFlipped(false);
              setSessionStats({ reviewed: 0, correct: 0 });
            }}
              className="px-5 py-2.5 rounded-2xl text-white font-semibold text-sm gradient-mineral">
              Review all cards anyway
            </button>
            <a href="/student"
              className="px-5 py-2.5 rounded-2xl font-semibold text-sm flex items-center"
              style={{ background: "rgba(0,0,0,0.05)", color: "var(--text-dim)" }}>
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold font-poppins">Flashcards</h1>
          <Badge variant="secondary">{currentIndex + 1} / {activeCards.length}</Badge>
        </div>
        {/* Deck selector */}
        <div className="flex gap-2 mb-3">
          {Object.entries(DECKS).map(([key, d]) => (
            <button
              key={key}
              onClick={() => setDeck(key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all border",
                deck === key
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-transparent text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {d.label} <span className="opacity-60">· {d.cards.length}</span>
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{sessionStats.reviewed} reviewed</span>
          <span>{activeCards.length - currentIndex} remaining · {dueCards.length} due today</span>
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
                    {line.startsWith("•") || line.startsWith("-") ? line.replace(/^[-•]\s*/, "• ") : `• ${line}`}
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
        <Button variant="ghost" size="icon" disabled={currentIndex === activeCards.length - 1}
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
