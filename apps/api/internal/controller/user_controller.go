package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/quanphung1120/advanced-quiz-be/internal/middleware"
	"github.com/quanphung1120/advanced-quiz-be/internal/service"
)

type UserController struct {
	userService service.UserService
}

func NewUserController(userService service.UserService) *UserController {
	return &UserController{
		userService: userService,
	}
}

func (c *UserController) Me(ctx *gin.Context) {
	user, ok := middleware.GetUserDataFromGinContext(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
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

	ctx.JSON(http.StatusOK, gin.H{
		"user": response,
	})
}

func (c *UserController) SearchEmailAddresses(ctx *gin.Context) {
	query := ctx.Query("query")
	if query == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "query parameter is required",
		})
		return
	}

	results, err := c.userService.SearchUsers(query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
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

	ctx.JSON(http.StatusOK, gin.H{
		"emails": emails,
	})
}
