package utils

import (
	"context"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/user"
)

func GetUserIDFromContext(ctx context.Context) (string, bool) {
	claims, ok := clerk.SessionClaimsFromContext(ctx)
	if !ok {
		return "", false
	}
	return claims.ID, true
}

func GetUserData(ctx context.Context, userID string) (*clerk.User, error) {
	return user.Get(ctx, userID)
}

func GetUserDataFromContext(ctx context.Context) (*clerk.User, error) {
	claims, ok := clerk.SessionClaimsFromContext(ctx)
	if !ok {
		return nil, nil
	}
	return GetUserData(ctx, claims.Subject)
}
