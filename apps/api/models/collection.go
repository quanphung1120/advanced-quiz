package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Collection struct {
	ID        uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id" binding:"-"`
	CreatedAt time.Time      `json:"created_at" binding:"-"`
	UpdatedAt time.Time      `json:"updated_at" binding:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-" binding:"-"`

	Name        string `gorm:"size:255;not null" json:"name" binding:"required"`
	Description string `gorm:"type:text" json:"description" binding:"-"`

	// OwnerID stores the Clerk User ID directly.
	// Indexed for fast lookups of "My Collections"
	OwnerID string `gorm:"size:255;not null;index" json:"owner_id"`

	// Relationship: One Collection has many Collaborators
	Collaborators []CollectionCollaborator `gorm:"foreignKey:CollectionID;constraint:OnDelete:CASCADE;" json:"collaborators"`
}
