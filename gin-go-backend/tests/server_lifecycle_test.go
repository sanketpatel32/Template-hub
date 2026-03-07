package tests

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLifecycleShutdownMarksNotReady(t *testing.T) {
	a := newTestApp()
	if !a.Readiness.IsReady() {
		t.Fatal("expected ready")
	}
	_ = a.Shutdown(context.Background())
	if a.Readiness.IsReady() {
		t.Fatal("expected not ready after shutdown")
	}
}

func TestReady503(t *testing.T) {
	a := newTestApp()
	a.Readiness.SetReady(false)
	r := httptest.NewRecorder()
	a.Engine.ServeHTTP(r, httptest.NewRequest(http.MethodGet, "/ready", nil))
	if r.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503 got %d", r.Code)
	}
}
