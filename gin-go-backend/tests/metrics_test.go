package tests

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestMetrics(t *testing.T) {
	a := newTestApp()
	a.Engine.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/health", nil))
	r := httptest.NewRecorder()
	a.Engine.ServeHTTP(r, httptest.NewRequest(http.MethodGet, "/metrics", nil))
	if r.Code != http.StatusOK {
		t.Fatalf("expected 200 got %d", r.Code)
	}
	if !strings.Contains(r.Body.String(), "http_requests_total") {
		t.Fatal("missing metrics")
	}
}
