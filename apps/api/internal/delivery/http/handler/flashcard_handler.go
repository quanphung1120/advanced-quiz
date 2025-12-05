package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/internal/delivery/http/dto"
	"github.com/quanphung1120/advanced-quiz-be/internal/delivery/http/middleware"
	"github.com/quanphung1120/advanced-quiz-be/internal/usecase"
)

type FlashcardHandler struct {
	flashcardUseCase *usecase.FlashcardUseCase
}

func NewFlashcardHandler(flashcardUseCase *usecase.FlashcardUseCase) *FlashcardHandler {
	return &FlashcardHandler{
		flashcardUseCase: flashcardUseCase,
	}
}

func (h *FlashcardHandler) GetCollectionFlashcards(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	collectionIDStr := c.Param("id")
	collectionID, err := uuid.Parse(collectionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid collection ID"})
		return
	}

	flashcards, role, err := h.flashcardUseCase.GetCollectionFlashcards(c.Request.Context(), collectionID, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"errorMessage": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"flashcards":   flashcards,
		"role":         role,
		"errorMessage": "",
	})
}

func (h *FlashcardHandler) GetFlashcard(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	flashcardIDStr := c.Param("flashcardId")
	flashcardID, err := uuid.Parse(flashcardIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid flashcard ID"})
		return
	}

	flashcard, role, err := h.flashcardUseCase.GetFlashcard(c.Request.Context(), flashcardID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"errorMessage": "Flashcard not found or access denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"flashcard":    flashcard,
		"role":         role,
		"errorMessage": "",
	})
}

func (h *FlashcardHandler) CreateFlashcard(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	collectionIDStr := c.Param("id")
	collectionID, err := uuid.Parse(collectionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid collection ID"})
		return
	}

	var req dto.CreateFlashcardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid input"})
		return
	}

	flashcard, err := h.flashcardUseCase.CreateFlashcard(c.Request.Context(), collectionID, userID, req.Question, req.Answer, req.Type)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"flashcard":    flashcard,
		"errorMessage": "",
	})
}

func (h *FlashcardHandler) UpdateFlashcard(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	flashcardIDStr := c.Param("flashcardId")
	flashcardID, err := uuid.Parse(flashcardIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid flashcard ID"})
		return
	}

	var req dto.UpdateFlashcardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid input"})
		return
	}

	flashcard, err := h.flashcardUseCase.UpdateFlashcard(c.Request.Context(), flashcardID, userID, req.Question, req.Answer, req.Type)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"flashcard":    flashcard,
		"errorMessage": "",
	})
}

func (h *FlashcardHandler) DeleteFlashcard(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	flashcardIDStr := c.Param("flashcardId")
	flashcardID, err := uuid.Parse(flashcardIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid flashcard ID"})
		return
	}

	err = h.flashcardUseCase.DeleteFlashcard(c.Request.Context(), flashcardID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Flashcard deleted successfully",
		"errorMessage": "",
	})
}
