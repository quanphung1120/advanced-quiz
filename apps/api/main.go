package main

import (
	"log"
	"os"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/quanphung1120/advanced-quiz-be/routes"
	"github.com/quanphung1120/advanced-quiz-be/utils"
)

func main() {
	// Load environment variables from .env file in development
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

	_, err := utils.InitializeDatabase()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

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

	routes.SetupRoutes(router)

	router.Run(":3005")
}
