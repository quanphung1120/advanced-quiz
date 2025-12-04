package repositories

import (
	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/src/domain/entities"
)

type CollectionRepository interface {
	Create(collection *entities.Collection) error
	GetByID(id uuid.UUID) (*entities.Collection, error)
	Update(collection *entities.Collection) error
	Delete(id uuid.UUID) error
	ListByOwner(ownerID string) ([]entities.Collection, error)
	ListSharedWithUser(userID string) ([]entities.Collection, error)
	UpdateVisibility(id uuid.UUID, isPublic bool) error

	// Collaborator methods
	AddCollaborator(collaborator *entities.CollectionCollaborator) error
	RemoveCollaborator(collectionID uuid.UUID, userID string) error
	GetCollaborators(collectionID uuid.UUID) ([]entities.CollectionCollaborator, error)
	GetCollaborator(collectionID uuid.UUID, userID string) (*entities.CollectionCollaborator, error)
}
