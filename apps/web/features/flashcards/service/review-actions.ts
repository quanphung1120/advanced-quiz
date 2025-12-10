"use server";

import type {
  ReviewRating,
  FlashcardReview,
  CollectionStats,
} from "../lib/srs";
import {
  startLearningSession as apiStartLearningSession,
  getDueCards as apiGetDueCards,
  getAllReviews as apiGetAllReviews,
  getCollectionStats as apiGetCollectionStats,
  submitReview as apiSubmitReview,
  clearProgress as apiClearProgress,
} from "./review-api";

/**
 * Server action to start a learning session
 */
export async function startLearningSessionAction(
  collectionId: string
): Promise<{ success: boolean; error?: string }> {
  return apiStartLearningSession(collectionId);
}

/**
 * Server action to get due cards
 */
export async function getDueCardsAction(
  collectionId: string,
  limit?: number
): Promise<{ reviews: FlashcardReview[]; error?: string }> {
  return apiGetDueCards(collectionId, limit);
}

/**
 * Server action to get all reviews for a collection
 */
export async function getAllReviewsAction(
  collectionId: string
): Promise<{ reviews: FlashcardReview[]; error?: string }> {
  return apiGetAllReviews(collectionId);
}

/**
 * Server action to get collection stats
 */
export async function getCollectionStatsAction(
  collectionId: string
): Promise<{ stats: CollectionStats | null; error?: string }> {
  return apiGetCollectionStats(collectionId);
}

/**
 * Server action to submit a review
 */
export async function submitReviewAction(
  collectionId: string,
  flashcardId: string,
  rating: ReviewRating
): Promise<{ review: FlashcardReview | null; error?: string }> {
  return apiSubmitReview(flashcardId, rating);
}

/**
 * Server action to clear all learning progress for a collection
 */
export async function clearProgressAction(
  collectionId: string
): Promise<{ success: boolean; deleted?: number; error?: string }> {
  return apiClearProgress(collectionId);
}
