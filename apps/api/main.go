package main

import (
	"log"
	"os"

	"github.com/clerk/clerk-sdk-go/v2"
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
	routes.SetupRoutes(router)

	router.Run(":3005")
}
