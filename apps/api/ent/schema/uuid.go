package schema

import "github.com/google/uuid"

// NewUUIDV7 generates a new UUID v7 for use as a default value in Ent schemas.
// This wrapper function handles the error case by panicking, which is acceptable
// for UUID generation as it should never fail under normal circumstances.
func NewUUIDV7() uuid.UUID {
	id, err := uuid.NewV7()
	if err != nil {
		panic(err)
	}
	return id
}
