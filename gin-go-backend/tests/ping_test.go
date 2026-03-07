package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestPing(t *testing.T) {
	a := newTestApp()
	r := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/v1/ping", nil)
	a.Engine.ServeHTTP(r, req)
	if r.Code != http.StatusOK {
		t.Fatalf("expected 200 got %d", r.Code)
	}
}
