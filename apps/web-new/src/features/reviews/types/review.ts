import type { Flashcard } from "@/features/flashcards/types/flashcard";

export type ReviewStatus = "new" | "learning" | "review" | "relearning";
export type ReviewRating = 0 | 1 | 2 | 3;

export interface ReviewProgress {
  id: string;
  userId: string;
  flashcardId: string;
  easeFactor: number;
  interval: number;
  dueAt: string;
  status: ReviewStatus;
  learningStep: number;
  reviewCount: number;
  lapseCount: number;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  flashcard?: Flashcard;
}

export interface CollectionStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  dueCards: number;
  averageEase: number;
  totalReviews: number;
  totalLapses: number;
  matureCards: number;
}
