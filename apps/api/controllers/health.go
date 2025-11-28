package controllers

import "github.com/gin-gonic/gin"

func HealthController(c *gin.Context) {

	c.Status(200)
}
