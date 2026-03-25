import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "../api/reviews-api";
import type { ReviewRating } from "../types/review";

export function useSrsSession(collectionId: string) {
  const queryClient = useQueryClient();

  const dueCardsQuery = useQuery({
    queryKey: ["reviews", collectionId, "due"],
    queryFn: () => reviewsApi.getDueCards(collectionId),
    enabled: Boolean(collectionId),
  });

  const allReviewsQuery = useQuery({
    queryKey: ["reviews", collectionId, "all"],
    queryFn: () => reviewsApi.getAllReviews(collectionId),
    enabled: Boolean(collectionId),
  });

  const statsQuery = useQuery({
    queryKey: ["reviews", collectionId, "stats"],
    queryFn: () => reviewsApi.getStats(collectionId),
    enabled: Boolean(collectionId),
  });

  const invalidateReviews = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["reviews", collectionId, "due"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["reviews", collectionId, "all"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["reviews", collectionId, "stats"],
      }),
    ]);
  };

  const startSession = useMutation({
    mutationFn: () => reviewsApi.startSession(collectionId),
    onSuccess: invalidateReviews,
  });

  const submitReview = useMutation({
    mutationFn: ({
      flashcardId,
      rating,
    }: {
      flashcardId: string;
      rating: ReviewRating;
    }) => reviewsApi.submitReview(flashcardId, rating),
    onSuccess: invalidateReviews,
  });

  const clearProgress = useMutation({
    mutationFn: () => reviewsApi.clearProgress(collectionId),
    onSuccess: invalidateReviews,
  });

  return {
    dueCardsQuery,
    allReviewsQuery,
    statsQuery,
    startSession,
    submitReview,
    clearProgress,
  };
}
