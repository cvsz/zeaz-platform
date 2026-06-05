package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"game-catalog-service/internal/auth"
	"game-catalog-service/internal/middleware"
)

func TestAuthHandlerBindsTokenToRequestTenant(t *testing.T) {
	manager := auth.NewTokenManager("test-secret", "test-issuer", time.Hour)
	authHandler := NewAuthHandler(manager, "admin", "admin")
	handler := middleware.TenantMiddleware(true)(http.HandlerFunc(authHandler.Token))
	request := httptest.NewRequest(http.MethodPost, "/auth/token", strings.NewReader(`{"user_id":"admin","password":"admin"}`))
	request.Header.Set(middleware.TenantHeader, "tenant-a")
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d: %s", http.StatusOK, response.Code, response.Body.String())
	}
	var body TokenResponse
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if body.TenantID != "tenant-a" {
		t.Fatalf("expected tenant_id tenant-a, got %q", body.TenantID)
	}
	claims, err := manager.Validate(body.AccessToken)
	if err != nil {
		t.Fatalf("validate token: %v", err)
	}
	if claims.TenantID != "tenant-a" {
		t.Fatalf("expected claim tenant tenant-a, got %q", claims.TenantID)
	}
}
