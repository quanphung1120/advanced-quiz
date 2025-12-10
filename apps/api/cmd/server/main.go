package main

import (
	"log"
	"os"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/quanphung1120/advanced-quiz-be/config"
	"github.com/quanphung1120/advanced-quiz-be/internal"
	"github.com/quanphung1120/advanced-quiz-be/internal/controller"
	"github.com/quanphung1120/advanced-quiz-be/internal/repository"
	"github.com/quanphung1120/advanced-quiz-be/internal/service"
)

func main() {
	isDevelopment := os.Getenv("GIN_MODE") != "release"
	
	if isDevelopment {
		err := godotenv.Load()
		if err != nil {
			log.Println("Warning: Error loading .env file:", err)
		}
	}

	clerkSecretKey := os.Getenv("CLERK_SECRET_KEY")
	if clerkSecretKey == "" {
		log.Fatal("CLERK_SECRET_KEY environment variable is required")
	}
	clerk.SetKey(clerkSecretKey)

	// Initialize database
	entClient, err := config.InitializeDatabase()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer entClient.Close()

	// Initialize repositories
	collectionRepo := repository.NewCollectionRepository(entClient)
	flashcardRepo := repository.NewFlashcardRepository(entClient)
	flashcardReviewRepo := repository.NewFlashcardReviewRepository(entClient)
	userRepo := repository.NewUserRepository()

	// Initialize services
	collectionService := service.NewCollectionService(collectionRepo, userRepo)
	flashcardService := service.NewFlashcardService(flashcardRepo, collectionService)
	flashcardReviewService := service.NewFlashcardReviewService(flashcardReviewRepo, flashcardRepo, collectionService)
	userService := service.NewUserService(userRepo)

	// Initialize controllers
	collectionController := controller.NewCollectionController(collectionService)
	flashcardController := controller.NewFlashcardController(flashcardService)
	flashcardReviewController := controller.NewFlashcardReviewController(flashcardReviewService)
	userController := controller.NewUserController(userService)

	// Initialize router
	appRouter := internal.NewRouter(collectionController, flashcardController, flashcardReviewController, userController)

	// Setup Gin router
	router := gin.Default()

	if isDevelopment {
		log.Println("Development mode: allowing all CORS origins")
		router.Use(cors.New(cors.Config{
			AllowOriginFunc:  func(origin string) bool { return true },
			AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
		}))
	} else {
		router.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"https://quanphungg.me", "https://www.quanphungg.me"},
			AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
		}))
	}

	appRouter.SetupRoutes(router)

	if err := router.Run(":3005"); err != nil {
		log.Fatal("Failed to start application:", err)
	}
}
