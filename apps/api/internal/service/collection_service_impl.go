package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/internal/repository"
)

type collectionServiceImpl struct {
	collectionRepo repository.CollectionRepository
	userRepo       repository.UserRepository
}

func (s *collectionServiceImpl) GetMyCollections(ctx context.Context, userID string) ([]*ent.Collection, []*ent.Collection, error) {
	owned, err := s.collectionRepo.ListByOwner(ctx, userID)
	if err != nil {
		return nil, nil, err
	}

	shared, err := s.collectionRepo.ListSharedWithUser(ctx, userID)
	if err != nil {
		return nil, nil, err
	}

	return owned, shared, nil
}

func (s *collectionServiceImpl) GetCollection(ctx context.Context, collectionID uuid.UUID, userID string) (*ent.Collection, string, error) {
	collection, err := s.collectionRepo.GetByID(ctx, collectionID)
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

func (s *collectionServiceImpl) CreateCollection(ctx context.Context, name, description, ownerID string, isPublic bool) (*ent.Collection, error) {
	return s.collectionRepo.Create(ctx, name, description, ownerID, isPublic)
}

func (s *collectionServiceImpl) UpdateCollection(ctx context.Context, collectionID uuid.UUID, userID, name, description string, isPublic *bool) (*ent.Collection, error) {
	collection, role, err := s.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return nil, err
	}

	if role != "owner" && role != "editor" && role != "admin" {
		return nil, errors.New("permission denied")
	}

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

	return s.collectionRepo.Update(ctx, collectionID, newName, newDescription, newIsPublic)
}

func (s *collectionServiceImpl) DeleteCollection(ctx context.Context, collectionID uuid.UUID, userID string) error {
	_, role, err := s.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return err
	}

	if role != "owner" {
		return errors.New("permission denied")
	}

	return s.collectionRepo.Delete(ctx, collectionID)
}

func (s *collectionServiceImpl) AddCollaborator(ctx context.Context, collectionID uuid.UUID, userID, email, role string) (*ent.CollectionCollaborator, error) {
	collection, userRole, err := s.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return nil, err
	}

	if userRole != "owner" && userRole != "admin" {
		return nil, errors.New("permission denied")
	}

	results, err := s.userRepo.SearchUsers(email)
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

	for _, c := range collection.Edges.Collaborators {
		if c.UserID == targetUserID {
			return nil, errors.New("already a collaborator")
		}
	}

	return s.collectionRepo.AddCollaborator(ctx, collectionID, targetUserID, role)
}

func (s *collectionServiceImpl) RemoveCollaborator(ctx context.Context, collectionID uuid.UUID, userID string, collaboratorID uuid.UUID) error {
	collection, role, err := s.GetCollection(ctx, collectionID, userID)
	if err != nil {
		return err
	}

	if role != "owner" && role != "admin" {
		return errors.New("permission denied")
	}

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

	return s.collectionRepo.RemoveCollaborator(ctx, collectionID, targetUserID)
}
