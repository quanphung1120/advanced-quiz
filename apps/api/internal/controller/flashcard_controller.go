package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/internal/data/request"
	"github.com/quanphung1120/advanced-quiz-be/internal/middleware"
	"github.com/quanphung1120/advanced-quiz-be/internal/service"
)

type FlashcardController struct {
	flashcardService service.FlashcardService
}

func NewFlashcardController(flashcardService service.FlashcardService) *FlashcardController {
	return &FlashcardController{
		flashcardService: flashcardService,
	}
}

func (c *FlashcardController) GetCollectionFlashcards(ctx *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	collectionIDStr := ctx.Param("id")
	collectionID, err := uuid.Parse(collectionIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid collection ID"})
		return
	}

	flashcards, role, err := c.flashcardService.GetCollectionFlashcards(ctx.Request.Context(), collectionID, userID)
	if err != nil {
		ctx.JSON(http.StatusForbidden, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"flashcards":   flashcards,
		"role":         role,
		"errorMessage": "",
	})
}

func (c *FlashcardController) GetFlashcard(ctx *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	flashcardIDStr := ctx.Param("flashcardId")
	flashcardID, err := uuid.Parse(flashcardIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid flashcard ID"})
		return
	}

	flashcard, role, err := c.flashcardService.GetFlashcard(ctx.Request.Context(), flashcardID, userID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"errorMessage": "Flashcard not found or access denied"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"flashcard":    flashcard,
		"role":         role,
		"errorMessage": "",
	})
}

func (c *FlashcardController) CreateFlashcard(ctx *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	collectionIDStr := ctx.Param("id")
	collectionID, err := uuid.Parse(collectionIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid collection ID"})
		return
	}

	var req request.CreateFlashcardRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid input"})
		return
	}

	flashcard, err := c.flashcardService.CreateFlashcard(ctx.Request.Context(), collectionID, userID, req.Question, req.Answer, req.Type)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"flashcard":    flashcard,
		"errorMessage": "",
	})
}

func (c *FlashcardController) UpdateFlashcard(ctx *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	flashcardIDStr := ctx.Param("flashcardId")
	flashcardID, err := uuid.Parse(flashcardIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid flashcard ID"})
		return
	}

	var req request.UpdateFlashcardRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid input"})
		return
	}

	flashcard, err := c.flashcardService.UpdateFlashcard(ctx.Request.Context(), flashcardID, userID, req.Question, req.Answer, req.Type)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"flashcard":    flashcard,
		"errorMessage": "",
	})
}

func (c *FlashcardController) DeleteFlashcard(ctx *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	flashcardIDStr := ctx.Param("flashcardId")
	flashcardID, err := uuid.Parse(flashcardIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid flashcard ID"})
		return
	}

	err = c.flashcardService.DeleteFlashcard(ctx.Request.Context(), flashcardID, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message":      "Flashcard deleted successfully",
		"errorMessage": "",
	})
}
