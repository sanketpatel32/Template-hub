package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRequestIDPropagation(t *testing.T) {
	a := newTestApp()
	r := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	req.Header.Set("X-Request-Id", "rid-123")
	a.Engine.ServeHTTP(r, req)
	if r.Header().Get("X-Request-Id") != "rid-123" {
		t.Fatal("request id not propagated")
	}
	if r.Header().Get("X-Trace-Id") == "" || r.Header().Get("X-Span-Id") == "" {
		t.Fatal("trace headers missing")
	}
}
