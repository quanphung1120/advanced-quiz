package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/internal/repository"
)

// FlashcardService defines the interface for flashcard business logic
type FlashcardService interface {
	GetCollectionFlashcards(ctx context.Context, collectionID uuid.UUID, userID string) ([]*ent.Flashcard, string, error)
	GetFlashcard(ctx context.Context, flashcardID uuid.UUID, userID string) (*ent.Flashcard, string, error)
	CreateFlashcard(ctx context.Context, collectionID uuid.UUID, userID, question, answer, typeStr string) (*ent.Flashcard, error)
	UpdateFlashcard(ctx context.Context, flashcardID uuid.UUID, userID, question, answer, typeStr string) (*ent.Flashcard, error)
	DeleteFlashcard(ctx context.Context, flashcardID uuid.UUID, userID string) error
}

// NewFlashcardService creates a new FlashcardService instance
func NewFlashcardService(flashcardRepo repository.FlashcardRepository, collectionService CollectionService) FlashcardService {
	return &flashcardServiceImpl{
		flashcardRepo:     flashcardRepo,
		collectionService: collectionService,
	}
}
