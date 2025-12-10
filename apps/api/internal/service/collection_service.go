package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/internal/repository"
)

// CollectionService defines the interface for collection business logic
type CollectionService interface {
	GetMyCollections(ctx context.Context, userID string) ([]*ent.Collection, []*ent.Collection, error)
	GetCollection(ctx context.Context, collectionID uuid.UUID, userID string) (*ent.Collection, string, error)
	CreateCollection(ctx context.Context, name, description, ownerID string, isPublic bool) (*ent.Collection, error)
	UpdateCollection(ctx context.Context, collectionID uuid.UUID, userID, name, description string, isPublic *bool) (*ent.Collection, error)
	DeleteCollection(ctx context.Context, collectionID uuid.UUID, userID string) error
	AddCollaborator(ctx context.Context, collectionID uuid.UUID, userID, email, role string) (*ent.CollectionCollaborator, error)
	RemoveCollaborator(ctx context.Context, collectionID uuid.UUID, userID string, collaboratorID uuid.UUID) error
}

// NewCollectionService creates a new CollectionService instance
func NewCollectionService(collectionRepo repository.CollectionRepository, userRepo repository.UserRepository) CollectionService {
	return &collectionServiceImpl{
		collectionRepo: collectionRepo,
		userRepo:       userRepo,
	}
}
