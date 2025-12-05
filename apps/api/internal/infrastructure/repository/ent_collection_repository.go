package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/ent/collection"
	"github.com/quanphung1120/advanced-quiz-be/ent/collectioncollaborator"
	"github.com/quanphung1120/advanced-quiz-be/internal/usecase/repository"
)

type EntCollectionRepository struct {
	client *ent.Client
}

func NewEntCollectionRepository(client *ent.Client) repository.CollectionRepository {
	return &EntCollectionRepository{client: client}
}

func (r *EntCollectionRepository) Create(ctx context.Context, name, description, ownerID string, isPublic bool) (*ent.Collection, error) {
	return r.client.Collection.
		Create().
		SetName(name).
		SetDescription(description).
		SetOwnerID(ownerID).
		SetIsPublic(isPublic).
		Save(ctx)
}

func (r *EntCollectionRepository) GetByID(ctx context.Context, id uuid.UUID) (*ent.Collection, error) {
	return r.client.Collection.
		Query().
		Where(collection.ID(id)).
		WithCollaborators().
		Only(ctx)
}

func (r *EntCollectionRepository) Update(ctx context.Context, id uuid.UUID, name, description string, isPublic bool) (*ent.Collection, error) {
	return r.client.Collection.
		UpdateOneID(id).
		SetName(name).
		SetDescription(description).
		SetIsPublic(isPublic).
		Save(ctx)
}

func (r *EntCollectionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.client.Collection.
		DeleteOneID(id).
		Exec(ctx)
}

func (r *EntCollectionRepository) ListByOwner(ctx context.Context, ownerID string) ([]*ent.Collection, error) {
	return r.client.Collection.
		Query().
		Where(collection.OwnerID(ownerID)).
		WithCollaborators().
		All(ctx)
}

func (r *EntCollectionRepository) ListSharedWithUser(ctx context.Context, userID string) ([]*ent.Collection, error) {
	return r.client.Collection.
		Query().
		Where(
			collection.HasCollaboratorsWith(
				collectioncollaborator.UserID(userID),
			),
		).
		WithCollaborators().
		All(ctx)
}

func (r *EntCollectionRepository) UpdateVisibility(ctx context.Context, id uuid.UUID, isPublic bool) error {
	return r.client.Collection.
		UpdateOneID(id).
		SetIsPublic(isPublic).
		Exec(ctx)
}

// Collaborator methods

func (r *EntCollectionRepository) AddCollaborator(ctx context.Context, collectionID uuid.UUID, userID, role string) (*ent.CollectionCollaborator, error) {
	return r.client.CollectionCollaborator.
		Create().
		SetCollectionID(collectionID).
		SetUserID(userID).
		SetRole(role).
		Save(ctx)
}

func (r *EntCollectionRepository) RemoveCollaborator(ctx context.Context, collectionID uuid.UUID, userID string) error {
	_, err := r.client.CollectionCollaborator.
		Delete().
		Where(
			collectioncollaborator.CollectionID(collectionID),
			collectioncollaborator.UserID(userID),
		).
		Exec(ctx)
	return err
}

func (r *EntCollectionRepository) GetCollaborators(ctx context.Context, collectionID uuid.UUID) ([]*ent.CollectionCollaborator, error) {
	return r.client.CollectionCollaborator.
		Query().
		Where(collectioncollaborator.CollectionID(collectionID)).
		All(ctx)
}

func (r *EntCollectionRepository) GetCollaborator(ctx context.Context, collectionID uuid.UUID, userID string) (*ent.CollectionCollaborator, error) {
	return r.client.CollectionCollaborator.
		Query().
		Where(
			collectioncollaborator.CollectionID(collectionID),
			collectioncollaborator.UserID(userID),
		).
		Only(ctx)
}
