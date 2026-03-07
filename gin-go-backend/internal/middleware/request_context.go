package middleware

import (
	"log/slog"
	"time"

	"gin-go-backend/internal/observability"
	"gin-go-backend/internal/types"

	"github.com/gin-gonic/gin"
)

func RequestContext(logger *slog.Logger, traceEnabled bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		traceID := c.GetHeader("X-Trace-Id")
		if traceID == "" {
			traceID = observability.NewID(16)
		}
		spanID := observability.NewID(8)
		c.Set(types.TraceIDKey, traceID)
		c.Set(types.SpanIDKey, spanID)
		c.Header("X-Trace-Id", traceID)
		c.Header("X-Span-Id", spanID)
		c.Next()
		duration := time.Since(start)
		requestID := c.GetString(types.RequestIDKey)
		logger.Info("request_complete", "method", c.Request.Method, "path", c.FullPath(), "status", c.Writer.Status(), "duration_ms", duration.Milliseconds(), "requestId", requestID, "traceId", traceID, "spanId", spanID)
		observability.LogTrace(c.Request.Context(), logger, traceEnabled, "trace_event", "requestId", requestID, "traceId", traceID, "spanId", spanID)
	}
}
