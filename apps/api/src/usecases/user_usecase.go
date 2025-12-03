package usecases

import (
	"github.com/quanphung1120/advanced-quiz-be/src/domain/repositories"
)

type UserUseCase struct {
	userRepo repositories.UserRepository
}

func NewUserUseCase(userRepo repositories.UserRepository) *UserUseCase {
	return &UserUseCase{
		userRepo: userRepo,
	}
}

func (uc *UserUseCase) SearchUsers(query string) ([]repositories.UserSearchResult, error) {
	return uc.userRepo.SearchUsers(query)
}
