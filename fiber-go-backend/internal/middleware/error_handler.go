package middleware

import (
	"fiber-go-backend/internal/errors"
	"fiber-go-backend/internal/observability"
	"fiber-go-backend/internal/types"

	fiber "github.com/gofiber/fiber/v2"
)

func NewErrorHandler(logger *observability.Logger) fiber.ErrorHandler {
	return func(c *fiber.Ctx, err error) error {
		appErr, ok := err.(errors.AppError)
		if !ok {
			appErr = errors.NewInternal("an unexpected error occurred")
		}

		problem := types.ProblemDetails{
			Type:      appErr.TypeURI,
			Title:     appErr.Title,
			Status:    appErr.Status,
			Detail:    appErr.Detail,
			Instance:  c.Path(),
			RequestID: toString(c.Locals(CtxRequestID)),
			TraceID:   toString(c.Locals(CtxTraceID)),
			SpanID:    toString(c.Locals(CtxSpanID)),
		}

		logger.Error("request failed", map[string]any{
			"error":     err.Error(),
			"status":    appErr.Status,
			"requestId": problem.RequestID,
			"traceId":   problem.TraceID,
			"spanId":    problem.SpanID,
		})
		return c.Status(appErr.Status).JSON(problem)
	}
}

func toString(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}
