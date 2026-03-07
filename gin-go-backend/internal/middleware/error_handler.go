package middleware

import (
	apperrors "gin-go-backend/internal/errors"
	"gin-go-backend/internal/types"

	"github.com/gin-gonic/gin"
)

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		if len(c.Errors) == 0 {
			return
		}
		err := c.Errors.Last().Err
		appErr := apperrors.Normalize(err)
		problem := apperrors.ToProblem(appErr, c.Request.URL.Path, c.GetString(types.RequestIDKey), c.GetString(types.TraceIDKey), c.GetString(types.SpanIDKey))
		c.JSON(appErr.Status, problem)
	}
}

func RecoveryAsError() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered any) {
		c.Error(apperrors.InternalServerError("panic recovered"))
		c.Abort()
	})
}
