package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/internal/repository"
)

type flashcardServiceImpl struct {
	flashcardRepo     repository.FlashcardRepository
	collectionService CollectionService
}

func (s *flashcardServiceImpl) GetCollectionFlashcards(ctx context.Context, collectionID uuid.UUID, userID string) ([]*ent.Flashcard, string, error) {
	_, role, err := s.collectionService.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return nil, "", err
	}

	flashcards, err := s.flashcardRepo.ListByCollection(ctx, collectionID)
	if err != nil {
		return nil, "", err
	}

	return flashcards, role, nil
}

func (s *flashcardServiceImpl) GetFlashcard(ctx context.Context, flashcardID uuid.UUID, userID string) (*ent.Flashcard, string, error) {
	flashcard, err := s.flashcardRepo.GetByID(ctx, flashcardID)
	if err != nil {
		return nil, "", err
	}

	_, role, err := s.collectionService.GetCollection(ctx, flashcard.CollectionID, userID)
	if err != nil {
		return nil, "", err
	}

	return flashcard, role, nil
}

func (s *flashcardServiceImpl) CreateFlashcard(ctx context.Context, collectionID uuid.UUID, userID, question, answer, typeStr string) (*ent.Flashcard, error) {
	_, role, err := s.collectionService.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return nil, err
	}

	if role == "viewer" {
		return nil, errors.New("permission denied")
	}

	if typeStr == "" {
		typeStr = "simple"
	}

	return s.flashcardRepo.Create(ctx, question, answer, typeStr, collectionID, userID)
}

func (s *flashcardServiceImpl) UpdateFlashcard(ctx context.Context, flashcardID uuid.UUID, userID, question, answer, typeStr string) (*ent.Flashcard, error) {
	flashcard, role, err := s.GetFlashcard(ctx, flashcardID, userID)
	if err != nil {
		return nil, err
	}

	if role == "viewer" {
		return nil, errors.New("permission denied")
	}

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

	return s.flashcardRepo.Update(ctx, flashcardID, newQuestion, newAnswer, newType)
}

func (s *flashcardServiceImpl) DeleteFlashcard(ctx context.Context, flashcardID uuid.UUID, userID string) error {
	_, role, err := s.GetFlashcard(ctx, flashcardID, userID)
	if err != nil {
		return err
	}

	if role == "viewer" {
		return errors.New("permission denied")
	}

	return s.flashcardRepo.Delete(ctx, flashcardID)
}
