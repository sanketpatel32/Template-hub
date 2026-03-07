package routes

import (
	"net/http"

	"gin-go-backend/internal/types"

	"github.com/gin-gonic/gin"
)

func Health(c *gin.Context) {
	c.JSON(http.StatusOK, types.SuccessResponse[map[string]string]{Success: true, Data: map[string]string{"status": "ok"}})
}
