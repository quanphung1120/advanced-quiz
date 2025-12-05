package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
)

type FlashcardRepository interface {
	Create(ctx context.Context, question, answer, flashcardType string, collectionID uuid.UUID, createdBy string) (*ent.Flashcard, error)
	GetByID(ctx context.Context, id uuid.UUID) (*ent.Flashcard, error)
	Update(ctx context.Context, id uuid.UUID, question, answer, flashcardType string) (*ent.Flashcard, error)
	Delete(ctx context.Context, id uuid.UUID) error
	ListByCollection(ctx context.Context, collectionID uuid.UUID) ([]*ent.Flashcard, error)
}
