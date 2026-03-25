import { api } from "@/config/api-client";
import type {
  CollectionStats,
  ReviewProgress,
  ReviewRating,
} from "../types/review";

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
