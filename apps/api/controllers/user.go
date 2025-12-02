package controllers

import (
	"net/http"

	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/gin-gonic/gin"
	"github.com/quanphung1120/advanced-quiz-be/utils"
)

// UserResponse represents the response for the /me endpoint
type UserResponse struct {
	UserID         string   `json:"user_id"`
	SessionID      string   `json:"session_id,omitempty"`
	EmailAddresses []string `json:"email_addresses,omitempty"`
	FirstName      string   `json:"first_name,omitempty"`
	LastName       string   `json:"last_name,omitempty"`
}

// MeController returns the authenticated user's information from Clerk session claims
func MeController(c *gin.Context) {
	user, err := utils.GetUserDataFromContext(c.Request.Context())
	if err != nil {
		c.Error(err) // surface the error in Gin logs for debugging
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Internal Server Error",
			"message": err.Error(),
		})
		return
	}

	emailAddresses := []string{}
	for _, email := range user.EmailAddresses {
		emailAddresses = append(emailAddresses, email.EmailAddress)
	}

	response := UserResponse{
		UserID:         user.ID,
		SessionID:      "test",
		EmailAddresses: emailAddresses,
	}

	if user.FirstName != nil {
		response.FirstName = *user.FirstName
	}

	if user.LastName != nil {
		response.LastName = *user.LastName
	}

	c.JSON(http.StatusOK, gin.H{
		"user": response,
	})
}

func SearchEmailAddressesController(ctx *gin.Context) {
	query := ctx.Query("query")
	if query == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "query parameter is required",
		})
		return
	}

	users, err := user.List(ctx.Request.Context(), &user.ListParams{
		EmailAddressQuery: &query,
	})

	if err != nil {
		ctx.Error(err)
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Internal Server Error",
			"message": err.Error(),
		})
		return
	}

	emails := []string{}
	for _, u := range users.Users {
		for _, email := range u.EmailAddresses {
			emails = append(emails, email.EmailAddress)
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"emails": emails,
	})
}
