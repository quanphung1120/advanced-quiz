import type {
  CollectionStats,
  ReviewRating,
  ReviewStatus,
} from "@advanced-quiz/contracts";

const LEARNING_STEPS = [1, 10];
const RELEARNING_STEPS = [10];
const GRADUATING_INTERVAL = 1440;
const EASY_INTERVAL = 4 * 1440;
const MIN_EASE_FACTOR = 1.3;
const MAX_INTERVAL = 365 * 1440;
const MATURE_INTERVAL = 21 * 1440;

type ReviewRecord = typeof import("./db/schema").flashcardReview.$inferSelect;

export function calculateNextReview(
  review: ReviewRecord,
  rating: ReviewRating,
) {
  const now = new Date();
  const next = {
    easeFactor: review.easeFactor,
    interval: review.interval,
    status: review.status as ReviewStatus,
    learningStep: review.learningStep,
    reviewCount: review.reviewCount + 1,
    lapseCount: review.lapseCount,
    lastReviewedAt: now,
  };

  switch (review.status as ReviewStatus) {
    case "new":
    case "learning":
      applyLearningState(next, rating, LEARNING_STEPS);
      break;
    case "relearning":
      applyLearningState(next, rating, RELEARNING_STEPS);
      break;
    case "review":
      applyReviewState(next, rating);
      break;
  }

  const dueAt = new Date(now.getTime() + next.interval * 60_000);

  return {
    ...next,
    dueAt,
    updatedAt: now,
  };
}

function applyLearningState(
  next: {
    easeFactor: number;
    interval: number;
    status: ReviewStatus;
    learningStep: number;
    reviewCount: number;
    lapseCount: number;
    lastReviewedAt: Date;
  },
  rating: ReviewRating,
  steps: number[],
) {
  switch (rating) {
    case 0:
      next.learningStep = 0;
      next.interval = steps[0] ?? 1;
      if (next.status === "relearning") {
        next.lapseCount += 1;
      }
      break;
    case 1:
      next.interval =
        next.learningStep < steps.length
          ? steps[next.learningStep]!
          : steps[steps.length - 1]!;
      break;
    case 2:
      next.learningStep += 1;
      if (next.learningStep >= steps.length) {
        next.status = "review";
        next.interval = GRADUATING_INTERVAL;
        next.learningStep = 0;
      } else {
        next.interval = steps[next.learningStep]!;
        if (next.status === "new") {
          next.status = "learning";
        }
      }
      break;
    case 3:
      next.status = "review";
      next.interval = EASY_INTERVAL;
      next.learningStep = 0;
      break;
  }
}

function applyReviewState(
  next: {
    easeFactor: number;
    interval: number;
    status: ReviewStatus;
    learningStep: number;
    reviewCount: number;
    lapseCount: number;
    lastReviewedAt: Date;
  },
  rating: ReviewRating,
) {
  switch (rating) {
    case 0:
      next.status = "relearning";
      next.learningStep = 0;
      next.lapseCount += 1;
      next.interval = RELEARNING_STEPS[0] ?? 10;
      next.easeFactor = Math.max(MIN_EASE_FACTOR, next.easeFactor - 0.2);
      break;
    case 1:
      next.interval = Math.floor(next.interval * 1.2);
      next.easeFactor = Math.max(MIN_EASE_FACTOR, next.easeFactor - 0.15);
      break;
    case 2:
      next.interval = Math.floor(next.interval * next.easeFactor);
      break;
    case 3:
      next.interval = Math.floor(next.interval * next.easeFactor * 1.3);
      next.easeFactor += 0.15;
      break;
  }

  next.interval = Math.min(next.interval, MAX_INTERVAL);
}

export function buildCollectionStats(
  reviews: ReviewRecord[],
): CollectionStats {
  const now = Date.now();

  const stats: CollectionStats = {
    totalCards: reviews.length,
    newCards: 0,
    learningCards: 0,
    reviewCards: 0,
    dueCards: 0,
    averageEase: 0,
    totalReviews: 0,
    totalLapses: 0,
    matureCards: 0,
  };

  let totalEase = 0;
  let easeCount = 0;

  for (const review of reviews) {
    switch (review.status as ReviewStatus) {
      case "new":
        stats.newCards += 1;
        break;
      case "learning":
      case "relearning":
        stats.learningCards += 1;
        break;
      case "review":
        stats.reviewCards += 1;
        break;
    }

    if (review.dueAt.getTime() <= now) {
      stats.dueCards += 1;
    }

    if (review.easeFactor > 0) {
      totalEase += review.easeFactor;
      easeCount += 1;
    }

    stats.totalReviews += review.reviewCount;
    stats.totalLapses += review.lapseCount;

    if (review.interval >= MATURE_INTERVAL) {
      stats.matureCards += 1;
    }
  }

  if (easeCount > 0) {
    stats.averageEase = totalEase / easeCount;
  }

  return stats;
}
