package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/internal/data/request"
	"github.com/quanphung1120/advanced-quiz-be/internal/middleware"
	"github.com/quanphung1120/advanced-quiz-be/internal/service"
)

type CollectionController struct {
	collectionService service.CollectionService
}

func NewCollectionController(collectionService service.CollectionService) *CollectionController {
	return &CollectionController{
		collectionService: collectionService,
	}
}

func (c *CollectionController) GetMyCollections(ctx *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	owned, shared, err := c.collectionService.GetMyCollections(ctx.Request.Context(), userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"owned_collections":  owned,
		"shared_collections": shared,
		"errorMessage":       "",
	})
}

func (c *CollectionController) GetCollection(ctx *gin.Context) {
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

	collection, role, err := c.collectionService.GetCollection(ctx.Request.Context(), collectionID, userID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"errorMessage": "Collection not found or access denied"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"collection":   collection,
		"role":         role,
		"errorMessage": "",
	})
}

func (c *CollectionController) CreateCollection(ctx *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	var req request.CreateCollectionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid input"})
		return
	}

	collection, err := c.collectionService.CreateCollection(ctx.Request.Context(), req.Name, req.Description, userID, req.IsPublic)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "Failed to create collection"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"collection":   collection,
		"errorMessage": "",
	})
}

func (c *CollectionController) UpdateCollection(ctx *gin.Context) {
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

	var req request.UpdateCollectionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid input"})
		return
	}

	collection, err := c.collectionService.UpdateCollection(ctx.Request.Context(), collectionID, userID, req.Name, req.Description, req.IsPublic)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"collection":   collection,
		"errorMessage": "",
	})
}

func (c *CollectionController) DeleteCollection(ctx *gin.Context) {
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

	err = c.collectionService.DeleteCollection(ctx.Request.Context(), collectionID, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message":      "Collection deleted successfully",
		"errorMessage": "",
	})
}

func (c *CollectionController) AddCollaborator(ctx *gin.Context) {
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

	var req request.AddCollaboratorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid input"})
		return
	}

	role := req.Role
	if role == "" {
		role = "viewer"
	}

	collaborator, err := c.collectionService.AddCollaborator(ctx.Request.Context(), collectionID, userID, req.Email, role)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"collaborator": collaborator,
		"errorMessage": "",
	})
}

func (c *CollectionController) RemoveCollaborator(ctx *gin.Context) {
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

	collaboratorIDStr := ctx.Param("collaboratorId")
	collaboratorID, err := uuid.Parse(collaboratorIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid collaborator ID"})
		return
	}

	err = c.collectionService.RemoveCollaborator(ctx.Request.Context(), collectionID, userID, collaboratorID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message":      "Collaborator removed successfully",
		"errorMessage": "",
	})
}
