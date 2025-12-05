package repository

type UserRepository interface {
	GetEmailAddress(userID string) (string, error)
	SearchUsers(query string) ([]UserSearchResult, error)
}

type UserSearchResult struct {
	ID        string `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	ImageUrl  string `json:"image_url"`
}
