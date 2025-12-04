package external

import (
	"context"

	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/quanphung1120/advanced-quiz-be/src/domain/repositories"
)

type ClerkUserRepository struct{}

func NewClerkUserRepository() repositories.UserRepository {
	return &ClerkUserRepository{}
}

func (r *ClerkUserRepository) GetEmailAddress(userID string) (string, error) {
	u, err := user.Get(context.Background(), userID)
	if err != nil {
		return "", err
	}
	if len(u.EmailAddresses) > 0 {
		return u.EmailAddresses[0].EmailAddress, nil
	}
	return "", nil
}

func (r *ClerkUserRepository) SearchUsers(query string) ([]repositories.UserSearchResult, error) {
	users, err := user.List(context.Background(), &user.ListParams{
		EmailAddressQuery: &query,
	})
	if err != nil {
		return nil, err
	}

	var results []repositories.UserSearchResult
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

		results = append(results, repositories.UserSearchResult{
			ID:        u.ID,
			FirstName: firstName,
			LastName:  lastName,
			Email:     email,
			ImageUrl:  imageUrl,
		})
	}
	return results, nil
}
