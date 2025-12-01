package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/quanphung1120/advanced-quiz-be/models"
	"github.com/quanphung1120/advanced-quiz-be/requests"
	"github.com/quanphung1120/advanced-quiz-be/utils"
)

func GetCollectionsController(context *gin.Context) {
	user, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || user == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	var collections []models.Collection
	db := utils.GetDatabase()
	if db.Where("owner_id = ?", user.ID).Find(&collections).Error != nil {
		context.JSON(500, gin.H{
			"errorMessage": "Failed to fetch collections",
		})
		return
	}

	context.JSON(200, gin.H{
		"collections":  collections,
		"errorMessage": "",
	})
}

func GetCollectionController(context *gin.Context) {

	user, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || user == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	collectionID := context.Param("id")
	var collection models.Collection
	db := utils.GetDatabase()
	if db.Where("id = ? AND owner_id = ?", collectionID, user.ID).First(&collection).Error != nil {
		context.JSON(404, gin.H{
			"errorMessage": "Collection not found",
		})
	} else {
		context.JSON(200, gin.H{
			"collection":   collection,
			"errorMessage": "",
		})
	}
}

func CreateCollectionController(context *gin.Context) {
	user, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || user == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	var collectionCreateBody requests.CreateCollectionRequest
	err = context.ShouldBindBodyWithJSON(&collectionCreateBody)
	if err != nil {
		context.JSON(400, gin.H{
			"errorMessage": "Invalid input",
		})
		return
	}

	collection := models.Collection{
		Name:        collectionCreateBody.Name,
		Description: collectionCreateBody.Description,
		OwnerID:     user.ID,
	}

	db := utils.GetDatabase()
	if db.Create(&collection).Error != nil {
		context.JSON(500, gin.H{
			"errorMessage": "Failed to create collection",
		})
		return
	}

	context.JSON(200, gin.H{
		"message": "Collection endpoint",
	})
}

func UpdateCollectionController(context *gin.Context) {
	user, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || user == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	collectionID := context.Param("id")
	var collection models.Collection
	db := utils.GetDatabase()
	if db.Where("id = ? AND owner_id = ?", collectionID, user.ID).First(&collection).Error != nil {
		context.JSON(404, gin.H{
			"errorMessage": "Collection not found",
		})
		return
	}

	// Bind update data
	var collectionUpdateBody requests.UpdateCollectionRequest
	err = context.ShouldBindBodyWithJSON(&collectionUpdateBody)
	if err != nil {
		context.JSON(400, gin.H{
			"errorMessage": "Invalid input",
		})
		return
	}

	if collectionUpdateBody.Name != "" {
		collection.Name = collectionUpdateBody.Name
	}
	if collectionUpdateBody.Description != "" {
		collection.Description = collectionUpdateBody.Description
	}

	// Save updates
	if db.Save(&collection).Error != nil {
		context.JSON(500, gin.H{
			"errorMessage": "Failed to update collection",
		})
		return
	}

	context.JSON(200, gin.H{
		"message": "Update Collection endpoint",
	})
}

func DeleteCollectionController(context *gin.Context) {
	user, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || user == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	collectionID := context.Param("id")
	var collection models.Collection
	db := utils.GetDatabase()
	if db.Where("id = ? AND owner_id = ?", collectionID, user.ID).First(&collection).Error != nil {
		context.JSON(404, gin.H{
			"errorMessage": "Collection not found",
		})
		return
	}

	if db.Delete(&collection).Error != nil {
		context.JSON(500, gin.H{
			"errorMessage": "Failed to delete collection",
		})
		return
	}

	context.JSON(200, gin.H{
		"message": "Delete Collection endpoint",
	})
}

func AddCollaboratorController(context *gin.Context) {
	user, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || user == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	collectionID := context.Param("id")
	var collection models.Collection
	db := utils.GetDatabase()
	if db.Where("id = ? AND owner_id = ?", collectionID, user.ID).First(&collection).Error != nil {
		context.JSON(404, gin.H{
			"errorMessage": "Collection not found",
		})
		return
	}

	var addCollaboratorBody requests.AddCollaboratorRequest
	err = context.ShouldBindBodyWithJSON(&addCollaboratorBody)
	if err != nil {
		context.JSON(400, gin.H{
			"errorMessage": "Invalid input",
		})
		return
	}

	// Prevent owner from adding themselves as collaborator
	if addCollaboratorBody.UserID == user.ID {
		context.JSON(400, gin.H{
			"errorMessage": "Owner cannot be added as a collaborator",
		})
		return
	}

	// Check if collaborator already exists
	var existingCollaborator models.CollectionCollaborator
	if db.Where("collection_id = ? AND user_id = ?", collection.ID, addCollaboratorBody.UserID).First(&existingCollaborator).Error == nil {
		context.JSON(400, gin.H{
			"errorMessage": "User is already a collaborator",
		})
		return
	}

	// Default role to "viewer" if not specified
	role := addCollaboratorBody.Role
	if role == "" {
		role = "viewer"
	}

	// Validate role
	if role != "viewer" && role != "editor" && role != "admin" {
		context.JSON(400, gin.H{
			"errorMessage": "Invalid role. Must be 'viewer', 'editor', or 'admin'",
		})
		return
	}

	// Create collaborator
	collaborator := models.CollectionCollaborator{
		CollectionID: collection.ID,
		UserID:       addCollaboratorBody.UserID,
		Role:         role,
	}

	if db.Create(&collaborator).Error != nil {
		context.JSON(500, gin.H{
			"errorMessage": "Failed to add collaborator",
		})
		return
	}

	context.JSON(200, gin.H{
		"collaborator": collaborator,
		"errorMessage": "",
	})
}
