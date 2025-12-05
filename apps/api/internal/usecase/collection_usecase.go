package usecase

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/internal/usecase/repository"
)

type CollectionUseCase struct {
	collectionRepo repository.CollectionRepository
	userRepo       repository.UserRepository
}

func NewCollectionUseCase(collectionRepo repository.CollectionRepository, userRepo repository.UserRepository) *CollectionUseCase {
	return &CollectionUseCase{
		collectionRepo: collectionRepo,
		userRepo:       userRepo,
	}
}

// CollectionWithEmail wraps a collection with enriched collaborator emails
type CollectionWithEmail struct {
	*ent.Collection
	CollaboratorEmails map[string]string `json:"collaborator_emails,omitempty"`
}

func (uc *CollectionUseCase) GetMyCollections(ctx context.Context, userID string) ([]*ent.Collection, []*ent.Collection, error) {
	// Get owned collections
	owned, err := uc.collectionRepo.ListByOwner(ctx, userID)
	if err != nil {
		return nil, nil, err
	}

	// Get shared collections
	shared, err := uc.collectionRepo.ListSharedWithUser(ctx, userID)
	if err != nil {
		return nil, nil, err
	}

	return owned, shared, nil
}

func (uc *CollectionUseCase) GetCollection(ctx context.Context, collectionID uuid.UUID, userID string) (*ent.Collection, string, error) {
	collection, err := uc.collectionRepo.GetByID(ctx, collectionID)
	if err != nil {
		return nil, "", err
	}

	role := ""
	if collection.OwnerID == userID {
		role = "owner"
	} else {
		// Check collaborators
		for _, c := range collection.Edges.Collaborators {
			if c.UserID == userID {
				role = c.Role
				break
			}
		}
	}

	if role == "" {
		return nil, "", errors.New("access denied")
	}

	return collection, role, nil
}

func (uc *CollectionUseCase) CreateCollection(ctx context.Context, name, description, ownerID string, isPublic bool) (*ent.Collection, error) {
	return uc.collectionRepo.Create(ctx, name, description, ownerID, isPublic)
}

func (uc *CollectionUseCase) UpdateCollection(ctx context.Context, collectionID uuid.UUID, userID, name, description string, isPublic *bool) (*ent.Collection, error) {
	collection, role, err := uc.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return nil, err
	}

	if role != "owner" && role != "editor" && role != "admin" {
		return nil, errors.New("permission denied")
	}

	// Use existing values if not provided
	newName := collection.Name
	if name != "" {
		newName = name
	}
	newDescription := collection.Description
	if description != "" {
		newDescription = description
	}
	newIsPublic := collection.IsPublic
	if isPublic != nil {
		newIsPublic = *isPublic
	}

	return uc.collectionRepo.Update(ctx, collectionID, newName, newDescription, newIsPublic)
}

func (uc *CollectionUseCase) DeleteCollection(ctx context.Context, collectionID uuid.UUID, userID string) error {
	_, role, err := uc.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return err
	}

	if role != "owner" {
		return errors.New("permission denied")
	}

	return uc.collectionRepo.Delete(ctx, collectionID)
}

func (uc *CollectionUseCase) AddCollaborator(ctx context.Context, collectionID uuid.UUID, userID, email, role string) (*ent.CollectionCollaborator, error) {
	collection, userRole, err := uc.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return nil, err
	}

	if userRole != "owner" && userRole != "admin" {
		return nil, errors.New("permission denied")
	}

	// Search user by email
	results, err := uc.userRepo.SearchUsers(email)
	if err != nil {
		return nil, err
	}

	var targetUserID string
	for _, u := range results {
		if u.Email == email {
			targetUserID = u.ID
			break
		}
	}

	if targetUserID == "" {
		return nil, errors.New("user not found")
	}

	if targetUserID == userID {
		return nil, errors.New("cannot add yourself")
	}

	// Check if already exists
	for _, c := range collection.Edges.Collaborators {
		if c.UserID == targetUserID {
			return nil, errors.New("already a collaborator")
		}
	}

	return uc.collectionRepo.AddCollaborator(ctx, collectionID, targetUserID, role)
}

func (uc *CollectionUseCase) RemoveCollaborator(ctx context.Context, collectionID uuid.UUID, userID string, collaboratorID uuid.UUID) error {
	collection, role, err := uc.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return err
	}

	if role != "owner" && role != "admin" {
		return errors.New("permission denied")
	}

	// Verify collaborator belongs to collection
	found := false
	var targetUserID string
	for _, c := range collection.Edges.Collaborators {
		if c.ID == collaboratorID {
			found = true
			targetUserID = c.UserID
			break
		}
	}

	if !found {
		return errors.New("collaborator not found")
	}

	// Prevent removing owner (though owner is not in collaborators list usually)
	if targetUserID == collection.OwnerID {
		return errors.New("cannot remove owner")
	}

	return uc.collectionRepo.RemoveCollaborator(ctx, collectionID, targetUserID)
}
