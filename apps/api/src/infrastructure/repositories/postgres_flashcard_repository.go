package repositories

import (
	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/src/domain/entities"
	"github.com/quanphung1120/advanced-quiz-be/src/domain/repositories"
	"gorm.io/gorm"
)

type PostgresFlashcardRepository struct {
	db *gorm.DB
}

func NewPostgresFlashcardRepository(db *gorm.DB) repositories.FlashcardRepository {
	return &PostgresFlashcardRepository{db: db}
}

func (r *PostgresFlashcardRepository) Create(flashcard *entities.Flashcard) error {
	return r.db.Create(flashcard).Error
}

func (r *PostgresFlashcardRepository) GetByID(id uuid.UUID) (*entities.Flashcard, error) {
	var flashcard entities.Flashcard
	err := r.db.First(&flashcard, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &flashcard, nil
}

func (r *PostgresFlashcardRepository) Update(flashcard *entities.Flashcard) error {
	return r.db.Save(flashcard).Error
}

func (r *PostgresFlashcardRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&entities.Flashcard{}, "id = ?", id).Error
}

func (r *PostgresFlashcardRepository) ListByCollection(collectionID uuid.UUID) ([]entities.Flashcard, error) {
	var flashcards []entities.Flashcard
	err := r.db.Where("collection_id = ?", collectionID).Find(&flashcards).Error
	return flashcards, err
}
