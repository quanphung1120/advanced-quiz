package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func HealthController(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Service is healthy",
	})
}

func HomeController(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Welcome to Advanced Quiz API",
		"version": "1.0.0",
	})
}
