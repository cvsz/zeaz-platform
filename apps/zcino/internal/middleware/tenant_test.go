package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestTenantMiddlewareReturnsJSONWhenRequiredTenantMissing(t *testing.T) {
	handler := TenantMiddleware(true)(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		t.Fatal("next handler should not be called")
	}))

	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/games", nil))

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, response.Code)
	}
	if contentType := response.Header().Get("Content-Type"); contentType != "application/json" {
		t.Fatalf("expected json content type, got %q", contentType)
	}
	var body map[string]string
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if body["error"] != "missing_tenant" || body["message"] != "missing tenant" {
		t.Fatalf("unexpected error response: %#v", body)
	}
}

func TestTenantMiddlewareAttachesTenant(t *testing.T) {
	handler := TenantMiddleware(true)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if tenant := TenantID(r.Context()); tenant != "tenant-a" {
			t.Fatalf("expected tenant-a, got %q", tenant)
		}
		w.WriteHeader(http.StatusNoContent)
	}))

	request := httptest.NewRequest(http.MethodGet, "/games", nil)
	request.Header.Set(TenantHeader, " tenant-a ")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)

	if response.Code != http.StatusNoContent {
		t.Fatalf("expected status %d, got %d", http.StatusNoContent, response.Code)
	}
}
