package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealth(t *testing.T) {
	a := newTestApp()
	r := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/health", nil)
	a.Engine.ServeHTTP(r, req)
	if r.Code != http.StatusOK {
		t.Fatalf("expected 200 got %d", r.Code)
	}
	var body map[string]any
	_ = json.Unmarshal(r.Body.Bytes(), &body)
	if !body["success"].(bool) {
		t.Fatal("success false")
	}
}
