package tests

import (
	"errors"
	"testing"

	apperrors "gin-go-backend/internal/errors"
)

func TestErrorMapNormalize(t *testing.T) {
	e := apperrors.Normalize(errors.New("x"))
	if e.Status != 500 {
		t.Fatalf("expected 500 got %d", e.Status)
	}
}
