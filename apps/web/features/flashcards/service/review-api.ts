import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import type {
  CardStatus,
  CollectionStats,
  FlashcardReview,
  ReviewRating,
} from "../lib/srs";

// ============================================================
// Zod Schemas
// ============================================================

const FlashcardInReviewSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  type: z.string(),
});

const FlashcardReviewSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  flashcard_id: z.string(),
  ease_factor: z.number(),
  interval: z.number(),
  due_at: z.string(),
  status: z.enum(["new", "learning", "review", "relearning"]),
  learning_step: z.number(),
  review_count: z.number(),
  lapse_count: z.number(),
  last_reviewed_at: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  flashcard: FlashcardInReviewSchema.optional().nullable(),
});

const CollectionStatsSchema = z.object({
  total_cards: z.number(),
  new_cards: z.number(),
  learning_cards: z.number(),
  review_cards: z.number(),
  due_cards: z.number(),
  average_ease: z.number(),
  total_reviews: z.number(),
  total_lapses: z.number(),
  mature_cards: z.number(),
});

const GetDueCardsResponseSchema = z.object({
  reviews: z.array(FlashcardReviewSchema).nullable(),
  errorMessage: z.string().optional(),
});

const GetStatsResponseSchema = z.object({
  stats: CollectionStatsSchema.nullable(),
  errorMessage: z.string().optional(),
});

const SubmitReviewResponseSchema = z.object({
  review: FlashcardReviewSchema.nullable(),
  errorMessage: z.string().optional(),
});

const StartSessionResponseSchema = z.object({
  message: z.string().optional(),
  errorMessage: z.string().optional(),
});

const GetAllReviewsResponseSchema = z.object({
  reviews: z.array(FlashcardReviewSchema).nullable(),
  errorMessage: z.string().optional(),
});

const ClearProgressResponseSchema = z.object({
  deleted: z.number(),
  message: z.string().optional(),
  errorMessage: z.string().optional(),
});

// ============================================================
// API Configuration
// ============================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ============================================================
// API Functions
// ============================================================

/**
 * Start a learning session for a collection.
 * This initializes review entries for all flashcards in the collection.
 */
export async function startLearningSession(
  collectionId: string
): Promise<{ success: boolean; error?: string }> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return { success: false, error: "Not authenticated" };
  }

  const token = await getToken();
  if (!token) {
    return { success: false, error: "No token available" };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/collections/${collectionId}/start-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const json = await response.json();

    const parsed = StartSessionResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error(
        "Failed to parse startLearningSession response schema:",
        parsed.error
      );
      return { success: false, error: "Failed to parse response schema" };
    }

    if (parsed.data.errorMessage) {
      return { success: false, error: parsed.data.errorMessage };
    }

    return { success: true };
  } catch (error) {
    console.error("startLearningSession error:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Get cards due for review in a collection, with embedded flashcard data.
 */
export async function getDueCards(
  collectionId: string,
  limit?: number
): Promise<{ reviews: FlashcardReview[]; error?: string }> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return { reviews: [], error: "Not authenticated" };
  }

  const token = await getToken();
  if (!token) {
    return { reviews: [], error: "No token available" };
  }

  try {
    const url = new URL(
      `${API_BASE_URL}/api/v1/collections/${collectionId}/due`
    );
    if (limit) {
      url.searchParams.set("limit", String(limit));
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();

    const parsed = GetDueCardsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse getDueCards response:", parsed.error);
      return { reviews: [], error: "Failed to parse response" };
    }

    if (parsed.data.errorMessage) {
      return { reviews: [], error: parsed.data.errorMessage };
    }

    // Transform the data to match our types
    const reviews: FlashcardReview[] = (parsed.data.reviews || []).map((r) => ({
      ...r,
      status: r.status as CardStatus,
      last_reviewed_at: r.last_reviewed_at ?? undefined,
      flashcard: r.flashcard ?? undefined,
    }));

    return { reviews };
  } catch (error) {
    console.error("getDueCards error:", error);
    return { reviews: [], error: "Network error" };
  }
}

/**
 * Get all reviews for a collection (including not-due cards).
 */
export async function getAllReviews(
  collectionId: string
): Promise<{ reviews: FlashcardReview[]; error?: string }> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return { reviews: [], error: "Not authenticated" };
  }

  const token = await getToken();
  if (!token) {
    return { reviews: [], error: "No token available" };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/collections/${collectionId}/reviews`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const json = await response.json();
    const parsed = GetAllReviewsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse getAllReviews response:", parsed.error);
      return { reviews: [], error: "Failed to parse response" };
    }

    if (parsed.data.errorMessage) {
      return { reviews: [], error: parsed.data.errorMessage };
    }

    const reviews: FlashcardReview[] = (parsed.data.reviews || []).map((r) => ({
      ...r,
      status: r.status as CardStatus,
      last_reviewed_at: r.last_reviewed_at ?? undefined,
      flashcard: r.flashcard ?? undefined,
    }));

    return { reviews };
  } catch (error) {
    console.error("getAllReviews error:", error);
    return { reviews: [], error: "Network error" };
  }
}

/**
 * Get learning statistics for a collection.
 */
export async function getCollectionStats(
  collectionId: string
): Promise<{ stats: CollectionStats | null; error?: string }> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return { stats: null, error: "Not authenticated" };
  }

  const token = await getToken();
  if (!token) {
    return { stats: null, error: "No token available" };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/collections/${collectionId}/stats`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const json = await response.json();

    const parsed = GetStatsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error(
        "Failed to parse getCollectionStats response:",
        parsed.error
      );
      return { stats: null, error: "Failed to parse response" };
    }

    if (parsed.data.errorMessage) {
      return { stats: null, error: parsed.data.errorMessage };
    }

    return { stats: parsed.data.stats };
  } catch (error) {
    console.error("getCollectionStats error:", error);
    return { stats: null, error: "Network error" };
  }
}

/**
 * Submit a review for a flashcard with a rating (0-3).
 */
export async function submitReview(
  flashcardId: string,
  rating: ReviewRating
): Promise<{ review: FlashcardReview | null; error?: string }> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return { review: null, error: "Not authenticated" };
  }

  const token = await getToken();
  if (!token) {
    return { review: null, error: "No token available" };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/flashcards/${flashcardId}/review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      }
    );

    const json = await response.json();
    const parsed = SubmitReviewResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse submitReview response:", parsed.error);
      return { review: null, error: "Failed to parse response" };
    }

    if (parsed.data.errorMessage) {
      return { review: null, error: parsed.data.errorMessage };
    }

    if (!parsed.data.review) {
      return { review: null };
    }

    const review: FlashcardReview = {
      ...parsed.data.review,
      status: parsed.data.review.status as CardStatus,
      last_reviewed_at: parsed.data.review.last_reviewed_at ?? undefined,
      flashcard: parsed.data.review.flashcard ?? undefined,
    };

    return { review };
  } catch (error) {
    console.error("submitReview error:", error);
    return { review: null, error: "Network error" };
  }
}

/**
 * Clear all learning progress for a collection.
 * This deletes all review entries for the current user in the collection.
 */
export async function clearProgress(
  collectionId: string
): Promise<{ success: boolean; deleted?: number; error?: string }> {
  const { getToken, isAuthenticated } = await auth();

  if (!getToken || !isAuthenticated) {
    return { success: false, error: "Not authenticated" };
  }

  const token = await getToken();
  if (!token) {
    return { success: false, error: "No token available" };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/collections/${collectionId}/progress`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const json = await response.json();
    const parsed = ClearProgressResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Failed to parse clearProgress response:", parsed.error);
      return { success: false, error: "Failed to parse response" };
    }

    if (parsed.data.errorMessage) {
      return { success: false, error: parsed.data.errorMessage };
    }

    return { success: true, deleted: parsed.data.deleted };
  } catch (error) {
    console.error("clearProgress error:", error);
    return { success: false, error: "Network error" };
  }
}
