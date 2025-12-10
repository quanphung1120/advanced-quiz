package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/ent/flashcard"
	"github.com/quanphung1120/advanced-quiz-be/ent/flashcardreview"
)

// FlashcardReviewRepositoryImpl implements FlashcardReviewRepository using Ent ORM
type FlashcardReviewRepositoryImpl struct {
	client *ent.Client
}

func NewFlashcardReviewRepository(client *ent.Client) FlashcardReviewRepository {
	return &FlashcardReviewRepositoryImpl{client: client}
}

func (r *FlashcardReviewRepositoryImpl) GetOrCreate(ctx context.Context, userID string, flashcardID uuid.UUID) (*ent.FlashcardReview, error) {
	review, err := r.client.FlashcardReview.
		Query().
		Where(
			flashcardreview.UserID(userID),
			flashcardreview.FlashcardID(flashcardID),
		).
		Only(ctx)

	if err == nil {
		return review, nil
	}

	if ent.IsNotFound(err) {
		return r.client.FlashcardReview.
			Create().
			SetUserID(userID).
			SetFlashcardID(flashcardID).
			Save(ctx)
	}

	return nil, err
}

func (r *FlashcardReviewRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*ent.FlashcardReview, error) {
	return r.client.FlashcardReview.
		Query().
		Where(flashcardreview.ID(id)).
		WithFlashcard().
		Only(ctx)
}

func (r *FlashcardReviewRepositoryImpl) GetByUserAndFlashcard(ctx context.Context, userID string, flashcardID uuid.UUID) (*ent.FlashcardReview, error) {
	return r.client.FlashcardReview.
		Query().
		Where(
			flashcardreview.UserID(userID),
			flashcardreview.FlashcardID(flashcardID),
		).
		WithFlashcard().
		Only(ctx)
}

func (r *FlashcardReviewRepositoryImpl) Update(ctx context.Context, id uuid.UUID, update FlashcardReviewUpdate) (*ent.FlashcardReview, error) {
	return r.client.FlashcardReview.
		UpdateOneID(id).
		SetEaseFactor(update.EaseFactor).
		SetInterval(update.Interval).
		SetDueAt(update.DueAt).
		SetStatus(update.Status).
		SetLearningStep(update.LearningStep).
		SetReviewCount(update.ReviewCount).
		SetLapseCount(update.LapseCount).
		SetLastReviewedAt(update.LastReviewedAt).
		Save(ctx)
}

func (r *FlashcardReviewRepositoryImpl) ListDueByCollection(ctx context.Context, userID string, collectionID uuid.UUID, limit int) ([]*ent.FlashcardReview, error) {
	query := r.client.FlashcardReview.
		Query().
		Where(
			flashcardreview.UserID(userID),
			flashcardreview.DueAtLTE(time.Now()),
			flashcardreview.HasFlashcardWith(flashcard.CollectionID(collectionID)),
		).
		WithFlashcard().
		Order(flashcardreview.ByDueAt())

	if limit > 0 {
		query = query.Limit(limit)
	}

	return query.All(ctx)
}

func (r *FlashcardReviewRepositoryImpl) ListByCollection(ctx context.Context, userID string, collectionID uuid.UUID) ([]*ent.FlashcardReview, error) {
	return r.client.FlashcardReview.
		Query().
		Where(
			flashcardreview.UserID(userID),
			flashcardreview.HasFlashcardWith(flashcard.CollectionID(collectionID)),
		).
		WithFlashcard().
		All(ctx)
}

func (r *FlashcardReviewRepositoryImpl) GetCollectionStats(ctx context.Context, userID string, collectionID uuid.UUID) (*CollectionStats, error) {
	reviews, err := r.ListByCollection(ctx, userID, collectionID)
	if err != nil {
		return nil, err
	}

	stats := &CollectionStats{
		TotalCards: len(reviews),
	}

	now := time.Now()
	var totalEase float64
	var easeCount int

	for _, review := range reviews {
		switch review.Status {
		case flashcardreview.StatusNew:
			stats.NewCards++
		case flashcardreview.StatusLearning, flashcardreview.StatusRelearning:
			stats.LearningCards++
		case flashcardreview.StatusReview:
			stats.ReviewCards++
		}

		if review.DueAt.Before(now) || review.DueAt.Equal(now) {
			stats.DueCards++
		}

		if review.EaseFactor > 0 {
			totalEase += review.EaseFactor
			easeCount++
		}

		stats.TotalReviews += review.ReviewCount
		stats.TotalLapses += review.LapseCount

		// Mature cards have interval >= 21 days (30240 minutes)
		if review.Interval >= 30240 {
			stats.MatureCards++
		}
	}

	if easeCount > 0 {
		stats.AverageEase = totalEase / float64(easeCount)
	}

	return stats, nil
}

func (r *FlashcardReviewRepositoryImpl) CreateBulkForCollection(ctx context.Context, userID string, collectionID uuid.UUID) error {
	flashcards, err := r.client.Flashcard.
		Query().
		Where(flashcard.CollectionID(collectionID)).
		All(ctx)

	if err != nil {
		return err
	}

	for _, fc := range flashcards {
		_, err := r.GetOrCreate(ctx, userID, fc.ID)
		if err != nil {
			return err
		}
	}

	return nil
}

func (r *FlashcardReviewRepositoryImpl) DeleteByCollection(ctx context.Context, userID string, collectionID uuid.UUID) (int, error) {
	deleted, err := r.client.FlashcardReview.
		Delete().
		Where(
			flashcardreview.UserID(userID),
			flashcardreview.HasFlashcardWith(flashcard.CollectionID(collectionID)),
		).
		Exec(ctx)

	if err != nil {
		return 0, err
	} 

	return deleted, nil
}
