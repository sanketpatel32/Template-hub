package middleware

import (
	"strconv"
	"time"

	"fiber-go-backend/internal/observability"

	fiber "github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

const (
	CtxRequestID = "requestId"
	CtxTraceID   = "traceId"
	CtxSpanID    = "spanId"
	CtxStart     = "requestStart"
)

func RequestID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		requestID := c.Get("X-Request-Id")
		if requestID == "" {
			requestID = uuid.NewString()
		}
		c.Set("X-Request-Id", requestID)
		c.Locals(CtxRequestID, requestID)
		return c.Next()
	}
}

func TraceContext(traceEnabled bool) fiber.Handler {
	return func(c *fiber.Ctx) error {
		traceID := c.Get("X-Trace-Id")
		if traceID == "" {
			traceID = observability.NewTraceID()
		}
		spanID := observability.NewSpanID()
		c.Locals(CtxTraceID, traceID)
		c.Locals(CtxSpanID, spanID)
		c.Locals(CtxStart, time.Now())
		c.Set("X-Trace-Id", traceID)
		c.Set("X-Span-Id", spanID)

		err := c.Next()
		if traceEnabled {
			dur := time.Since(c.Locals(CtxStart).(time.Time)).Milliseconds()
			c.Append("X-Trace-Duration-Ms", strconv.FormatInt(dur, 10))
		}
		return err
	}
}
