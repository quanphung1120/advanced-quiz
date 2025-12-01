package requests

type CreateFlashcardRequest struct {
	Question string `json:"question" binding:"required"`
	Answer   string `json:"answer" binding:"required"`
	Type     string `json:"type"` // Optional, defaults to "simple"
}

type UpdateFlashcardRequest struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Type     string `json:"type"`
}
