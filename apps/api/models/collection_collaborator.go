package models

import (
	"time"

	"github.com/google/uuid"
)

type CollectionCollaborator struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`

	// Foreign Key to Collection
	CollectionID uuid.UUID `gorm:"type:uuid;not null;index" json:"collection_id"`

	// UserID stores the Collaborator's Clerk User ID
	UserID string `gorm:"size:255;not null;index" json:"user_id"`

	// Role defines permissions (e.g., "viewer", "editor", "admin")
	Role string `gorm:"size:50;default:'viewer'" json:"role"`
}
