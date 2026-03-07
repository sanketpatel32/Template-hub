package middleware

import (
	"gin-go-backend/internal/observability"
	"gin-go-backend/internal/types"

	"github.com/gin-gonic/gin"
)

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		rid := c.GetHeader("X-Request-Id")
		if rid == "" {
			rid = observability.NewID(8)
		}
		c.Set(types.RequestIDKey, rid)
		c.Header("X-Request-Id", rid)
		c.Next()
	}
}
