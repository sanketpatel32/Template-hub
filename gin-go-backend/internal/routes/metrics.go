package routes

import (
	"net/http"

	apperrors "gin-go-backend/internal/errors"
	"gin-go-backend/internal/state"
	"gin-go-backend/internal/types"

	"github.com/gin-gonic/gin"
)

func Ready(readiness *state.Readiness) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !readiness.IsReady() {
			c.Error(apperrors.ServiceUnavailableError("service not ready"))
			c.Abort()
			return
		}
		c.JSON(http.StatusOK, types.SuccessResponse[map[string]string]{Success: true, Data: map[string]string{"status": "ready"}})
	}
}
