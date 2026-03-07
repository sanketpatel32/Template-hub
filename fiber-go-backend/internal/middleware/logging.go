package middleware

import (
	"fmt"
	"time"

	"fiber-go-backend/internal/observability"

	fiber "github.com/gofiber/fiber/v2"
)

func RequestLogger(logger *observability.Logger, metrics *observability.Metrics) fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		dur := time.Since(start)
		status := c.Response().StatusCode()
		route := c.Route().Path
		if route == "" {
			route = c.Path()
		}
		statusText := fmt.Sprintf("%d", status)
		metrics.RequestsTotal.WithLabelValues(c.Method(), route, statusText).Inc()
		metrics.RequestDuration.WithLabelValues(c.Method(), route, statusText).Observe(dur.Seconds())

		logger.Info("request complete", map[string]any{
			"method":     c.Method(),
			"path":       c.Path(),
			"route":      route,
			"status":     status,
			"durationMs": dur.Milliseconds(),
			"requestId":  c.Locals(CtxRequestID),
			"traceId":    c.Locals(CtxTraceID),
			"spanId":     c.Locals(CtxSpanID),
		})
		return err
	}
}
