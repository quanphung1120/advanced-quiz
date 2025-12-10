package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/google/uuid"
)

// FlashcardReview holds the schema definition for the FlashcardReview entity.
// This entity tracks the spaced repetition learning progress for each user-flashcard pair.
type FlashcardReview struct {
	ent.Schema
}

// Fields of the FlashcardReview.
func (FlashcardReview) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).
			Default(NewUUIDV7).
			Immutable(),
		field.String("user_id").
			NotEmpty().
			MaxLen(255).
			Comment("Clerk user ID"),
		field.UUID("flashcard_id", uuid.UUID{}).
			Comment("Foreign key to the flashcard being reviewed"),
		// SM-2 Algorithm fields
		field.Float("ease_factor").
			Default(2.5).
			Min(1.3).
			Comment("Ease factor (difficulty multiplier), minimum 1.3 like Anki"),
		field.Int("interval").
			Default(0).
			Min(0).
			Comment("Current interval in minutes (0 means new/learning)"),
		field.Time("due_at").
			Default(time.Now).
			Comment("When the card is due for review"),
		field.Enum("status").
			Values("new", "learning", "review", "relearning").
			Default("new").
			Comment("Current learning status of the card"),
		field.Int("learning_step").
			Default(0).
			Min(0).
			Comment("Current step in learning/relearning phase (0, 1, 2...)"),
		field.Int("review_count").
			Default(0).
			Min(0).
			Comment("Total number of reviews completed"),
		field.Int("lapse_count").
			Default(0).
			Min(0).
			Comment("Number of times the card was forgotten (rated 'Again')"),
		field.Time("last_reviewed_at").
			Optional().
			Nillable().
			Comment("When the card was last reviewed"),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the FlashcardReview.
func (FlashcardReview) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("flashcard", Flashcard.Type).
			Ref("reviews").
			Unique().
			Required().
			Field("flashcard_id"),
	}
}

// Indexes of the FlashcardReview.
func (FlashcardReview) Indexes() []ent.Index {
	return []ent.Index{
		// Unique constraint: one review entry per user per flashcard
		index.Fields("user_id", "flashcard_id").
			Unique(),
		// Index for querying due cards by user
		index.Fields("user_id", "due_at"),
		// Index for querying by status
		index.Fields("user_id", "status"),
	}
}
