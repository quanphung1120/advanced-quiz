package repositories

import (
	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/src/domain/entities"
)

type FlashcardRepository interface {
	Create(flashcard *entities.Flashcard) error
	GetByID(id uuid.UUID) (*entities.Flashcard, error)
	Update(flashcard *entities.Flashcard) error
	Delete(id uuid.UUID) error
	ListByCollection(collectionID uuid.UUID) ([]entities.Flashcard, error)
}
