package middleware

import (
	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/gin-gonic/gin"
)

func GetUserIDFromContext(c *gin.Context) (string, bool) {
	claims, ok := GetSessionClaims(c)
	if !ok {
		claims, ok = clerk.SessionClaimsFromContext(c.Request.Context())
		if !ok {
			return "", false
		}
		return claims.Subject, true
	}
	return claims.Subject, true
}

func GetUserDataFromGinContext(c *gin.Context) (*clerk.User, bool) {
	userData, exists := c.Get(ActiveUserData)
	if !exists {
		return nil, false
	}
	u, ok := userData.(*clerk.User)
	return u, ok
}
