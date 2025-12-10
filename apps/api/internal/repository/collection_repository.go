package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
)

// CollectionRepository defines the interface for collection data access
type CollectionRepository interface {
	Create(ctx context.Context, name, description, ownerID string, isPublic bool) (*ent.Collection, error)
	GetByID(ctx context.Context, id uuid.UUID) (*ent.Collection, error)
	Update(ctx context.Context, id uuid.UUID, name, description string, isPublic bool) (*ent.Collection, error)
	Delete(ctx context.Context, id uuid.UUID) error
	ListByOwner(ctx context.Context, ownerID string) ([]*ent.Collection, error)
	ListSharedWithUser(ctx context.Context, userID string) ([]*ent.Collection, error)
	UpdateVisibility(ctx context.Context, id uuid.UUID, isPublic bool) error

	// Collaborator methods
	AddCollaborator(ctx context.Context, collectionID uuid.UUID, userID, role string) (*ent.CollectionCollaborator, error)
	RemoveCollaborator(ctx context.Context, collectionID uuid.UUID, userID string) error
	GetCollaborators(ctx context.Context, collectionID uuid.UUID) ([]*ent.CollectionCollaborator, error)
	GetCollaborator(ctx context.Context, collectionID uuid.UUID, userID string) (*ent.CollectionCollaborator, error)
}
