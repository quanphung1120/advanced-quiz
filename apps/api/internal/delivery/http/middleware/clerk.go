package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/gin-gonic/gin"
)

const ActiveSessionClaims = "ActiveSessionClaims"
const ActiveUserData = "ActiveUserData"

// ClerkAuthMiddleware creates a Gin middleware that validates Clerk JWT tokens
// from the Authorization header. On success, it attaches session claims to the
// request context. On failure, it returns a 401 Unauthorized response.
func ClerkAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check for Authorization header
		_, authorizationHeaderExists := c.Request.Header["Authorization"]

		if !authorizationHeaderExists {
			fmt.Printf("[CLERK AUTH] No Authorization header for %s %s - returning 401\n", c.Request.Method, c.Request.URL.Path)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Missing authorization header",
			})
			c.Abort()
			return
		}

		// Extract and clean the token
		headerToken := strings.TrimSpace(c.Request.Header.Get("Authorization"))
		headerToken = strings.TrimPrefix(headerToken, "Bearer ")

		if headerToken == "" {
			fmt.Printf("[CLERK AUTH] Empty token for %s %s - returning 401\n", c.Request.Method, c.Request.URL.Path)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Empty authorization token",
			})
			c.Abort()
			return
		}

		// Decode the token first to check if it's valid JWT format
		_, err := jwt.Decode(context.Background(), &jwt.DecodeParams{Token: headerToken})
		if err != nil {
			fmt.Printf("[CLERK AUTH] Failed to decode token for %s %s: %v\n", c.Request.Method, c.Request.URL.Path, err)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Invalid token format",
			})
			c.Abort()
			return
		}

		// Verify the token with 5 second leeway for clock skew
		claims, err := jwt.Verify(context.Background(), &jwt.VerifyParams{
			Token:  headerToken,
			Leeway: 5 * time.Second,
		})
		if err != nil {
			fmt.Printf("[CLERK AUTH] Failed to verify token for %s %s: %v\n", c.Request.Method, c.Request.URL.Path, err)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Store claims in Gin context
		c.Set(ActiveSessionClaims, claims)

		// Also store in request context for compatibility
		ctx := clerk.ContextWithSessionClaims(c.Request.Context(), claims)
		c.Request = c.Request.WithContext(ctx)

		// Fetch and store user data
		userData, err := user.Get(ctx, claims.Subject)
		if err != nil {
			fmt.Printf("[CLERK AUTH] Failed to fetch user data for %s %s: %v\n", c.Request.Method, c.Request.URL.Path, err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal Server Error",
				"message": "Failed to fetch user data",
			})
			c.Abort()
			return
		}

		c.Set(ActiveUserData, userData)
		c.Next()
	}
}

// GetSessionClaims retrieves the session claims from the Gin context
func GetSessionClaims(c *gin.Context) (*clerk.SessionClaims, bool) {
	claims, exists := c.Get(ActiveSessionClaims)
	if !exists {
		return nil, false
	}
	sessionClaims, ok := claims.(*clerk.SessionClaims)
	return sessionClaims, ok
}
