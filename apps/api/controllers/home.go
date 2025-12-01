package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// PublicResponse represents a response for public endpoints
type PublicResponse struct {
	Access string `json:"access"`
}

func HomeController(c *gin.Context) {
	response := PublicResponse{
		Access: "public",
	}
	c.JSON(http.StatusOK, response)
}
