package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// Flashcard holds the schema definition for the Flashcard entity.
type Flashcard struct {
	ent.Schema
}

// Fields of the Flashcard.
func (Flashcard) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).
			Default(uuid.New).
			Immutable(),
		field.String("question").
			NotEmpty(),
		field.String("answer").
			NotEmpty(),
		field.String("type").
			Default("simple").
			MaxLen(50),
		field.UUID("collection_id", uuid.UUID{}),
		field.String("created_by").
			NotEmpty().
			MaxLen(255),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the Flashcard.
func (Flashcard) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("collection", Collection.Type).
			Ref("flashcards").
			Unique().
			Required().
			Field("collection_id"),
	}
}
