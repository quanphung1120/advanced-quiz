package usecase

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/internal/usecase/repository"
)

type FlashcardUseCase struct {
	flashcardRepo     repository.FlashcardRepository
	collectionUseCase *CollectionUseCase
}

func NewFlashcardUseCase(flashcardRepo repository.FlashcardRepository, collectionUseCase *CollectionUseCase) *FlashcardUseCase {
	return &FlashcardUseCase{
		flashcardRepo:     flashcardRepo,
		collectionUseCase: collectionUseCase,
	}
}

func (uc *FlashcardUseCase) GetCollectionFlashcards(ctx context.Context, collectionID uuid.UUID, userID string) ([]*ent.Flashcard, string, error) {
	_, role, err := uc.collectionUseCase.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return nil, "", err
	}

	flashcards, err := uc.flashcardRepo.ListByCollection(ctx, collectionID)
	if err != nil {
		return nil, "", err
	}

	return flashcards, role, nil
}

func (uc *FlashcardUseCase) GetFlashcard(ctx context.Context, flashcardID uuid.UUID, userID string) (*ent.Flashcard, string, error) {
	flashcard, err := uc.flashcardRepo.GetByID(ctx, flashcardID)
	if err != nil {
		return nil, "", err
	}

	_, role, err := uc.collectionUseCase.GetCollection(ctx, flashcard.CollectionID, userID)
	if err != nil {
		return nil, "", err
	}

	return flashcard, role, nil
}

func (uc *FlashcardUseCase) CreateFlashcard(ctx context.Context, collectionID uuid.UUID, userID, question, answer, typeStr string) (*ent.Flashcard, error) {
	_, role, err := uc.collectionUseCase.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return nil, err
	}

	if role == "viewer" {
		return nil, errors.New("permission denied")
	}

	if typeStr == "" {
		typeStr = "simple"
	}

	return uc.flashcardRepo.Create(ctx, question, answer, typeStr, collectionID, userID)
}

func (uc *FlashcardUseCase) UpdateFlashcard(ctx context.Context, flashcardID uuid.UUID, userID, question, answer, typeStr string) (*ent.Flashcard, error) {
	flashcard, role, err := uc.GetFlashcard(ctx, flashcardID, userID)
	if err != nil {
		return nil, err
	}

	if role == "viewer" {
		return nil, errors.New("permission denied")
	}

	// Use existing values if not provided
	newQuestion := flashcard.Question
	if question != "" {
		newQuestion = question
	}
	newAnswer := flashcard.Answer
	if answer != "" {
		newAnswer = answer
	}
	newType := flashcard.Type
	if typeStr != "" {
		newType = typeStr
	}

	return uc.flashcardRepo.Update(ctx, flashcardID, newQuestion, newAnswer, newType)
}

func (uc *FlashcardUseCase) DeleteFlashcard(ctx context.Context, flashcardID uuid.UUID, userID string) error {
	_, role, err := uc.GetFlashcard(ctx, flashcardID, userID)
	if err != nil {
		return err
	}

	if role == "viewer" {
		return errors.New("permission denied")
	}

	return uc.flashcardRepo.Delete(ctx, flashcardID)
}
