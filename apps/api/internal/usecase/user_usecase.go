package usecase

import (
	"github.com/quanphung1120/advanced-quiz-be/internal/usecase/repository"
)

type UserUseCase struct {
	userRepo repository.UserRepository
}

func NewUserUseCase(userRepo repository.UserRepository) *UserUseCase {
	return &UserUseCase{
		userRepo: userRepo,
	}
}

func (uc *UserUseCase) SearchUsers(query string) ([]repository.UserSearchResult, error) {
	return uc.userRepo.SearchUsers(query)
}
