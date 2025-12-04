package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Flashcard struct {
	ID        uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Flashcard content
	Question string `gorm:"type:text;not null" json:"question"`
	Answer   string `gorm:"type:text;not null" json:"answer"`

	// Type field for future extensibility (e.g., "simple", "multiple_choice", etc.)
	Type string `gorm:"size:50;default:'simple'" json:"type"`

	// Foreign Key to Collection
	CollectionID uuid.UUID  `gorm:"type:uuid;not null;index" json:"collection_id"`
	Collection   Collection `gorm:"foreignKey:CollectionID;constraint:OnDelete:CASCADE;" json:"-"`

	// Creator's Clerk User ID (could be owner or collaborator)
	CreatedBy string `gorm:"size:255;not null;index" json:"created_by"`
}
