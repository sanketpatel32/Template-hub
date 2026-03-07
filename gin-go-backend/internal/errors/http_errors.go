package errors

import "gin-go-backend/internal/types"

func ToProblem(appErr AppError, instance, requestID, traceID, spanID string) types.ProblemDetails {
	return types.ProblemDetails{
		Type: appErr.Type, Title: appErr.Title, Status: appErr.Status, Detail: appErr.Detail,
		Instance: instance, RequestID: requestID, TraceID: traceID, SpanID: spanID,
	}
}
