package service

import (
	"context"
	"math"
	"time"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/ent/flashcardreview"
	"github.com/quanphung1120/advanced-quiz-be/internal/repository"
)

// Learning steps in minutes (like Anki's default)
var learningSteps = []int{1, 10}   // 1 min, 10 min
var relearningSteps = []int{10}    // 10 min for relearning
const graduatingInterval = 1440    // 1 day in minutes (graduating from learning)
const easyInterval = 4 * 1440      // 4 days in minutes (easy bonus)
const minEaseFactor = 1.3          // Minimum ease factor (like Anki)
const maxInterval = 365 * 1440     // Max interval: 1 year in minutes

type flashcardReviewServiceImpl struct {
	reviewRepo        repository.FlashcardReviewRepository
	flashcardRepo     repository.FlashcardRepository
	collectionService CollectionService
}

// StartLearningSession initializes review entries for all flashcards in a collection
func (s *flashcardReviewServiceImpl) StartLearningSession(ctx context.Context, collectionID uuid.UUID, userID string) error {
	_, _, err := s.collectionService.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return err
	}

	return s.reviewRepo.CreateBulkForCollection(ctx, userID, collectionID)
}

// GetDueCards returns cards that are due for review in a collection
func (s *flashcardReviewServiceImpl) GetDueCards(ctx context.Context, collectionID uuid.UUID, userID string, limit int) ([]*ent.FlashcardReview, error) {
	_, _, err := s.collectionService.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return nil, err
	}

	return s.reviewRepo.ListDueByCollection(ctx, userID, collectionID, limit)
}

// GetCollectionStats returns learning statistics for a collection
func (s *flashcardReviewServiceImpl) GetCollectionStats(ctx context.Context, collectionID uuid.UUID, userID string) (*repository.CollectionStats, error) {
	_, _, err := s.collectionService.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return nil, err
	}

	return s.reviewRepo.GetCollectionStats(ctx, userID, collectionID)
}

// SubmitReview processes a review and updates the card's SRS data based on SM-2 algorithm
func (s *flashcardReviewServiceImpl) SubmitReview(ctx context.Context, flashcardID uuid.UUID, userID string, rating ReviewRating) (*ent.FlashcardReview, error) {
	fc, err := s.flashcardRepo.GetByID(ctx, flashcardID)
	if err != nil {
		return nil, err
	}

	_, _, err = s.collectionService.GetCollection(ctx, fc.CollectionID, userID)
	if err != nil {
		return nil, err
	}

	review, err := s.reviewRepo.GetOrCreate(ctx, userID, flashcardID)
	if err != nil {
		return nil, err
	}

	update := s.calculateNextReview(review, rating)

	return s.reviewRepo.Update(ctx, review.ID, update)
}

// calculateNextReview implements the SM-2 algorithm to determine the next review
func (s *flashcardReviewServiceImpl) calculateNextReview(review *ent.FlashcardReview, rating ReviewRating) repository.FlashcardReviewUpdate {
	now := time.Now()

	update := repository.FlashcardReviewUpdate{
		EaseFactor:     review.EaseFactor,
		Interval:       review.Interval,
		Status:         review.Status,
		LearningStep:   review.LearningStep,
		ReviewCount:    review.ReviewCount + 1,
		LapseCount:     review.LapseCount,
		LastReviewedAt: now,
	}

	switch review.Status {
	case flashcardreview.StatusNew, flashcardreview.StatusLearning:
		s.processLearning(&update, rating, learningSteps)
	case flashcardreview.StatusRelearning:
		s.processLearning(&update, rating, relearningSteps)
	case flashcardreview.StatusReview:
		s.processReview(&update, rating)
	}

	update.DueAt = now.Add(time.Duration(update.Interval) * time.Minute)

	return update
}

// processLearning handles cards in the learning/relearning phase
func (s *flashcardReviewServiceImpl) processLearning(update *repository.FlashcardReviewUpdate, rating ReviewRating, steps []int) {
	switch rating {
	case RatingAgain:
		// Reset to first learning step
		update.LearningStep = 0
		if len(steps) > 0 {
			update.Interval = steps[0]
		} else {
			update.Interval = 1
		}
		if update.Status == flashcardreview.StatusRelearning {
			update.LapseCount++
		}

	case RatingHard:
		// Repeat current step
		if update.LearningStep < len(steps) {
			update.Interval = steps[update.LearningStep]
		} else {
			update.Interval = steps[len(steps)-1]
		}

	case RatingGood:
		// Move to next step or graduate
		update.LearningStep++
		if update.LearningStep >= len(steps) {
			// Graduate to review
			update.Status = flashcardreview.StatusReview
			update.Interval = graduatingInterval
			update.LearningStep = 0
		} else {
			update.Interval = steps[update.LearningStep]
			if update.Status == flashcardreview.StatusNew {
				update.Status = flashcardreview.StatusLearning
			}
		}

	case RatingEasy:
		// Graduate immediately with easy bonus
		update.Status = flashcardreview.StatusReview
		update.Interval = easyInterval
		update.LearningStep = 0
	}
}

// processReview handles cards in the review phase (SM-2 algorithm)
func (s *flashcardReviewServiceImpl) processReview(update *repository.FlashcardReviewUpdate, rating ReviewRating) {
	switch rating {
	case RatingAgain:
		// Card was forgotten - move to relearning
		update.Status = flashcardreview.StatusRelearning
		update.LearningStep = 0
		update.LapseCount++
		// Reset interval to first relearning step
		if len(relearningSteps) > 0 {
			update.Interval = relearningSteps[0]
		} else {
			update.Interval = 10
		}
		// Decrease ease factor
		update.EaseFactor = math.Max(minEaseFactor, update.EaseFactor-0.2)

	case RatingHard:
		// Recalled with difficulty
		update.Interval = int(float64(update.Interval) * 1.2)
		update.EaseFactor = math.Max(minEaseFactor, update.EaseFactor-0.15)

	case RatingGood:
		// Normal recall - multiply by ease factor
		update.Interval = int(float64(update.Interval) * update.EaseFactor)

	case RatingEasy:
		// Easy recall - multiply by ease factor and add bonus, increase ease
		update.Interval = int(float64(update.Interval) * update.EaseFactor * 1.3)
		update.EaseFactor = update.EaseFactor + 0.15
	}

	// Cap interval at maximum
	if update.Interval > maxInterval {
		update.Interval = maxInterval
	}
}

// GetReviewByFlashcard returns the review for a specific flashcard for the current user
func (s *flashcardReviewServiceImpl) GetReviewByFlashcard(ctx context.Context, flashcardID uuid.UUID, userID string) (*ent.FlashcardReview, error) {
	fc, err := s.flashcardRepo.GetByID(ctx, flashcardID)
	if err != nil {
		return nil, err
	}

	_, _, err = s.collectionService.GetCollection(ctx, fc.CollectionID, userID)
	if err != nil {
		return nil, err
	}

	return s.reviewRepo.GetByUserAndFlashcard(ctx, userID, flashcardID)
}

// GetAllReviewsForCollection returns all reviews for a user in a collection
func (s *flashcardReviewServiceImpl) GetAllReviewsForCollection(ctx context.Context, collectionID uuid.UUID, userID string) ([]*ent.FlashcardReview, error) {
	_, _, err := s.collectionService.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return nil, err
	}

	return s.reviewRepo.ListByCollection(ctx, userID, collectionID)
}

// ClearProgress deletes all review entries for a user in a collection
func (s *flashcardReviewServiceImpl) ClearProgress(ctx context.Context, collectionID uuid.UUID, userID string) (int, error) {
	_, _, err := s.collectionService.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return 0, err
	}

	return s.reviewRepo.DeleteByCollection(ctx, userID, collectionID)
}
