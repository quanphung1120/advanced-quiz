package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/google/uuid"
)

// Collection holds the schema definition for the Collection entity.
type Collection struct {
	ent.Schema
}

// Fields of the Collection.
func (Collection) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).
			Default(NewUUIDV7).
			Immutable(),
		field.String("name").
			NotEmpty().
			MaxLen(255),
		field.String("description").
			Optional().
			Default(""),
		field.String("owner_id").
			NotEmpty().
			MaxLen(255),
		field.Bool("is_public").
			Default(false),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

func (Collection) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("owner_id"),
	}
}

// Edges of the Collection.
func (Collection) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("collaborators", CollectionCollaborator.Type),
		edge.To("flashcards", Flashcard.Type),
	}
}
