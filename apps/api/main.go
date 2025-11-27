package main

import (
	"github.com/gin-gonic/gin"
	"github.com/quanphung1120/advanced-quiz-be/middlewares"
	"github.com/quanphung1120/advanced-quiz-be/routes"
)

func main() {
	router := gin.Default()

	router.Use(middlewares.Logger())
	routes.SetupRoutes(router)

	router.Run(":8080")
}
