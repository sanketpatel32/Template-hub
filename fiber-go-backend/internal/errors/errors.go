package errors

import "net/http"

type AppError struct {
	Code    string
	TypeURI string
	Title   string
	Status  int
	Detail  string
}

func (e AppError) Error() string {
	if e.Detail != "" {
		return e.Detail
	}
	return e.Title
}

func NewNotFound(detail string) AppError {
	return AppError{Code: "not_found", TypeURI: "https://example.com/problems/not-found", Title: "Not Found", Status: http.StatusNotFound, Detail: detail}
}

func NewTooManyRequests(detail string) AppError {
	return AppError{Code: "rate_limited", TypeURI: "https://example.com/problems/rate-limited", Title: "Too Many Requests", Status: http.StatusTooManyRequests, Detail: detail}
}

func NewUnavailable(detail string) AppError {
	return AppError{Code: "unavailable", TypeURI: "https://example.com/problems/unavailable", Title: "Service Unavailable", Status: http.StatusServiceUnavailable, Detail: detail}
}

func NewInternal(detail string) AppError {
	return AppError{Code: "internal_error", TypeURI: "https://example.com/problems/internal", Title: "Internal Server Error", Status: http.StatusInternalServerError, Detail: detail}
}
