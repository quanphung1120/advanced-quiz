package main

import (
	"log"
	"os"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/quanphung1120/advanced-quiz-be/config"
	httpDelivery "github.com/quanphung1120/advanced-quiz-be/internal/delivery/http"
	"github.com/quanphung1120/advanced-quiz-be/internal/delivery/http/handler"
	"github.com/quanphung1120/advanced-quiz-be/internal/infrastructure/external"
	infrarepo "github.com/quanphung1120/advanced-quiz-be/internal/infrastructure/repository"
	"github.com/quanphung1120/advanced-quiz-be/internal/usecase"
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

	// Manual Dependency Injection
	
	// Initialize database
	entClient, err := config.InitializeDatabase()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer entClient.Close()

	// Initialize repositories
	collectionRepo := infrarepo.NewEntCollectionRepository(entClient)
	flashcardRepo := infrarepo.NewEntFlashcardRepository(entClient)
	userRepo := external.NewClerkUserRepository()

	// Initialize use cases
	collectionUseCase := usecase.NewCollectionUseCase(collectionRepo, userRepo)
	flashcardUseCase := usecase.NewFlashcardUseCase(flashcardRepo, collectionUseCase)
	userUseCase := usecase.NewUserUseCase(userRepo)

	// Initialize handlers
	collectionHandler := handler.NewCollectionHandler(collectionUseCase)
	flashcardHandler := handler.NewFlashcardHandler(flashcardUseCase)
	userHandler := handler.NewUserHandler(userUseCase)

	// Initialize router
	appRouter := httpDelivery.NewRouter(collectionHandler, flashcardHandler, userHandler)

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
