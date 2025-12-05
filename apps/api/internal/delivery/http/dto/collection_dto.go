package dto

type CreateCollectionRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	IsPublic    bool   `json:"is_public"`
}

type UpdateCollectionRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	IsPublic    *bool  `json:"is_public"`
}

type AddCollaboratorRequest struct {
	Email  string `json:"email" binding:"required"`
	UserID string `json:"user_id"`
	Role   string `json:"role"`
}
