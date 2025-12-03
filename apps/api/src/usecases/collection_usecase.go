package usecases

import (
	"errors"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/src/domain/entities"
	"github.com/quanphung1120/advanced-quiz-be/src/domain/repositories"
)

type CollectionUseCase struct {
	collectionRepo repositories.CollectionRepository
	userRepo       repositories.UserRepository
}

func NewCollectionUseCase(collectionRepo repositories.CollectionRepository, userRepo repositories.UserRepository) *CollectionUseCase {
	return &CollectionUseCase{
		collectionRepo: collectionRepo,
		userRepo:       userRepo,
	}
}

func (uc *CollectionUseCase) GetMyCollections(userID string) ([]entities.Collection, []entities.Collection, error) {
	// Get owned collections
	owned, err := uc.collectionRepo.ListByOwner(userID)
	if err != nil {
		return nil, nil, err
	}

	// Enrich owned collections with collaborator emails
	for i := range owned {
		for j := range owned[i].Collaborators {
			email, _ := uc.userRepo.GetEmailAddress(owned[i].Collaborators[j].UserID)
			owned[i].Collaborators[j].Email = email
		}
	}

	// Get shared collections
	shared, err := uc.collectionRepo.ListSharedWithUser(userID)
	if err != nil {
		return nil, nil, err
	}

	// Enrich shared collections
	for i := range shared {
		for j := range shared[i].Collaborators {
			email, _ := uc.userRepo.GetEmailAddress(shared[i].Collaborators[j].UserID)
			shared[i].Collaborators[j].Email = email
		}
	}

	return owned, shared, nil
}

func (uc *CollectionUseCase) GetCollection(collectionID uuid.UUID, userID string) (*entities.Collection, string, error) {
	collection, err := uc.collectionRepo.GetByID(collectionID)
	if err != nil {
		return nil, "", err
	}

	role := ""
	if collection.OwnerID == userID {
		role = "owner"
	} else {
		// Check collaborators
		for _, c := range collection.Collaborators {
			if c.UserID == userID {
				role = c.Role
				break
			}
		}
	}

	if role == "" {
		return nil, "", errors.New("access denied")
	}

	// Enrich collaborators
	for i := range collection.Collaborators {
		email, _ := uc.userRepo.GetEmailAddress(collection.Collaborators[i].UserID)
		collection.Collaborators[i].Email = email
	}

	return collection, role, nil
}

func (uc *CollectionUseCase) CreateCollection(name, description, ownerID string, isPublic bool) (*entities.Collection, error) {
	collection := &entities.Collection{
		Name:        name,
		Description: description,
		OwnerID:     ownerID,
		IsPublic:    isPublic,
	}
	err := uc.collectionRepo.Create(collection)
	return collection, err
}

func (uc *CollectionUseCase) UpdateCollection(collectionID uuid.UUID, userID, name, description string, isPublic *bool) (*entities.Collection, error) {
	collection, role, err := uc.GetCollection(collectionID, userID)
	if err != nil {
		return nil, err
	}

	if role != "owner" && role != "editor" && role != "admin" {
		return nil, errors.New("permission denied")
	}

	if name != "" {
		collection.Name = name
	}
	if description != "" {
		collection.Description = description
	}
	if isPublic != nil {
		collection.IsPublic = *isPublic
	}

	err = uc.collectionRepo.Update(collection)
	return collection, err
}

func (uc *CollectionUseCase) DeleteCollection(collectionID uuid.UUID, userID string) error {
	_, role, err := uc.GetCollection(collectionID, userID)
	if err != nil {
		return err
	}

	if role != "owner" {
		return errors.New("permission denied")
	}

	return uc.collectionRepo.Delete(collectionID)
}

func (uc *CollectionUseCase) AddCollaborator(collectionID uuid.UUID, userID, email, role string) (*entities.CollectionCollaborator, error) {
	collection, userRole, err := uc.GetCollection(collectionID, userID)
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
	for _, c := range collection.Collaborators {
		if c.UserID == targetUserID {
			return nil, errors.New("already a collaborator")
		}
	}

	collaborator := &entities.CollectionCollaborator{
		CollectionID: collectionID,
		UserID:       targetUserID,
		Role:         role,
		Email:        email,
	}

	err = uc.collectionRepo.AddCollaborator(collaborator)
	return collaborator, err
}

func (uc *CollectionUseCase) RemoveCollaborator(collectionID uuid.UUID, userID string, collaboratorID uuid.UUID) error {
	collection, role, err := uc.GetCollection(collectionID, userID)
	if err != nil {
		return err
	}

	if role != "owner" && role != "admin" {
		return errors.New("permission denied")
	}

	// Verify collaborator belongs to collection
	found := false
	var targetUserID string
	for _, c := range collection.Collaborators {
		if c.ID == collaboratorID {
			found = true
			targetUserID = c.UserID
			break
		}
	}

	if !found {
		return errors.New("collaborator not found")
	}

	// Prevent removing yourself if you are the owner (though owner is not in collaborators list usually, but just in case)
	if targetUserID == collection.OwnerID {
		return errors.New("cannot remove owner")
	}

	return uc.collectionRepo.RemoveCollaborator(collectionID, targetUserID)
}
