package tests

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"fiber-go-backend/internal/app"
	"fiber-go-backend/internal/types"
)

func newRuntime() *app.Runtime {
	return app.New(app.TestConfig())
}

func TestHealth(t *testing.T) {
	r := newRuntime()
	resp, err := r.App.Test(httptest.NewRequest(http.MethodGet, "/health", nil))
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatalf("health failed: %v status=%d", err, resp.StatusCode)
	}
}

func TestReadyAndShutdownReadinessFailure(t *testing.T) {
	r := newRuntime()
	resp, _ := r.App.Test(httptest.NewRequest(http.MethodGet, "/ready", nil))
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected ready 200 got %d", resp.StatusCode)
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	_ = r.Shutdown(ctx)
	resp, _ = r.App.Test(httptest.NewRequest(http.MethodGet, "/ready", nil))
	if resp.StatusCode != http.StatusServiceUnavailable {
		t.Fatalf("expected ready 503 got %d", resp.StatusCode)
	}
}

func TestPing(t *testing.T) {
	r := newRuntime()
	resp, _ := r.App.Test(httptest.NewRequest(http.MethodGet, "/api/v1/ping", nil))
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 got %d", resp.StatusCode)
	}
}

func TestUnknownRoute404(t *testing.T) {
	r := newRuntime()
	resp, _ := r.App.Test(httptest.NewRequest(http.MethodGet, "/missing", nil))
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("expected 404 got %d", resp.StatusCode)
	}
}

func TestInternal500(t *testing.T) {
	r := newRuntime()
	resp, _ := r.App.Test(httptest.NewRequest(http.MethodGet, "/api/v1/test-error", nil))
	if resp.StatusCode != http.StatusInternalServerError {
		t.Fatalf("expected 500 got %d", resp.StatusCode)
	}
	var problem types.ProblemDetails
	_ = json.NewDecoder(resp.Body).Decode(&problem)
	if problem.TraceID == "" {
		t.Fatal("expected trace id in error response")
	}
}

func TestRateLimit429(t *testing.T) {
	r := newRuntime()
	for i := 0; i < 2; i++ {
		_, _ = r.App.Test(httptest.NewRequest(http.MethodGet, "/api/v1/ping", nil))
	}
	resp, _ := r.App.Test(httptest.NewRequest(http.MethodGet, "/api/v1/ping", nil))
	if resp.StatusCode != http.StatusTooManyRequests {
		t.Fatalf("expected 429 got %d", resp.StatusCode)
	}
}

func TestMetrics(t *testing.T) {
	r := newRuntime()
	resp, _ := r.App.Test(httptest.NewRequest(http.MethodGet, "/metrics", nil))
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 got %d", resp.StatusCode)
	}
}

func TestRequestIDPropagation(t *testing.T) {
	r := newRuntime()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	req.Header.Set("X-Request-Id", "req-123")
	resp, _ := r.App.Test(req)
	if resp.Header.Get("X-Request-Id") != "req-123" {
		t.Fatalf("expected propagated request id")
	}
}

func TestOpenAPIAndDocs(t *testing.T) {
	r := newRuntime()
	resp, _ := r.App.Test(httptest.NewRequest(http.MethodGet, "/openapi.json", nil))
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 got %d", resp.StatusCode)
	}
	resp, _ = r.App.Test(httptest.NewRequest(http.MethodGet, "/docs", nil))
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 got %d", resp.StatusCode)
	}
}

func TestLifecycleHelperBehavior(t *testing.T) {
	r := newRuntime()
	if !r.Readiness.IsReady() {
		t.Fatal("runtime should start ready")
	}
	r.Readiness.SetReady(false)
	if r.Readiness.IsReady() {
		t.Fatal("runtime readiness should be false")
	}
}
