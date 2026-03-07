package errors

import "errors"

func Normalize(err error) AppError {
	if err == nil {
		return InternalServerError("unknown error")
	}
	var ae AppError
	if errors.As(err, &ae) {
		return ae
	}
	return InternalServerError("an unexpected error occurred")
}
