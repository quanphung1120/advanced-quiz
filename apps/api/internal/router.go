package internal

import (
	"github.com/gin-gonic/gin"
	"github.com/quanphung1120/advanced-quiz-be/internal/controller"
	"github.com/quanphung1120/advanced-quiz-be/internal/middleware"
)

type Router struct {
	collectionController      *controller.CollectionController
	flashcardController       *controller.FlashcardController
	flashcardReviewController *controller.FlashcardReviewController
	userController            *controller.UserController
}

func NewRouter(
	collectionController *controller.CollectionController,
	flashcardController *controller.FlashcardController,
	flashcardReviewController *controller.FlashcardReviewController,
	userController *controller.UserController,
) *Router {
	return &Router{
		collectionController:      collectionController,
		flashcardController:       flashcardController,
		flashcardReviewController: flashcardReviewController,
		userController:            userController,
	}
}

func (r *Router) SetupRoutes(router *gin.Engine) {
	router.GET("/", controller.HomeController)
	router.GET("/health", controller.HealthController)

	v1 := router.Group("/api/v1")

	v1.Use(middleware.ClerkAuthMiddleware())
	{
		users := v1.Group("/users")
		{
			users.GET("/me", r.userController.Me)
			users.GET("/search-email-addresses", r.userController.SearchEmailAddresses)
		}

		collections := v1.Group("/collections")
		{
			collections.POST("/:id/collaborators", r.collectionController.AddCollaborator)
			collections.DELETE("/:id/collaborators/:collaboratorId", r.collectionController.RemoveCollaborator)

			collections.GET("/:id/flashcards", r.flashcardController.GetCollectionFlashcards)
			collections.GET("/:id/flashcards/:flashcardId", r.flashcardController.GetFlashcard)
			collections.POST("/:id/flashcards", r.flashcardController.CreateFlashcard)
			collections.PUT("/:id/flashcards/:flashcardId", r.flashcardController.UpdateFlashcard)
			collections.DELETE("/:id/flashcards/:flashcardId", r.flashcardController.DeleteFlashcard)

			collections.POST("/:id/start-session", r.flashcardReviewController.StartSession)
			collections.GET("/:id/due", r.flashcardReviewController.GetDueCards)
			collections.GET("/:id/stats", r.flashcardReviewController.GetCollectionStats)
			collections.GET("/:id/reviews", r.flashcardReviewController.GetAllReviews)
			collections.DELETE("/:id/progress", r.flashcardReviewController.ClearProgress)

			collections.GET("/me", r.collectionController.GetMyCollections)
			collections.POST("/", r.collectionController.CreateCollection)
			collections.GET("/:id", r.collectionController.GetCollection)
			collections.PUT("/:id", r.collectionController.UpdateCollection)
			collections.DELETE("/:id", r.collectionController.DeleteCollection)
		}

		flashcards := v1.Group("/flashcards")
		{
			flashcards.POST("/:id/review", r.flashcardReviewController.SubmitReview)
		}
	}
}

