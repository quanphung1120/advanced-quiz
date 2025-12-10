package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/ent/flashcard"
)

// FlashcardRepositoryImpl implements FlashcardRepository using Ent ORM
type FlashcardRepositoryImpl struct {
	client *ent.Client
}

func NewFlashcardRepository(client *ent.Client) FlashcardRepository {
	return &FlashcardRepositoryImpl{client: client}
}

func (r *FlashcardRepositoryImpl) Create(ctx context.Context, question, answer, flashcardType string, collectionID uuid.UUID, createdBy string) (*ent.Flashcard, error) {
	return r.client.Flashcard.
		Create().
		SetQuestion(question).
		SetAnswer(answer).
		SetType(flashcardType).
		SetCollectionID(collectionID).
		SetCreatedBy(createdBy).
		Save(ctx)
}

func (r *FlashcardRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*ent.Flashcard, error) {
	return r.client.Flashcard.
		Query().
		Where(flashcard.ID(id)).
		Only(ctx)
}

func (r *FlashcardRepositoryImpl) Update(ctx context.Context, id uuid.UUID, question, answer, flashcardType string) (*ent.Flashcard, error) {
	return r.client.Flashcard.
		UpdateOneID(id).
		SetQuestion(question).
		SetAnswer(answer).
		SetType(flashcardType).
		Save(ctx)
}

func (r *FlashcardRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.client.Flashcard.
		DeleteOneID(id).
		Exec(ctx)
}

func (r *FlashcardRepositoryImpl) ListByCollection(ctx context.Context, collectionID uuid.UUID) ([]*ent.Flashcard, error) {
	return r.client.Flashcard.
		Query().
		Where(flashcard.CollectionID(collectionID)).
		All(ctx)
}
