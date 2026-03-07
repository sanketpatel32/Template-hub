package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestUnknownRoute404(t *testing.T) {
	a := newTestApp()
	r := httptest.NewRecorder()
	a.Engine.ServeHTTP(r, httptest.NewRequest(http.MethodGet, "/missing", nil))
	if r.Code != http.StatusNotFound {
		t.Fatalf("expected 404 got %d", r.Code)
	}
}

func TestNormalizedInternal500WithTrace(t *testing.T) {
	a := newTestApp()
	r := httptest.NewRecorder()
	a.Engine.ServeHTTP(r, httptest.NewRequest(http.MethodGet, "/__test/internal-error", nil))
	if r.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500 got %d", r.Code)
	}
	var body map[string]any
	_ = json.Unmarshal(r.Body.Bytes(), &body)
	if body["traceId"] == "" || body["spanId"] == "" {
		t.Fatal("trace identifiers missing")
	}
}

func TestRateLimiting429(t *testing.T) {
	b := newTestAppWithLimit(1)
	r1 := httptest.NewRecorder()
	b.Engine.ServeHTTP(r1, httptest.NewRequest(http.MethodGet, "/health", nil))
	r2 := httptest.NewRecorder()
	b.Engine.ServeHTTP(r2, httptest.NewRequest(http.MethodGet, "/health", nil))
	if r2.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429 got %d", r2.Code)
	}
}

func TestOpenAPIDocs(t *testing.T) {
	a := newTestApp()
	r1 := httptest.NewRecorder()
	a.Engine.ServeHTTP(r1, httptest.NewRequest(http.MethodGet, "/openapi.json", nil))
	if r1.Code != http.StatusOK {
		t.Fatalf("openapi expected 200 got %d", r1.Code)
	}
	r2 := httptest.NewRecorder()
	a.Engine.ServeHTTP(r2, httptest.NewRequest(http.MethodGet, "/docs", nil))
	if r2.Code != http.StatusOK {
		t.Fatalf("docs expected 200 got %d", r2.Code)
	}
}
