package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/quanphung1120/advanced-quiz-be/controllers"
	"github.com/quanphung1120/advanced-quiz-be/middlewares"
)

func SetupRoutes(router *gin.Engine) {
	// Public routes
	router.GET("/", controllers.HomeController)
	router.GET("/health", controllers.HealthController)

	// Versioned API group
	api := router.Group("/api/v1")

	// Protected routes - require Clerk authentication
	protected := api.Group("/")
	protected.Use(middlewares.ClerkAuthMiddleware())

	// User routes
	users := protected.Group("/users")
	users.GET("/me", controllers.MeController)

	// Collection routes
	collections := protected.Group("/collections")
	collections.GET("/", controllers.GetCollectionsController)
	collections.GET("/:id", controllers.GetCollectionController)
	collections.POST("/", controllers.CreateCollectionController)
	collections.PUT("/:id", controllers.UpdateCollectionController)
	collections.DELETE("/:id", controllers.DeleteCollectionController)
	collections.POST("/:id/collaborators", controllers.AddCollaboratorController)
}
