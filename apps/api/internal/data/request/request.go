package request

// CreateCollectionRequest represents a collection creation request
type CreateCollectionRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	IsPublic    bool   `json:"is_public"`
}

// UpdateCollectionRequest represents a collection update request
type UpdateCollectionRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	IsPublic    *bool  `json:"is_public"`
}

// AddCollaboratorRequest represents a request to add a collaborator
type AddCollaboratorRequest struct {
	Email  string `json:"email" binding:"required"`
	UserID string `json:"user_id"`
	Role   string `json:"role"`
}

// CreateFlashcardRequest represents a flashcard creation request
type CreateFlashcardRequest struct {
	Question string `json:"question" binding:"required"`
	Answer   string `json:"answer" binding:"required"`
	Type     string `json:"type"` // Optional, defaults to "simple"
}

// UpdateFlashcardRequest represents a flashcard update request
type UpdateFlashcardRequest struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Type     string `json:"type"`
}

// SubmitReviewRequest represents a flashcard review submission
type SubmitReviewRequest struct {
	Rating int `json:"rating" binding:"gte=0,lte=3"`
}
