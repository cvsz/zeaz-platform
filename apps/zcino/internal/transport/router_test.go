package transport

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"game-catalog-service/internal/auth"
	"game-catalog-service/internal/middleware"

	"go.uber.org/zap"
)

func TestAdminWhoamiIncludesTenantClaim(t *testing.T) {
	manager := auth.NewTokenManager("test-secret", "test-issuer", time.Hour)
	token, err := manager.GenerateForTenant("admin", "tenant-a", []string{"admin"})
	if err != nil {
		t.Fatalf("generate token: %v", err)
	}
	router := NewRouter(nil, nil, nil, manager, nil, zap.NewNop(), true, 120, 40)
	request := httptest.NewRequest(http.MethodGet, "/admin/whoami", nil)
	request.Header.Set("Authorization", "Bearer "+token)
	request.Header.Set(middleware.TenantHeader, "tenant-a")
	response := httptest.NewRecorder()

	router.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d: %s", http.StatusOK, response.Code, response.Body.String())
	}
	var body adminIdentityResponse
	if err := json.NewDecoder(response.Body).Decode(&body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if body.UserID != "admin" || body.TenantID != "tenant-a" {
		t.Fatalf("unexpected identity response: %#v", body)
	}
}
