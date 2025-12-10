package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/internal/repository"
)

// ReviewRating represents the user's rating of their recall quality (Anki-style)
type ReviewRating int

const (
	RatingAgain ReviewRating = 0 // Complete failure to recall
	RatingHard  ReviewRating = 1 // Recalled with serious difficulty
	RatingGood  ReviewRating = 2 // Recalled with some difficulty
	RatingEasy  ReviewRating = 3 // Perfect recall
)

// FlashcardReviewService defines the interface for flashcard review business logic
type FlashcardReviewService interface {
	StartLearningSession(ctx context.Context, collectionID uuid.UUID, userID string) error
	GetDueCards(ctx context.Context, collectionID uuid.UUID, userID string, limit int) ([]*ent.FlashcardReview, error)
	GetCollectionStats(ctx context.Context, collectionID uuid.UUID, userID string) (*repository.CollectionStats, error)
	SubmitReview(ctx context.Context, flashcardID uuid.UUID, userID string, rating ReviewRating) (*ent.FlashcardReview, error)
	GetReviewByFlashcard(ctx context.Context, flashcardID uuid.UUID, userID string) (*ent.FlashcardReview, error)
	GetAllReviewsForCollection(ctx context.Context, collectionID uuid.UUID, userID string) ([]*ent.FlashcardReview, error)
	ClearProgress(ctx context.Context, collectionID uuid.UUID, userID string) (int, error)
}

// ValidateRating checks if the rating is valid
func ValidateRating(rating int) (ReviewRating, error) {
	if rating < 0 || rating > 3 {
		return 0, errors.New("rating must be between 0 and 3")
	}
	return ReviewRating(rating), nil
}

// NewFlashcardReviewService creates a new FlashcardReviewService instance
func NewFlashcardReviewService(
	reviewRepo repository.FlashcardReviewRepository,
	flashcardRepo repository.FlashcardRepository,
	collectionService CollectionService,
) FlashcardReviewService {
	return &flashcardReviewServiceImpl{
		reviewRepo:        reviewRepo,
		flashcardRepo:     flashcardRepo,
		collectionService: collectionService,
	}
}
