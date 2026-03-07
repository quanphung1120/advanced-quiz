import { api } from "@/lib/api-client";
import type { Flashcard } from "@/features/flashcards/api/flashcards-api";

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

export const reviewsApi = {
  startSession: async (collectionId: string) => {
    const res = await api.post<{ message: string }>(
      `/api/v1/collections/${collectionId}/start-session`,
    );
    return res.data;
  },
  getDueCards: async (collectionId: string, limit?: number) => {
    const res = await api.get<{ reviews: ReviewProgress[] }>(
      `/api/v1/collections/${collectionId}/due`,
      {
        params: limit ? { limit } : undefined,
      },
    );
    return res.data.reviews;
  },
  getAllReviews: async (collectionId: string) => {
    const res = await api.get<{ reviews: ReviewProgress[] }>(
      `/api/v1/collections/${collectionId}/reviews`,
    );
    return res.data.reviews;
  },
  getStats: async (collectionId: string) => {
    const res = await api.get<{ stats: CollectionStats }>(
      `/api/v1/collections/${collectionId}/stats`,
    );
    return res.data.stats;
  },
  submitReview: async (flashcardId: string, rating: ReviewRating) => {
    const res = await api.post<{ review: ReviewProgress }>(
      `/api/v1/flashcards/${flashcardId}/review`,
      { rating },
    );
    return res.data.review;
  },
  clearProgress: async (collectionId: string) => {
    const res = await api.delete<{ deleted: number; message: string }>(
      `/api/v1/collections/${collectionId}/progress`,
    );
    return res.data;
  },
};
