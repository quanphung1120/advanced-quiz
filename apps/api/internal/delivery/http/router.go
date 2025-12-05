package http

import (
	"github.com/gin-gonic/gin"
	"github.com/quanphung1120/advanced-quiz-be/internal/delivery/http/handler"
	"github.com/quanphung1120/advanced-quiz-be/internal/delivery/http/middleware"
)

type Router struct {
	collectionHandler *handler.CollectionHandler
	flashcardHandler  *handler.FlashcardHandler
	userHandler       *handler.UserHandler
}

func NewRouter(
	collectionHandler *handler.CollectionHandler,
	flashcardHandler *handler.FlashcardHandler,
	userHandler *handler.UserHandler,
) *Router {
	return &Router{
		collectionHandler: collectionHandler,
		flashcardHandler:  flashcardHandler,
		userHandler:       userHandler,
	}
}

func (r *Router) SetupRoutes(router *gin.Engine) {
	// Public routes
	router.GET("/", handler.HomeController)
	router.GET("/health", handler.HealthController)

	// API v1 group
	v1 := router.Group("/api/v1")

	// Apply Clerk authentication middleware to protected routes
	v1.Use(middleware.ClerkAuthMiddleware())
	{
		// User routes
		users := v1.Group("/users")
		{
			users.GET("/me", r.userHandler.Me)
			users.GET("/search-email-addresses", r.userHandler.SearchEmailAddresses)
		}

		// Collection routes
		collections := v1.Group("/collections")
		{
			collections.GET("/me", r.collectionHandler.GetMyCollections)
			collections.GET("/:id", r.collectionHandler.GetCollection)
			collections.POST("/", r.collectionHandler.CreateCollection)
			collections.PUT("/:id", r.collectionHandler.UpdateCollection)
			collections.DELETE("/:id", r.collectionHandler.DeleteCollection)

			// Collaborator routes
			collections.POST("/:id/collaborators", r.collectionHandler.AddCollaborator)
			collections.DELETE("/:id/collaborators/:collaboratorId", r.collectionHandler.RemoveCollaborator)

			// Flashcard routes nested under collections
			collections.GET("/:id/flashcards", r.flashcardHandler.GetCollectionFlashcards)
			collections.GET("/:id/flashcards/:flashcardId", r.flashcardHandler.GetFlashcard)
			collections.POST("/:id/flashcards", r.flashcardHandler.CreateFlashcard)
			collections.PUT("/:id/flashcards/:flashcardId", r.flashcardHandler.UpdateFlashcard)
			collections.DELETE("/:id/flashcards/:flashcardId", r.flashcardHandler.DeleteFlashcard)
		}
	}
}
