//go:build integration

package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"game-catalog-service/internal/auth"
	"game-catalog-service/internal/cache"
	"game-catalog-service/internal/handler"
	"game-catalog-service/internal/middleware"
	"game-catalog-service/internal/repository"
	"game-catalog-service/internal/service"
	"game-catalog-service/internal/testhelper"
	"game-catalog-service/internal/transport"

	"github.com/go-playground/validator/v10"
	"go.uber.org/zap"
)

var (
	authEnv   *testhelper.IntegrationEnv
	authClean func()
)

func TestMain(m *testing.M) {
	ctx := context.Background()
	authEnv, authClean = testhelper.MustStartContainers(ctx)
	defer authClean()
	os.Exit(m.Run())
}

func seedAuthData(ctx context.Context, t *testing.T) {
	t.Helper()
	if err := testhelper.TruncateTables(ctx, authEnv.Postgres); err != nil {
		t.Fatalf("truncate: %v", err)
	}
	if err := testhelper.FlushRedis(ctx, authEnv.Redis); err != nil {
		t.Fatalf("flush redis: %v", err)
	}
}

func authTestRouter(t *testing.T, tenantRequired bool, rpm, burst int) http.Handler {
	t.Helper()
	validate := validator.New(validator.WithRequiredStructEnabled())
	tokenManager := auth.NewTokenManager("test-secret", "test-issuer", time.Hour)
	authH := handler.NewAuthHandler(tokenManager, "admin", "admin")
	gameRepo := repository.NewPostgresGameRepository(authEnv.Postgres)
	gameCache := cache.NewRedisGameCache(authEnv.Redis, 5*time.Minute)
	catalogService := service.NewCatalogService(gameRepo, gameCache, validate, zap.NewNop())
	catalogH := handler.NewCatalogHandler(catalogService, validate, zap.NewNop())
	trackingRepo := repository.NewPostgresTrackingRepository(authEnv.Postgres)
	trackingService := service.NewTrackingService(trackingRepo, service.TrackingServiceConfig{
		BatchSize:     100,
		FlushInterval: 60 * time.Second,
		QueueSize:     1000,
	}, zap.NewNop())
	trackingService.Start(context.Background())
	trackingH := handler.NewTrackingHandler(trackingService, zap.NewNop())
	t.Cleanup(func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = trackingService.Stop(ctx)
	})
	return transport.NewRouter(catalogH, trackingH, authH, tokenManager, authEnv.Redis, zap.NewNop(), tenantRequired, rpm, burst)
}

func TestAuthFlow_TenantContinuity(t *testing.T) {
	ctx := context.Background()
	seedAuthData(ctx, t)
	router := authTestRouter(t, true, 120, 40)

	payload := `{"user_id":"admin","password":"admin"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/token", bytes.NewReader([]byte(payload)))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(middleware.TenantHeader, "tenant-a")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
	var tokenResp handler.TokenResponse
	if err := json.NewDecoder(rec.Body).Decode(&tokenResp); err != nil {
		t.Fatalf("decode token response: %v", err)
	}
	if tokenResp.AccessToken == "" {
		t.Fatal("expected access_token")
	}
	if tokenResp.TenantID != "tenant-a" {
		t.Fatalf("expected tenant_id tenant-a, got %s", tokenResp.TenantID)
	}
	if len(tokenResp.Roles) == 0 {
		t.Fatal("expected non-empty roles")
	}

	whoamiReq := httptest.NewRequest(http.MethodGet, "/admin/whoami", nil)
	whoamiReq.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)
	whoamiReq.Header.Set(middleware.TenantHeader, "tenant-a")
	whoamiRec := httptest.NewRecorder()
	router.ServeHTTP(whoamiRec, whoamiReq)

	if whoamiRec.Code != http.StatusOK {
		t.Fatalf("whoami expected 200, got %d: %s", whoamiRec.Code, whoamiRec.Body.String())
	}
	var whoami map[string]interface{}
	if err := json.NewDecoder(whoamiRec.Body).Decode(&whoami); err != nil {
		t.Fatalf("decode whoami: %v", err)
	}
	if whoami["tenant_id"] != "tenant-a" {
		t.Fatalf("expected tenant_id tenant-a, got %v", whoami["tenant_id"])
	}
	if whoami["user_id"] != "admin" {
		t.Fatalf("expected user_id admin, got %v", whoami["user_id"])
	}
}

func TestAuthFlow_TenantMismatchRejected(t *testing.T) {
	ctx := context.Background()
	seedAuthData(ctx, t)
	router := authTestRouter(t, true, 120, 40)

	payload := `{"user_id":"admin","password":"admin"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/token", bytes.NewReader([]byte(payload)))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(middleware.TenantHeader, "tenant-a")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("auth expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
	var tokenResp handler.TokenResponse
	if err := json.NewDecoder(rec.Body).Decode(&tokenResp); err != nil {
		t.Fatalf("decode token: %v", err)
	}

	whoamiReq := httptest.NewRequest(http.MethodGet, "/admin/whoami", nil)
	whoamiReq.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)
	whoamiReq.Header.Set(middleware.TenantHeader, "tenant-b")
	whoamiRec := httptest.NewRecorder()
	router.ServeHTTP(whoamiRec, whoamiReq)

	if whoamiRec.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for tenant mismatch, got %d: %s", whoamiRec.Code, whoamiRec.Body.String())
	}
}

func TestAuthFlow_RateLimitApplied(t *testing.T) {
	ctx := context.Background()
	seedAuthData(ctx, t)
	router := authTestRouter(t, true, 1, 1)

	payload := `{"user_id":"admin","password":"admin"}`
	for i := 0; i < 1; i++ {
		req := httptest.NewRequest(http.MethodPost, "/auth/token", bytes.NewReader([]byte(payload)))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set(middleware.TenantHeader, "tenant-rate")
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("request %d expected 200, got %d: %s", i+1, rec.Code, rec.Body.String())
		}
	}

	req := httptest.NewRequest(http.MethodPost, "/auth/token", bytes.NewReader([]byte(payload)))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(middleware.TenantHeader, "tenant-rate")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429, got %d: %s", rec.Code, rec.Body.String())
	}
}
