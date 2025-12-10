import * as React from "react";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import {
  type FlashcardReview,
  type ReviewRating,
  type CollectionStats,
  type CardStatus,
} from "@/features/flashcards/lib/srs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Response types
interface DueCardsResponse {
  reviews: FlashcardReview[] | null;
  errorMessage?: string;
}

interface StatsResponse {
  stats: CollectionStats | null;
  errorMessage?: string;
}

interface SubmitReviewResponse {
  review: FlashcardReview | null;
  errorMessage?: string;
}

interface StartSessionResponse {
  message?: string;
  errorMessage?: string;
}

// Create fetcher with auth token
function createFetcher(getToken: () => Promise<string | null>) {
  return async <T>(url: string): Promise<T> => {
    const token = await getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  };
}

// Transform API response to match our types
function transformReviews(
  data: DueCardsResponse | null | undefined
): FlashcardReview[] {
  if (!data?.reviews) return [];
  return data.reviews.map((r) => ({
    ...r,
    status: r.status as CardStatus,
    last_reviewed_at: r.last_reviewed_at ?? undefined,
    flashcard: r.flashcard ?? undefined,
  }));
}

export function useSRSSession(collectionId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // Local UI state
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isStartingSession, setIsStartingSession] = React.useState(false);
  const [reviewedCount, setReviewedCount] = React.useState(0);

  // Create stable fetcher
  const fetcher = createFetcher(getToken);

  // SWR Keys
  const dueCardsKey =
    isLoaded && isSignedIn
      ? `${API_BASE_URL}/api/v1/collections/${collectionId}/due`
      : null;

  const statsKey =
    isLoaded && isSignedIn
      ? `${API_BASE_URL}/api/v1/collections/${collectionId}/stats`
      : null;

  // Fetch due cards with SWR
  const {
    data: dueCardsData,
    isLoading: isLoadingDue,
    mutate: mutateDueCards,
  } = useSWR<DueCardsResponse>(dueCardsKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000,
  });

  // Fetch stats with SWR
  const { data: statsData, mutate: mutateStats } = useSWR<StatsResponse>(
    statsKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
    }
  );

  // Transform data
  const reviews = transformReviews(dueCardsData);
  const stats = statsData?.stats ?? null;

  const currentReview = reviews[currentIndex];
  const hasCards = reviews.length > 0;
  const isSessionComplete = currentIndex >= reviews.length && hasCards;
  const isLoading = !isLoaded || isLoadingDue;

  // Start learning session
  const handleStartSession = async () => {
    setIsStartingSession(true);
    try {
      const token = await getToken();
      if (!token) return;

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

      const data: StartSessionResponse = await response.json();
      if (!data.errorMessage) {
        // Refresh due cards after starting session
        await mutateDueCards();
        await mutateStats();
      }
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setIsStartingSession(false);
    }
  };

  // Handle card flip
  const handleFlip = React.useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Handle rating submission
  const handleRate = React.useCallback(
    async (rating: ReviewRating) => {
      if (!currentReview?.flashcard) return;

      setIsSubmitting(true);
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/api/v1/flashcards/${currentReview.flashcard.id}/review`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rating }),
          }
        );

        if (!response.ok) {
          console.error("HTTP error:", response.status);
          return;
        }

        const data: SubmitReviewResponse = await response.json();
        if (data.review) {
          setReviewedCount((prev) => prev + 1);
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);

          await mutateStats();
        } else {
          console.error("Review submission failed:", data.errorMessage);
        }
      } catch (error) {
        console.error("Failed to submit review:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentReview?.flashcard, getToken, mutateStats]
  );

  const handleReset = React.useCallback(async () => {
    await mutateDueCards();
    await mutateStats();
    setCurrentIndex(0);
    setReviewedCount(0);
    setIsFlipped(false);
  }, [mutateDueCards, mutateStats]);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isSessionComplete || !currentReview) return;

      switch (event.key) {
        case " ":
        case "Enter":
          event.preventDefault();
          handleFlip();
          break;
        case "1":
          if (isFlipped && !isSubmitting) {
            event.preventDefault();
            handleRate(0); // Again
          }
          break;
        case "2":
          if (isFlipped && !isSubmitting) {
            event.preventDefault();
            handleRate(1); // Hard
          }
          break;
        case "3":
          if (isFlipped && !isSubmitting) {
            event.preventDefault();
            handleRate(2); // Good
          }
          break;
        case "4":
          if (isFlipped && !isSubmitting) {
            event.preventDefault();
            handleRate(3); // Easy
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isFlipped,
    isSubmitting,
    isSessionComplete,
    currentReview,
    handleFlip,
    handleRate,
  ]);

  return {
    // State
    currentIndex,
    isFlipped,
    isSubmitting,
    isStartingSession,
    reviewedCount,
    isLoading,
    hasCards,
    isSessionComplete,

    // Data
    reviews,
    currentReview,
    stats,

    // Actions
    handleStartSession,
    handleFlip,
    handleRate,
    handleReset,
  };
}
