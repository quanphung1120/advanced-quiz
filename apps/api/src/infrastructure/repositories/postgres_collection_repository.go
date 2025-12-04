package repositories

import (
	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/src/domain/entities"
	"github.com/quanphung1120/advanced-quiz-be/src/domain/repositories"
	"gorm.io/gorm"
)

type PostgresCollectionRepository struct {
	db *gorm.DB
}

func NewPostgresCollectionRepository(db *gorm.DB) repositories.CollectionRepository {
	return &PostgresCollectionRepository{db: db}
}

func (r *PostgresCollectionRepository) Create(collection *entities.Collection) error {
	return r.db.Create(collection).Error
}

func (r *PostgresCollectionRepository) GetByID(id uuid.UUID) (*entities.Collection, error) {
	var collection entities.Collection
	err := r.db.Preload("Collaborators").First(&collection, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &collection, nil
}

func (r *PostgresCollectionRepository) Update(collection *entities.Collection) error {
	return r.db.Save(collection).Error
}

func (r *PostgresCollectionRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&entities.Collection{}, "id = ?", id).Error
}

func (r *PostgresCollectionRepository) ListByOwner(ownerID string) ([]entities.Collection, error) {
	var collections []entities.Collection
	err := r.db.Preload("Collaborators").Where("owner_id = ?", ownerID).Find(&collections).Error
	return collections, err
}

func (r *PostgresCollectionRepository) ListSharedWithUser(userID string) ([]entities.Collection, error) {
	var collaborations []entities.CollectionCollaborator
	err := r.db.Where("user_id = ?", userID).Find(&collaborations).Error
	if err != nil {
		return nil, err
	}

	if len(collaborations) == 0 {
		return []entities.Collection{}, nil
	}

	collectionIDs := make([]uuid.UUID, len(collaborations))
	for i, collab := range collaborations {
		collectionIDs[i] = collab.CollectionID
	}

	var collections []entities.Collection
	err = r.db.Preload("Collaborators").Where("id IN ?", collectionIDs).Find(&collections).Error
	return collections, err
}

func (r *PostgresCollectionRepository) AddCollaborator(collaborator *entities.CollectionCollaborator) error {
	return r.db.Create(collaborator).Error
}

func (r *PostgresCollectionRepository) RemoveCollaborator(collectionID uuid.UUID, userID string) error {
	return r.db.Where("collection_id = ? AND user_id = ?", collectionID, userID).Delete(&entities.CollectionCollaborator{}).Error
}

func (r *PostgresCollectionRepository) GetCollaborators(collectionID uuid.UUID) ([]entities.CollectionCollaborator, error) {
	var collaborators []entities.CollectionCollaborator
	err := r.db.Where("collection_id = ?", collectionID).Find(&collaborators).Error
	return collaborators, err
}

func (r *PostgresCollectionRepository) GetCollaborator(collectionID uuid.UUID, userID string) (*entities.CollectionCollaborator, error) {
	var collaborator entities.CollectionCollaborator
	err := r.db.Where("collection_id = ? AND user_id = ?", collectionID, userID).First(&collaborator).Error
	if err != nil {
		return nil, err
	}
	return &collaborator, nil
}

func (r *PostgresCollectionRepository) UpdateVisibility(id uuid.UUID, isPublic bool) error {
	return r.db.Model(&entities.Collection{}).Where("id = ?", id).Update("is_public", isPublic).Error
}
