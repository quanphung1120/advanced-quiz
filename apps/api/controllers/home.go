package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/quanphung1120/advanced-quiz-be/models"
)

func HomeController(c *gin.Context) {
	response := models.Response{
		Message: "Hello World",
	}
	c.JSON(http.StatusOK, response)
}
