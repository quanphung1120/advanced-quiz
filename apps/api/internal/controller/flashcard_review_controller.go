package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/ent"
	"github.com/quanphung1120/advanced-quiz-be/internal/data/request"
	"github.com/quanphung1120/advanced-quiz-be/internal/middleware"
	"github.com/quanphung1120/advanced-quiz-be/internal/service"
)

type FlashcardReviewController struct {
	reviewService service.FlashcardReviewService
}

func NewFlashcardReviewController(reviewService service.FlashcardReviewService) *FlashcardReviewController {
	return &FlashcardReviewController{
		reviewService: reviewService,
	}
}

// SubmitReview handles POST /api/v1/flashcards/:id/review
func (c *FlashcardReviewController) SubmitReview(ctx *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	flashcardIDStr := ctx.Param("id")
	flashcardID, err := uuid.Parse(flashcardIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid flashcard ID"})
		return
	}

	var req request.SubmitReviewRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid input: rating must be between 0 and 3"})
		return
	}

	rating, err := service.ValidateRating(req.Rating)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": err.Error()})
		return
	}

	review, err := c.reviewService.SubmitReview(ctx.Request.Context(), flashcardID, userID, rating)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"review":       toReviewResponse(review),
		"errorMessage": "",
	})
}

// GetDueCards handles GET /api/v1/collections/:id/due
func (c *FlashcardReviewController) GetDueCards(ctx *gin.Context) {
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

	// Parse optional limit parameter
	limit := 0
	if limitStr := ctx.Query("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	reviews, err := c.reviewService.GetDueCards(ctx.Request.Context(), collectionID, userID, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"reviews":      toReviewResponses(reviews),
		"errorMessage": "",
	})
}

// GetCollectionStats handles GET /api/v1/collections/:id/stats
func (c *FlashcardReviewController) GetCollectionStats(ctx *gin.Context) {
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

	stats, err := c.reviewService.GetCollectionStats(ctx.Request.Context(), collectionID, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"total_cards":    stats.TotalCards,
			"new_cards":      stats.NewCards,
			"learning_cards": stats.LearningCards,
			"review_cards":   stats.ReviewCards,
			"due_cards":      stats.DueCards,
			"average_ease":   stats.AverageEase,
			"total_reviews":  stats.TotalReviews,
			"total_lapses":   stats.TotalLapses,
			"mature_cards":   stats.MatureCards,
		},
		"errorMessage": "",
	})
}

// StartSession handles POST /api/v1/collections/:id/start-session
func (c *FlashcardReviewController) StartSession(ctx *gin.Context) {
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

	err = c.reviewService.StartLearningSession(ctx.Request.Context(), collectionID, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message":      "Learning session started",
		"errorMessage": "",
	})
}

// GetAllReviews handles GET /api/v1/collections/:id/reviews
func (c *FlashcardReviewController) GetAllReviews(ctx *gin.Context) {
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

	reviews, err := c.reviewService.GetAllReviewsForCollection(ctx.Request.Context(), collectionID, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"reviews":      toReviewResponses(reviews),
		"errorMessage": "",
	})
}

// ClearProgress handles DELETE /api/v1/collections/:id/progress
func (c *FlashcardReviewController) ClearProgress(ctx *gin.Context) {
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

	deleted, err := c.reviewService.ClearProgress(ctx.Request.Context(), collectionID, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"deleted":      deleted,
		"message":      "Learning progress cleared successfully",
		"errorMessage": "",
	})
}

// Helper types and functions for response formatting

type flashcardReviewResponse struct {
	ID             string              `json:"id"`
	UserID         string              `json:"user_id"`
	FlashcardID    string              `json:"flashcard_id"`
	EaseFactor     float64             `json:"ease_factor"`
	Interval       int                 `json:"interval"`
	DueAt          string              `json:"due_at"`
	Status         string              `json:"status"`
	LearningStep   int                 `json:"learning_step"`
	ReviewCount    int                 `json:"review_count"`
	LapseCount     int                 `json:"lapse_count"`
	LastReviewedAt *string             `json:"last_reviewed_at,omitempty"`
	CreatedAt      string              `json:"created_at"`
	UpdatedAt      string              `json:"updated_at"`
	Flashcard      *flashcardInReview  `json:"flashcard,omitempty"`
}

type flashcardInReview struct {
	ID       string `json:"id"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Type     string `json:"type"`
}

func toReviewResponse(review *ent.FlashcardReview) flashcardReviewResponse {
	response := flashcardReviewResponse{
		ID:           review.ID.String(),
		UserID:       review.UserID,
		FlashcardID:  review.FlashcardID.String(),
		EaseFactor:   review.EaseFactor,
		Interval:     review.Interval,
		DueAt:        review.DueAt.Format("2006-01-02T15:04:05Z07:00"),
		Status:       string(review.Status),
		LearningStep: review.LearningStep,
		ReviewCount:  review.ReviewCount,
		LapseCount:   review.LapseCount,
		CreatedAt:    review.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    review.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	if review.LastReviewedAt != nil {
		lastReviewed := review.LastReviewedAt.Format("2006-01-02T15:04:05Z07:00")
		response.LastReviewedAt = &lastReviewed
	}

	// Include flashcard if loaded
	if review.Edges.Flashcard != nil {
		response.Flashcard = &flashcardInReview{
			ID:       review.Edges.Flashcard.ID.String(),
			Question: review.Edges.Flashcard.Question,
			Answer:   review.Edges.Flashcard.Answer,
			Type:     review.Edges.Flashcard.Type,
		}
	}

	return response
}

func toReviewResponses(reviews []*ent.FlashcardReview) []flashcardReviewResponse {
	responses := make([]flashcardReviewResponse, len(reviews))
	for i, review := range reviews {
		responses[i] = toReviewResponse(review)
	}
	return responses
}
