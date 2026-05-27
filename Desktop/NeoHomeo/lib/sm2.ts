export type SM2Grade = 0 | 1 | 2 | 3 | 4 | 5;

export interface SM2Card {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
}

export function sm2(card: SM2Card, grade: SM2Grade): SM2Card {
  let { easeFactor, interval, repetitions } = card;

  if (grade >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: nextDate.toISOString().split("T")[0],
  };
}

export function isDue(nextReviewDate: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return nextReviewDate <= today;
}

export function defaultCard(): SM2Card {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date().toISOString().split("T")[0],
  };
}
