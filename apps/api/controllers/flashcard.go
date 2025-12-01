package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/models"
	"github.com/quanphung1120/advanced-quiz-be/requests"
	"github.com/quanphung1120/advanced-quiz-be/utils"
)

// Helper function to check if user can access a collection (owner or collaborator)
func canAccessCollection(collectionID uuid.UUID, userID string) (*models.Collection, string, error) {
	db := utils.GetDatabase()
	var collection models.Collection

	// Check if owner
	if db.Where("id = ? AND owner_id = ?", collectionID, userID).First(&collection).Error == nil {
		return &collection, "owner", nil
	}

	// Check if collaborator
	var collab models.CollectionCollaborator
	if db.Where("collection_id = ? AND user_id = ?", collectionID, userID).First(&collab).Error == nil {
		db.First(&collection, collectionID)
		return &collection, collab.Role, nil
	}

	return nil, "", nil
}

// GetCollectionFlashcardsController returns all flashcards in a collection
func GetCollectionFlashcardsController(context *gin.Context) {
	user, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || user == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	collectionIDStr := context.Param("id")
	collectionID, err := uuid.Parse(collectionIDStr)
	if err != nil {
		context.JSON(400, gin.H{
			"errorMessage": "Invalid collection ID",
		})
		return
	}

	// Check access
	_, _, err = canAccessCollection(collectionID, user.ID)
	if err != nil {
		context.JSON(403, gin.H{
			"errorMessage": "Access denied",
		})
		return
	}

	collection, role, _ := canAccessCollection(collectionID, user.ID)
	if collection == nil {
		context.JSON(404, gin.H{
			"errorMessage": "Collection not found or access denied",
		})
		return
	}

	db := utils.GetDatabase()
	var flashcards []models.Flashcard
	db.Where("collection_id = ?", collectionID).Find(&flashcards)

	context.JSON(200, gin.H{
		"flashcards":   flashcards,
		"role":         role,
		"errorMessage": "",
	})
}

// GetFlashcardController returns a single flashcard by ID
func GetFlashcardController(context *gin.Context) {
	user, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || user == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	flashcardIDStr := context.Param("flashcardId")
	flashcardID, err := uuid.Parse(flashcardIDStr)
	if err != nil {
		context.JSON(400, gin.H{
			"errorMessage": "Invalid flashcard ID",
		})
		return
	}

	db := utils.GetDatabase()
	var flashcard models.Flashcard
	if db.First(&flashcard, flashcardID).Error != nil {
		context.JSON(404, gin.H{
			"errorMessage": "Flashcard not found",
		})
		return
	}

	// Check access to the collection
	collection, role, _ := canAccessCollection(flashcard.CollectionID, user.ID)
	if collection == nil {
		context.JSON(403, gin.H{
			"errorMessage": "Access denied",
		})
		return
	}

	context.JSON(200, gin.H{
		"flashcard":    flashcard,
		"role":         role,
		"errorMessage": "",
	})
}

// CreateFlashcardController creates a new flashcard in a collection
func CreateFlashcardController(context *gin.Context) {
	user, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || user == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	collectionIDStr := context.Param("id")
	collectionID, err := uuid.Parse(collectionIDStr)
	if err != nil {
		context.JSON(400, gin.H{
			"errorMessage": "Invalid collection ID",
		})
		return
	}

	// Check access - only owner and editor can create flashcards
	collection, role, _ := canAccessCollection(collectionID, user.ID)
	if collection == nil {
		context.JSON(404, gin.H{
			"errorMessage": "Collection not found or access denied",
		})
		return
	}

	if role == "viewer" {
		context.JSON(403, gin.H{
			"errorMessage": "Viewers cannot create flashcards",
		})
		return
	}

	var body requests.CreateFlashcardRequest
	if err := context.ShouldBindBodyWithJSON(&body); err != nil {
		context.JSON(400, gin.H{
			"errorMessage": "Invalid input",
		})
		return
	}

	// Set default type if not provided
	flashcardType := body.Type
	if flashcardType == "" {
		flashcardType = "simple"
	}

	flashcard := models.Flashcard{
		Question:     body.Question,
		Answer:       body.Answer,
		Type:         flashcardType,
		CollectionID: collectionID,
		CreatedBy:    user.ID,
	}

	db := utils.GetDatabase()
	if db.Create(&flashcard).Error != nil {
		context.JSON(500, gin.H{
			"errorMessage": "Failed to create flashcard",
		})
		return
	}

	context.JSON(201, gin.H{
		"flashcard":    flashcard,
		"errorMessage": "",
	})
}

// UpdateFlashcardController updates an existing flashcard
func UpdateFlashcardController(context *gin.Context) {
	user, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || user == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	flashcardIDStr := context.Param("flashcardId")
	flashcardID, err := uuid.Parse(flashcardIDStr)
	if err != nil {
		context.JSON(400, gin.H{
			"errorMessage": "Invalid flashcard ID",
		})
		return
	}

	db := utils.GetDatabase()
	var flashcard models.Flashcard
	if db.First(&flashcard, flashcardID).Error != nil {
		context.JSON(404, gin.H{
			"errorMessage": "Flashcard not found",
		})
		return
	}

	// Check access - only owner and editor can update flashcards
	collection, role, _ := canAccessCollection(flashcard.CollectionID, user.ID)
	if collection == nil {
		context.JSON(403, gin.H{
			"errorMessage": "Access denied",
		})
		return
	}

	if role == "viewer" {
		context.JSON(403, gin.H{
			"errorMessage": "Viewers cannot update flashcards",
		})
		return
	}

	var body requests.UpdateFlashcardRequest
	if err := context.ShouldBindBodyWithJSON(&body); err != nil {
		context.JSON(400, gin.H{
			"errorMessage": "Invalid input",
		})
		return
	}

	// Update only provided fields
	if body.Question != "" {
		flashcard.Question = body.Question
	}
	if body.Answer != "" {
		flashcard.Answer = body.Answer
	}
	if body.Type != "" {
		flashcard.Type = body.Type
	}

	if db.Save(&flashcard).Error != nil {
		context.JSON(500, gin.H{
			"errorMessage": "Failed to update flashcard",
		})
		return
	}

	context.JSON(200, gin.H{
		"flashcard":    flashcard,
		"errorMessage": "",
	})
}

// DeleteFlashcardController deletes a flashcard
func DeleteFlashcardController(context *gin.Context) {
	user, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || user == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	flashcardIDStr := context.Param("flashcardId")
	flashcardID, err := uuid.Parse(flashcardIDStr)
	if err != nil {
		context.JSON(400, gin.H{
			"errorMessage": "Invalid flashcard ID",
		})
		return
	}

	db := utils.GetDatabase()
	var flashcard models.Flashcard
	if db.First(&flashcard, flashcardID).Error != nil {
		context.JSON(404, gin.H{
			"errorMessage": "Flashcard not found",
		})
		return
	}

	// Check access - only owner and editor can delete flashcards
	collection, role, _ := canAccessCollection(flashcard.CollectionID, user.ID)
	if collection == nil {
		context.JSON(403, gin.H{
			"errorMessage": "Access denied",
		})
		return
	}

	if role == "viewer" {
		context.JSON(403, gin.H{
			"errorMessage": "Viewers cannot delete flashcards",
		})
		return
	}

	if db.Delete(&flashcard).Error != nil {
		context.JSON(500, gin.H{
			"errorMessage": "Failed to delete flashcard",
		})
		return
	}

	context.JSON(200, gin.H{
		"message": "Flashcard deleted successfully",
	})
}
