package routes

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/quanphung1120/advanced-quiz-be/controllers"
	"github.com/quanphung1120/advanced-quiz-be/middlewares"
)

func SetupRoutes(router *gin.Engine) {
	router.Use(func(c *gin.Context) {
		c.Next()
		for _, e := range c.Errors {
			log.Println("GIN ERROR:", e.Err)
		}
	})

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
	users.GET("/search-email-addresses", controllers.SearchEmailAddressesController)

	// Collection routes
	collections := protected.Group("/collections")
	collections.GET("/me", controllers.GetMyCollectionsController)
	collections.GET("/:id", controllers.GetCollectionController)
	collections.POST("/", controllers.CreateCollectionController)
	collections.PUT("/:id", controllers.UpdateCollectionController)
	collections.DELETE("/:id", controllers.DeleteCollectionController)
	collections.POST("/:id/collaborators", controllers.AddCollaboratorController)
	collections.DELETE("/:id/collaborators/:collaboratorId", controllers.RemoveCollaboratorController)

	// Flashcard routes (nested under collections)
	collections.GET("/:id/flashcards", controllers.GetCollectionFlashcardsController)
	collections.GET("/:id/flashcards/:flashcardId", controllers.GetFlashcardController)
	collections.POST("/:id/flashcards", controllers.CreateFlashcardController)
	collections.PUT("/:id/flashcards/:flashcardId", controllers.UpdateFlashcardController)
	collections.DELETE("/:id/flashcards/:flashcardId", controllers.DeleteFlashcardController)
}
