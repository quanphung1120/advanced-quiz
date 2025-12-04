package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Collection struct {
	ID        uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Name        string `gorm:"size:255;not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`

	// OwnerID stores the Clerk User ID directly.
	// Indexed for fast lookups of "My Collections"
	OwnerID  string `gorm:"size:255;not null;index" json:"owner_id"`
	IsPublic bool   `gorm:"default:false" json:"is_public"`

	// Relationship: One Collection has many Collaborators
	Collaborators []CollectionCollaborator `gorm:"foreignKey:CollectionID;constraint:OnDelete:CASCADE;" json:"collaborators"`
}
