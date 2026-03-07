package middleware

import (
	apperrors "gin-go-backend/internal/errors"

	"github.com/gin-gonic/gin"
)

func NotFoundHandler(c *gin.Context) {
	c.Error(apperrors.NotFoundError("route not found"))
	c.Abort()
}
