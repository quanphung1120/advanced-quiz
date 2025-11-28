package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/quanphung1120/advanced-quiz-be/controllers"
)

func SetupRoutes(router *gin.Engine) {
	router.GET("/", controllers.HomeController)
	router.GET("/health", controllers.HealthController)
}
