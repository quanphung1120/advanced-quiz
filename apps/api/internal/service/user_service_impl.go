package service

import (
	"github.com/quanphung1120/advanced-quiz-be/internal/repository"
)

type userServiceImpl struct {
	userRepo repository.UserRepository
}

func (s *userServiceImpl) SearchUsers(query string) ([]repository.UserSearchResult, error) {
	return s.userRepo.SearchUsers(query)
}
