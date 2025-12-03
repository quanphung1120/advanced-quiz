package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/quanphung1120/advanced-quiz-be/src/delivery/http/dto"
	"github.com/quanphung1120/advanced-quiz-be/src/delivery/http/middleware"
	"github.com/quanphung1120/advanced-quiz-be/src/usecases"
)

type CollectionHandler struct {
	collectionUseCase *usecases.CollectionUseCase
}

func NewCollectionHandler(collectionUseCase *usecases.CollectionUseCase) *CollectionHandler {
	return &CollectionHandler{
		collectionUseCase: collectionUseCase,
	}
}

func (h *CollectionHandler) GetMyCollections(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	owned, shared, err := h.collectionUseCase.GetMyCollections(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"owned_collections":  owned,
		"shared_collections": shared,
		"errorMessage":       "",
	})
}

func (h *CollectionHandler) GetCollection(c *gin.Context) {
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

	collection, role, err := h.collectionUseCase.GetCollection(collectionID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"errorMessage": "Collection not found or access denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"collection":   collection,
		"role":         role,
		"errorMessage": "",
	})
}

func (h *CollectionHandler) CreateCollection(c *gin.Context) {
	userID, ok := middleware.GetUserIDFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"errorMessage": "Unauthorized"})
		return
	}

	var req dto.CreateCollectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid input"})
		return
	}

	_, err := h.collectionUseCase.CreateCollection(req.Name, req.Description, userID, req.IsPublic)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": "Failed to create collection"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Collection endpoint", // Original message
	})
}

func (h *CollectionHandler) UpdateCollection(c *gin.Context) {
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

	var req dto.UpdateCollectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid input"})
		return
	}

	_, err = h.collectionUseCase.UpdateCollection(collectionID, userID, req.Name, req.Description, req.IsPublic)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Update Collection endpoint",
	})
}

func (h *CollectionHandler) DeleteCollection(c *gin.Context) {
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

	err = h.collectionUseCase.DeleteCollection(collectionID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Delete Collection endpoint",
	})
}

func (h *CollectionHandler) AddCollaborator(c *gin.Context) {
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

	var req dto.AddCollaboratorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid input"})
		return
	}

	role := req.Role
	if role == "" {
		role = "viewer"
	}

	collaborator, err := h.collectionUseCase.AddCollaborator(collectionID, userID, req.Email, role)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"collaborator": collaborator,
		"errorMessage": "",
	})
}

func (h *CollectionHandler) RemoveCollaborator(c *gin.Context) {
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

	collaboratorIDStr := c.Param("collaboratorId")
	collaboratorID, err := uuid.Parse(collaboratorIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorMessage": "Invalid collaborator ID"})
		return
	}

	err = h.collectionUseCase.RemoveCollaborator(collectionID, userID, collaboratorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorMessage": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Collaborator removed successfully",
		"errorMessage": "",
	})
}
