package requests

type CreateCollectionRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type UpdateCollectionRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type AddCollaboratorRequest struct {
	Email  string `json:"email" binding:"required"`
	UserID string `json:"user_id"` // Optional: for backward compatibility
	Role   string `json:"role"`    // optional: "viewer", "editor", "admin" (defaults to "viewer")
}
