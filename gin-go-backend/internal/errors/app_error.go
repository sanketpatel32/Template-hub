package errors

type AppError struct {
	Type   string
	Title  string
	Status int
	Detail string
}

func (e AppError) Error() string { return e.Detail }

func ValidationError(detail string) AppError {
	return AppError{Type: "validation_error", Title: "Validation Error", Status: 400, Detail: detail}
}
func AuthenticationError(detail string) AppError {
	return AppError{Type: "authentication_error", Title: "Authentication Error", Status: 401, Detail: detail}
}
func AuthorizationError(detail string) AppError {
	return AppError{Type: "authorization_error", Title: "Authorization Error", Status: 403, Detail: detail}
}
func NotFoundError(detail string) AppError {
	return AppError{Type: "not_found", Title: "Not Found", Status: 404, Detail: detail}
}
func ConflictError(detail string) AppError {
	return AppError{Type: "conflict", Title: "Conflict", Status: 409, Detail: detail}
}
func RateLimitExceededError(detail string) AppError {
	return AppError{Type: "rate_limited", Title: "Too Many Requests", Status: 429, Detail: detail}
}
func ExternalServiceError(detail string) AppError {
	return AppError{Type: "external_service_error", Title: "Bad Gateway", Status: 502, Detail: detail}
}
func ServiceUnavailableError(detail string) AppError {
	return AppError{Type: "service_unavailable", Title: "Service Unavailable", Status: 503, Detail: detail}
}
func InternalServerError(detail string) AppError {
	return AppError{Type: "internal_server_error", Title: "Internal Server Error", Status: 500, Detail: detail}
}
