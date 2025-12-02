package controllers

import (
	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/models"
	"github.com/quanphung1120/advanced-quiz-be/requests"
	"github.com/quanphung1120/advanced-quiz-be/utils"
)

// GetMyCollectionsController returns all collections owned by or shared with the user
func GetMyCollectionsController(context *gin.Context) {
	userData, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || userData == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	db := utils.GetDatabase()

	// Get collections owned by the user with collaborators preloaded
	var ownedCollections []models.Collection
	db.Preload("Collaborators").Where("owner_id = ?", userData.ID).Find(&ownedCollections)

	// Get collections where user is a collaborator
	var collaborations []models.CollectionCollaborator
	db.Where("user_id = ?", userData.ID).Find(&collaborations)

	var sharedCollections []models.Collection
	if len(collaborations) > 0 {
		collectionIDs := make([]uuid.UUID, len(collaborations))
		for i, collab := range collaborations {
			collectionIDs[i] = collab.CollectionID
		}
		db.Preload("Collaborators").Where("id IN ?", collectionIDs).Find(&sharedCollections)
	}

	// Fetch collaborator emails from Clerk for owned collections
	for i := range ownedCollections {
		ownedCollections[i].Collaborators = enrichCollaboratorsWithEmail(context, ownedCollections[i].Collaborators)
	}

	// Fetch collaborator emails from Clerk for shared collections
	for i := range sharedCollections {
		sharedCollections[i].Collaborators = enrichCollaboratorsWithEmail(context, sharedCollections[i].Collaborators)
	}

	context.JSON(200, gin.H{
		"owned_collections":  ownedCollections,
		"shared_collections": sharedCollections,
		"errorMessage":       "",
	})
}

// enrichCollaboratorsWithEmail fetches user emails from Clerk and enriches collaborator data
func enrichCollaboratorsWithEmail(context *gin.Context, collaborators []models.CollectionCollaborator) []models.CollectionCollaborator {
	for i := range collaborators {
		u, err := user.Get(context.Request.Context(), collaborators[i].UserID)
		if err == nil && u != nil && len(u.EmailAddresses) > 0 {
			collaborators[i].Email = u.EmailAddresses[0].EmailAddress
		}
	}
	return collaborators
}

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

	userData, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || userData == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	collectionID := context.Param("id")
	collectionUUID, err := uuid.Parse(collectionID)
	if err != nil {
		context.JSON(400, gin.H{
			"errorMessage": "Invalid collection ID",
		})
		return
	}

	db := utils.GetDatabase()
	var collection models.Collection

	// First try to find as owner
	if db.Preload("Collaborators").Where("id = ? AND owner_id = ?", collectionUUID, userData.ID).First(&collection).Error == nil {
		// Enrich collaborators with email
		collection.Collaborators = enrichCollaboratorsWithEmail(context, collection.Collaborators)
		context.JSON(200, gin.H{
			"collection":   collection,
			"role":         "owner",
			"errorMessage": "",
		})
		return
	}

	// Check if user is a collaborator
	var collab models.CollectionCollaborator
	if db.Where("collection_id = ? AND user_id = ?", collectionUUID, userData.ID).First(&collab).Error == nil {
		db.Preload("Collaborators").First(&collection, collectionUUID)
		collection.Collaborators = enrichCollaboratorsWithEmail(context, collection.Collaborators)
		context.JSON(200, gin.H{
			"collection":   collection,
			"role":         collab.Role,
			"errorMessage": "",
		})
		return
	}

	context.JSON(404, gin.H{
		"errorMessage": "Collection not found",
	})
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
	userData, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || userData == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	collectionID := context.Param("id")
	var collection models.Collection
	db := utils.GetDatabase()
	if db.Where("id = ? AND owner_id = ?", collectionID, userData.ID).First(&collection).Error != nil {
		context.JSON(404, gin.H{
			"errorMessage": "Collection not found or you don't have permission to manage collaborators",
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

	// Look up user by email using Clerk API
	email := addCollaboratorBody.Email
	if email == "" {
		context.JSON(400, gin.H{
			"errorMessage": "Email is required",
		})
		return
	}

	// Search for user by email in Clerk
	users, err := user.List(context.Request.Context(), &user.ListParams{
		EmailAddressQuery: &email,
	})
	if err != nil {
		context.JSON(500, gin.H{
			"errorMessage": "Failed to search for user",
		})
		return
	}

	// Find exact email match
	var targetUserID string
	var targetEmail string
	for _, u := range users.Users {
		for _, emailAddr := range u.EmailAddresses {
			if emailAddr.EmailAddress == email {
				targetUserID = u.ID
				targetEmail = emailAddr.EmailAddress
				break
			}
		}
		if targetUserID != "" {
			break
		}
	}

	if targetUserID == "" {
		context.JSON(404, gin.H{
			"errorMessage": "No user found with this email address",
		})
		return
	}

	// Prevent owner from adding themselves as collaborator
	if targetUserID == userData.ID {
		context.JSON(400, gin.H{
			"errorMessage": "You cannot add yourself as a collaborator",
		})
		return
	}

	// Check if collaborator already exists
	var existingCollaborator models.CollectionCollaborator
	if db.Where("collection_id = ? AND user_id = ?", collection.ID, targetUserID).First(&existingCollaborator).Error == nil {
		context.JSON(400, gin.H{
			"errorMessage": "This user is already a collaborator",
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
		UserID:       targetUserID,
		Role:         role,
		Email:        targetEmail,
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

func RemoveCollaboratorController(context *gin.Context) {
	userData, err := utils.GetUserDataFromContext(context.Request.Context())
	if err != nil || userData == nil {
		context.JSON(401, gin.H{
			"errorMessage": "Unauthorized",
		})
		return
	}

	collectionID := context.Param("id")
	collaboratorID := context.Param("collaboratorId")

	var collection models.Collection
	db := utils.GetDatabase()
	if db.Where("id = ? AND owner_id = ?", collectionID, userData.ID).First(&collection).Error != nil {
		context.JSON(404, gin.H{
			"errorMessage": "Collection not found or you don't have permission to manage collaborators",
		})
		return
	}

	// Find and delete the collaborator
	var collaborator models.CollectionCollaborator
	if db.Where("id = ? AND collection_id = ?", collaboratorID, collection.ID).First(&collaborator).Error != nil {
		context.JSON(404, gin.H{
			"errorMessage": "Collaborator not found",
		})
		return
	}

	if db.Delete(&collaborator).Error != nil {
		context.JSON(500, gin.H{
			"errorMessage": "Failed to remove collaborator",
		})
		return
	}

	context.JSON(200, gin.H{
		"message":      "Collaborator removed successfully",
		"errorMessage": "",
	})
}
