package service

import (
	"github.com/quanphung1120/advanced-quiz-be/internal/repository"
)

// UserService defines the interface for user business logic
type UserService interface {
	SearchUsers(query string) ([]repository.UserSearchResult, error)
}

// NewUserService creates a new UserService instance
func NewUserService(userRepo repository.UserRepository) UserService {
	return &userServiceImpl{
		userRepo: userRepo,
	}
}
