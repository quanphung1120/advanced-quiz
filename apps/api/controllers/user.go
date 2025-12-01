package controllers

import (
	"net/http"

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
