export type ReviewRating = 0 | 1 | 2 | 3;

export const RATING = {
  AGAIN: 0 as const,
  HARD: 1 as const,
  GOOD: 2 as const,
  EASY: 3 as const,
};

export const RATING_LABELS: Record<ReviewRating, string> = {
  0: "Again",
  1: "Hard",
  2: "Good",
  3: "Easy",
};

export const RATING_DESCRIPTIONS: Record<ReviewRating, string> = {
  0: "I didn't remember",
  1: "It was difficult",
  2: "I remembered",
  3: "It was easy",
};

export const RATING_COLORS: Record<ReviewRating, string> = {
  0: "destructive", // Red - failure
  1: "secondary", // Muted - hard
  2: "default", // Primary - good
  3: "outline", // Success-ish - easy
};

// Card status matching backend enum
export type CardStatus = "new" | "learning" | "review" | "relearning";

export const STATUS_LABELS: Record<CardStatus, string> = {
  new: "New",
  learning: "Learning",
  review: "Review",
  relearning: "Relearning",
};

export const STATUS_COLORS: Record<CardStatus, string> = {
  new: "bg-blue-500/10 text-blue-500",
  learning: "bg-orange-500/10 text-orange-500",
  review: "bg-green-500/10 text-green-500",
  relearning: "bg-red-500/10 text-red-500",
};

// Flashcard review data from API
export interface FlashcardReview {
  id: string;
  user_id: string;
  flashcard_id: string;
  ease_factor: number;
  interval: number; // in minutes
  due_at: string;
  status: CardStatus;
  learning_step: number;
  review_count: number;
  lapse_count: number;
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
  flashcard?: {
    id: string;
    question: string;
    answer: string;
    type: string;
  };
}

// Collection learning statistics
export interface CollectionStats {
  total_cards: number;
  new_cards: number;
  learning_cards: number;
  review_cards: number;
  due_cards: number;
  average_ease: number;
  total_reviews: number;
  total_lapses: number;
  mature_cards: number;
}

/**
 * Formats an interval (in minutes) to a human-readable string
 */
export function formatInterval(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  if (minutes < 1440) {
    // Less than a day
    const hours = Math.round(minutes / 60);
    return `${hours}h`;
  }
  const days = Math.round(minutes / 1440);
  if (days < 30) {
    return `${days}d`;
  }
  const months = Math.round(days / 30);
  if (months < 12) {
    return `${months}mo`;
  }
  const years = (days / 365).toFixed(1);
  return `${years}y`;
}

/**
 * Estimates the next interval based on rating (for showing in UI before submission)
 * Note: This is a simplified estimation - actual calculation happens on the server
 */
export function estimateNextInterval(
  currentInterval: number,
  easeFactor: number,
  status: CardStatus,
  rating: ReviewRating
): number {
  // Learning steps in minutes
  const learningSteps = [1, 10];
  const graduatingInterval = 1440; // 1 day
  const easyInterval = 4 * 1440; // 4 days

  if (status === "new" || status === "learning" || status === "relearning") {
    switch (rating) {
      case RATING.AGAIN:
        return learningSteps[0] ?? 1;
      case RATING.HARD:
        return learningSteps[0] ?? 1;
      case RATING.GOOD:
        return graduatingInterval;
      case RATING.EASY:
        return easyInterval;
    }
  }

  // Review status
  switch (rating) {
    case RATING.AGAIN:
      return 10; // Goes to relearning
    case RATING.HARD:
      return Math.round(currentInterval * 1.2);
    case RATING.GOOD:
      return Math.round(currentInterval * easeFactor);
    case RATING.EASY:
      return Math.round(currentInterval * easeFactor * 1.3);
  }
}

/**
 * Checks if a card is due for review
 */
export function isDue(dueAt: string): boolean {
  return new Date(dueAt) <= new Date();
}

/**
 * Gets a human-readable "time until due" string
 */
export function getTimeUntilDue(dueAt: string): string {
  const due = new Date(dueAt);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Now";
  }

  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 60) {
    return `${diffMins}m`;
  }

  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d`;
}
