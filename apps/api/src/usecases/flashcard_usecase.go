package usecases

import (
	"errors"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/src/domain/entities"
	"github.com/quanphung1120/advanced-quiz-be/src/domain/repositories"
)

type FlashcardUseCase struct {
	flashcardRepo     repositories.FlashcardRepository
	collectionUseCase *CollectionUseCase
}

func NewFlashcardUseCase(flashcardRepo repositories.FlashcardRepository, collectionUseCase *CollectionUseCase) *FlashcardUseCase {
	return &FlashcardUseCase{
		flashcardRepo:     flashcardRepo,
		collectionUseCase: collectionUseCase,
	}
}

func (uc *FlashcardUseCase) GetCollectionFlashcards(collectionID uuid.UUID, userID string) ([]entities.Flashcard, string, error) {
	_, role, err := uc.collectionUseCase.GetCollection(collectionID, userID)
	if err != nil {
		return nil, "", err
	}

	flashcards, err := uc.flashcardRepo.ListByCollection(collectionID)
	if err != nil {
		return nil, "", err
	}

	return flashcards, role, nil
}

func (uc *FlashcardUseCase) GetFlashcard(flashcardID uuid.UUID, userID string) (*entities.Flashcard, string, error) {
	flashcard, err := uc.flashcardRepo.GetByID(flashcardID)
	if err != nil {
		return nil, "", err
	}

	_, role, err := uc.collectionUseCase.GetCollection(flashcard.CollectionID, userID)
	if err != nil {
		return nil, "", err
	}

	return flashcard, role, nil
}

func (uc *FlashcardUseCase) CreateFlashcard(collectionID uuid.UUID, userID, question, answer, typeStr string) (*entities.Flashcard, error) {
	_, role, err := uc.collectionUseCase.GetCollection(collectionID, userID)
	if err != nil {
		return nil, err
	}

	if role == "viewer" {
		return nil, errors.New("permission denied")
	}

	if typeStr == "" {
		typeStr = "simple"
	}

	flashcard := &entities.Flashcard{
		Question:     question,
		Answer:       answer,
		Type:         typeStr,
		CollectionID: collectionID,
		CreatedBy:    userID,
	}

	err = uc.flashcardRepo.Create(flashcard)
	return flashcard, err
}

func (uc *FlashcardUseCase) UpdateFlashcard(flashcardID uuid.UUID, userID, question, answer, typeStr string) (*entities.Flashcard, error) {
	flashcard, role, err := uc.GetFlashcard(flashcardID, userID)
	if err != nil {
		return nil, err
	}

	if role == "viewer" {
		return nil, errors.New("permission denied")
	}

	if question != "" {
		flashcard.Question = question
	}
	if answer != "" {
		flashcard.Answer = answer
	}
	if typeStr != "" {
		flashcard.Type = typeStr
	}

	err = uc.flashcardRepo.Update(flashcard)
	return flashcard, err
}

func (uc *FlashcardUseCase) DeleteFlashcard(flashcardID uuid.UUID, userID string) error {
	_, role, err := uc.GetFlashcard(flashcardID, userID)
	if err != nil {
		return err
	}

	if role == "viewer" {
		return errors.New("permission denied")
	}

	return uc.flashcardRepo.Delete(flashcardID)
}
