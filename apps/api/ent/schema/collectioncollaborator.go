package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// CollectionCollaborator holds the schema definition for the CollectionCollaborator entity.
type CollectionCollaborator struct {
	ent.Schema
}

// Fields of the CollectionCollaborator.
func (CollectionCollaborator) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).
			Default(uuid.New).
			Immutable(),
		field.UUID("collection_id", uuid.UUID{}),
		field.String("user_id").
			NotEmpty().
			MaxLen(255),
		field.String("role").
			Default("viewer").
			MaxLen(50),
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
	}
}

// Edges of the CollectionCollaborator.
func (CollectionCollaborator) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("collection", Collection.Type).
			Ref("collaborators").
			Unique().
			Required().
			Field("collection_id"),
	}
}
