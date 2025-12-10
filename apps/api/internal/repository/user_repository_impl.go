package repository

import (
	"context"

	"github.com/clerk/clerk-sdk-go/v2/user"
)

// UserRepositoryImpl implements UserRepository using Clerk SDK
type UserRepositoryImpl struct{}

func NewUserRepository() UserRepository {
	return &UserRepositoryImpl{}
}

func (r *UserRepositoryImpl) GetEmailAddress(userID string) (string, error) {
	u, err := user.Get(context.Background(), userID)
	if err != nil {
		return "", err
	}
	if len(u.EmailAddresses) > 0 {
		return u.EmailAddresses[0].EmailAddress, nil
	}
	return "", nil
}

func (r *UserRepositoryImpl) SearchUsers(query string) ([]UserSearchResult, error) {
	users, err := user.List(context.Background(), &user.ListParams{
		EmailAddressQuery: &query,
	})
	if err != nil {
		return nil, err
	}

	var results []UserSearchResult
	for _, u := range users.Users {
		email := ""
		if len(u.EmailAddresses) > 0 {
			email = u.EmailAddresses[0].EmailAddress
		}

		firstName := ""
		if u.FirstName != nil {
			firstName = *u.FirstName
		}

		lastName := ""
		if u.LastName != nil {
			lastName = *u.LastName
		}

		imageUrl := ""
		if u.ImageURL != nil {
			imageUrl = *u.ImageURL
		}

		results = append(results, UserSearchResult{
			ID:        u.ID,
			FirstName: firstName,
			LastName:  lastName,
			Email:     email,
			ImageUrl:  imageUrl,
		})
	}
	return results, nil
}
