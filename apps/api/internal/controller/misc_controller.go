package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// HealthController returns service health status
func HealthController(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Service is healthy",
	})
}

// HomeController returns welcome message
func HomeController(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Welcome to Advanced Quiz API",
		"version": "1.0.0",
	})
}
