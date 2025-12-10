package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/ent/flashcardreview"
)

// FlashcardReviewUpdate contains fields to update after a review
type FlashcardReviewUpdate struct {
	EaseFactor     float64
	Interval       int
	DueAt          time.Time
	Status         flashcardreview.Status
	LearningStep   int
	ReviewCount    int
	LapseCount     int
	LastReviewedAt time.Time
}

// CollectionStats contains learning statistics for a collection
type CollectionStats struct {
	TotalCards    int
	NewCards      int
	LearningCards int
	ReviewCards   int
	DueCards      int
	AverageEase   float64
	TotalReviews  int
	TotalLapses   int
	MatureCards   int // Cards with interval >= 21 days
}

// FlashcardReviewRepository defines the interface for flashcard review data access
type FlashcardReviewRepository interface {
	// GetOrCreate returns an existing review or creates a new one for user-flashcard pair
	GetOrCreate(ctx context.Context, userID string, flashcardID uuid.UUID) (*ent.FlashcardReview, error)

	// GetByID returns a review by its ID
	GetByID(ctx context.Context, id uuid.UUID) (*ent.FlashcardReview, error)

	// GetByUserAndFlashcard returns a review for a specific user-flashcard pair
	GetByUserAndFlashcard(ctx context.Context, userID string, flashcardID uuid.UUID) (*ent.FlashcardReview, error)

	// Update updates a review with new SRS data
	Update(ctx context.Context, id uuid.UUID, update FlashcardReviewUpdate) (*ent.FlashcardReview, error)

	// ListDueByCollection returns all reviews due for a user in a specific collection
	ListDueByCollection(ctx context.Context, userID string, collectionID uuid.UUID, limit int) ([]*ent.FlashcardReview, error)

	// ListByCollection returns all reviews for a user in a specific collection
	ListByCollection(ctx context.Context, userID string, collectionID uuid.UUID) ([]*ent.FlashcardReview, error)

	// GetCollectionStats returns learning statistics for a collection
	GetCollectionStats(ctx context.Context, userID string, collectionID uuid.UUID) (*CollectionStats, error)

	// CreateBulkForCollection creates review entries for all flashcards in a collection for a user
	CreateBulkForCollection(ctx context.Context, userID string, collectionID uuid.UUID) error

	// DeleteByCollection deletes all review entries for a user in a specific collection
	DeleteByCollection(ctx context.Context, userID string, collectionID uuid.UUID) (int, error)
}
