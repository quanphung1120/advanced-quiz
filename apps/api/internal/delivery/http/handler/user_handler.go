package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/quanphung1120/advanced-quiz-be/internal/delivery/http/middleware"
	"github.com/quanphung1120/advanced-quiz-be/internal/usecase"
)

type UserHandler struct {
	userUseCase *usecase.UserUseCase
}

func NewUserHandler(userUseCase *usecase.UserUseCase) *UserHandler {
	return &UserHandler{
		userUseCase: userUseCase,
	}
}

func (h *UserHandler) Me(c *gin.Context) {
	user, ok := middleware.GetUserDataFromGinContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	emailAddresses := []string{}
	for _, email := range user.EmailAddresses {
		emailAddresses = append(emailAddresses, email.EmailAddress)
	}

	response := gin.H{
		"user_id":         user.ID,
		"session_id":      "test", // Original hardcoded value
		"email_addresses": emailAddresses,
	}

	if user.FirstName != nil {
		response["first_name"] = *user.FirstName
	}

	if user.LastName != nil {
		response["last_name"] = *user.LastName
	}

	c.JSON(http.StatusOK, gin.H{
		"user": response,
	})
}

func (h *UserHandler) SearchEmailAddresses(c *gin.Context) {
	query := c.Query("query")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "query parameter is required",
		})
		return
	}

	// Use usecase for search
	results, err := h.userUseCase.SearchUsers(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Internal Server Error",
			"message": err.Error(),
		})
		return
	}

	emails := []string{}
	for _, r := range results {
		if r.Email != "" {
			emails = append(emails, r.Email)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"emails": emails,
	})
}
