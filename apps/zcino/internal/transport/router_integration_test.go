//go:build integration

package transport

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

	"github.com/go-playground/validator/v10"
	"go.uber.org/zap"
)

var (
	routerEnv   *testhelper.IntegrationEnv
	routerClean func()
)

func TestMain(m *testing.M) {
	ctx := context.Background()
	routerEnv, routerClean = testhelper.MustStartContainers(ctx)
	defer routerClean()
	os.Exit(m.Run())
}

func seedRouterData(ctx context.Context, t *testing.T) {
	t.Helper()
	if err := testhelper.TruncateTables(ctx, routerEnv.Postgres); err != nil {
		t.Fatalf("truncate: %v", err)
	}
	if err := testhelper.FlushRedis(ctx, routerEnv.Redis); err != nil {
		t.Fatalf("flush redis: %v", err)
	}
	_, err := routerEnv.Postgres.Exec(ctx, `
INSERT INTO providers (id, name, is_active) VALUES
	('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Acme Gaming', TRUE),
	('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'TableWorks', TRUE)
ON CONFLICT (id) DO NOTHING`)
	if err != nil {
		t.Fatalf("seed providers: %v", err)
	}
	_, err = routerEnv.Postgres.Exec(ctx, `
INSERT INTO games (id, provider_id, name, provider, category, rtp, volatility, thumbnail_url, is_active) VALUES
	('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Golden Spins',    'Acme Gaming', 'slots',    96.50, 'medium', 'https://cdn.example.com/games/golden-spins.png',   TRUE),
	('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Roulette Royale', 'TableWorks',  'roulette', 97.30, 'low',    'https://cdn.example.com/games/roulette-royale.png', TRUE),
	('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dragon Fortune',  'Acme Gaming', 'slots',    95.10, 'high',   'https://cdn.example.com/games/dragon-fortune.png',  TRUE)
ON CONFLICT (id) DO NOTHING`)
	if err != nil {
		t.Fatalf("seed games: %v", err)
	}
}

func newFullRouter(t *testing.T, tenantRequired bool, rpm, burst int) http.Handler {
	t.Helper()
	validate := validator.New(validator.WithRequiredStructEnabled())
	tokenManager := auth.NewTokenManager("test-secret", "test-issuer", time.Hour)
	authHandler := handler.NewAuthHandler(tokenManager, "admin", "admin")
	gameRepo := repository.NewPostgresGameRepository(routerEnv.Postgres)
	gameCache := cache.NewRedisGameCache(routerEnv.Redis, 5*time.Minute)
	catalogService := service.NewCatalogService(gameRepo, gameCache, validate, zap.NewNop())
	catalogHandler := handler.NewCatalogHandler(catalogService, validate, zap.NewNop())
	trackingRepo := repository.NewPostgresTrackingRepository(routerEnv.Postgres)
	trackingService := service.NewTrackingService(trackingRepo, service.TrackingServiceConfig{
		BatchSize:     100,
		FlushInterval: 5 * time.Second,
		QueueSize:     1000,
	}, zap.NewNop())
	trackingService.Start(context.Background())
	trackingHandler := handler.NewTrackingHandler(trackingService, zap.NewNop())

	t.Cleanup(func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = trackingService.Stop(ctx)
	})

	return NewRouter(catalogHandler, trackingHandler, authHandler, tokenManager, routerEnv.Redis, zap.NewNop(), tenantRequired, rpm, burst)
}

func TestRouter_Healthz(t *testing.T) {
	seedRouterData(context.Background(), t)
	router := newFullRouter(t, false, 120, 40)

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", rec.Code)
	}
}

func TestRouter_ListGames(t *testing.T) {
	seedRouterData(context.Background(), t)
	router := newFullRouter(t, false, 120, 40)

	req := httptest.NewRequest(http.MethodGet, "/games", nil)
	req.Header.Set(middleware.TenantHeader, "tenant-a")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
	var body map[string]any
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	items, ok := body["items"].([]any)
	if !ok {
		t.Fatal("expected items array")
	}
	if len(items) != 3 {
		t.Fatalf("expected 3 games, got %d", len(items))
	}
}

func TestRouter_ListGames_MissingTenant(t *testing.T) {
	seedRouterData(context.Background(), t)
	router := newFullRouter(t, true, 120, 40)

	req := httptest.NewRequest(http.MethodGet, "/games", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", rec.Code, rec.Body.String())
	}
	var body map[string]string
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body["error"] != "missing_tenant" {
		t.Fatalf("expected missing_tenant error, got %s", body["error"])
	}
}

func TestRouter_GetGameByID(t *testing.T) {
	seedRouterData(context.Background(), t)
	router := newFullRouter(t, false, 120, 40)

	req := httptest.NewRequest(http.MethodGet, "/games/11111111-1111-1111-1111-111111111111", nil)
	req.Header.Set(middleware.TenantHeader, "tenant-a")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
	var body map[string]any
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body["name"] != "Golden Spins" {
		t.Fatalf("expected Golden Spins, got %v", body["name"])
	}
}

func TestRouter_GetGameByID_NotFound(t *testing.T) {
	seedRouterData(context.Background(), t)
	router := newFullRouter(t, false, 120, 40)

	req := httptest.NewRequest(http.MethodGet, "/games/00000000-0000-0000-0000-000000000000", nil)
	req.Header.Set(middleware.TenantHeader, "tenant-a")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRouter_ListProviders(t *testing.T) {
	seedRouterData(context.Background(), t)
	router := newFullRouter(t, false, 120, 40)

	req := httptest.NewRequest(http.MethodGet, "/providers", nil)
	req.Header.Set(middleware.TenantHeader, "tenant-a")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
	var body map[string][]string
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	providers := body["providers"]
	if len(providers) != 2 {
		t.Fatalf("expected 2 providers, got %d", len(providers))
	}
}

func TestRouter_AuthToken_Valid(t *testing.T) {
	seedRouterData(context.Background(), t)
	router := newFullRouter(t, false, 120, 40)

	payload := `{"user_id":"admin","password":"admin"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/token", bytes.NewReader([]byte(payload)))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(middleware.TenantHeader, "tenant-a")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}
	var body map[string]any
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body["access_token"] == "" {
		t.Fatal("expected access_token in response")
	}
	if body["token_type"] != "Bearer" {
		t.Fatalf("expected Bearer token_type, got %v", body["token_type"])
	}
}

func TestRouter_AuthToken_WrongPassword(t *testing.T) {
	seedRouterData(context.Background(), t)
	router := newFullRouter(t, false, 120, 40)

	payload := `{"user_id":"admin","password":"wrongpass"}`
	req := httptest.NewRequest(http.MethodPost, "/auth/token", bytes.NewReader([]byte(payload)))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRouter_AdminWhoami(t *testing.T) {
	seedRouterData(context.Background(), t)
	router := newFullRouter(t, false, 120, 40)

	payload := `{"user_id":"admin","password":"admin"}`
	authReq := httptest.NewRequest(http.MethodPost, "/auth/token", bytes.NewReader([]byte(payload)))
	authReq.Header.Set("Content-Type", "application/json")
	authReq.Header.Set(middleware.TenantHeader, "tenant-a")
	authRec := httptest.NewRecorder()
	router.ServeHTTP(authRec, authReq)
	if authRec.Code != http.StatusOK {
		t.Fatalf("auth failed: %d: %s", authRec.Code, authRec.Body.String())
	}
	var tokenResp map[string]any
	if err := json.NewDecoder(authRec.Body).Decode(&tokenResp); err != nil {
		t.Fatalf("decode auth: %v", err)
	}
	token := tokenResp["access_token"]

	whoamiReq := httptest.NewRequest(http.MethodGet, "/admin/whoami", nil)
	whoamiReq.Header.Set("Authorization", "Bearer "+token.(string))
	whoamiReq.Header.Set(middleware.TenantHeader, "tenant-a")
	whoamiRec := httptest.NewRecorder()
	router.ServeHTTP(whoamiRec, whoamiReq)

	if whoamiRec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", whoamiRec.Code, whoamiRec.Body.String())
	}
	var whoami adminIdentityResponse
	if err := json.NewDecoder(whoamiRec.Body).Decode(&whoami); err != nil {
		t.Fatalf("decode whoami: %v", err)
	}
	if whoami.UserID != "admin" {
		t.Fatalf("expected user_id admin, got %s", whoami.UserID)
	}
	if whoami.TenantID != "tenant-a" {
		t.Fatalf("expected tenant_id tenant-a, got %s", whoami.TenantID)
	}
}

func TestRouter_TrackImpression(t *testing.T) {
	seedRouterData(context.Background(), t)
	router := newFullRouter(t, false, 120, 40)

	payload := `{"game_id":"11111111-1111-1111-1111-111111111111","session_id":"sess-test-impression"}`
	req := httptest.NewRequest(http.MethodPost, "/track/impression", bytes.NewReader([]byte(payload)))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(middleware.TenantHeader, "tenant-a")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusAccepted {
		t.Fatalf("expected 202, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRouter_TrackClick(t *testing.T) {
	seedRouterData(context.Background(), t)
	router := newFullRouter(t, false, 120, 40)

	payload := `{"game_id":"11111111-1111-1111-1111-111111111111","session_id":"sess-test-click","click_target":"play_button"}`
	req := httptest.NewRequest(http.MethodPost, "/track/click", bytes.NewReader([]byte(payload)))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(middleware.TenantHeader, "tenant-a")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusAccepted {
		t.Fatalf("expected 202, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRouter_TrackingDataPersisted(t *testing.T) {
	ctx := context.Background()
	seedRouterData(ctx, t)

	validate := validator.New(validator.WithRequiredStructEnabled())
	tokenManager := auth.NewTokenManager("test-secret", "test-issuer", time.Hour)
	authHandler := handler.NewAuthHandler(tokenManager, "admin", "admin")
	gameRepo := repository.NewPostgresGameRepository(routerEnv.Postgres)
	gameCache := cache.NewRedisGameCache(routerEnv.Redis, 5*time.Minute)
	catalogService := service.NewCatalogService(gameRepo, gameCache, validate, zap.NewNop())
	catalogHandler := handler.NewCatalogHandler(catalogService, validate, zap.NewNop())
	trackingRepo := repository.NewPostgresTrackingRepository(routerEnv.Postgres)
	trackingService := service.NewTrackingService(trackingRepo, service.TrackingServiceConfig{
		BatchSize:     10,
		FlushInterval: 100 * time.Millisecond,
		QueueSize:     100,
	}, zap.NewNop())
	trackingService.Start(ctx)
	trackingHandler := handler.NewTrackingHandler(trackingService, zap.NewNop())

	router := NewRouter(catalogHandler, trackingHandler, authHandler, tokenManager, routerEnv.Redis, zap.NewNop(), false, 120, 40)

	payload := `{"game_id":"11111111-1111-1111-1111-111111111111","session_id":"sess-persist","click_target":"play_btn"}`
	req := httptest.NewRequest(http.MethodPost, "/track/click", bytes.NewReader([]byte(payload)))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(middleware.TenantHeader, "tenant-persist")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	if rec.Code != http.StatusAccepted {
		t.Fatalf("expected 202, got %d: %s", rec.Code, rec.Body.String())
	}

	stopCtx, stopCancel := context.WithTimeout(ctx, 5*time.Second)
	defer stopCancel()
	if err := trackingService.Stop(stopCtx); err != nil {
		t.Fatalf("stop tracking: %v", err)
	}

	var count int
	if err := routerEnv.Postgres.QueryRow(ctx, `SELECT COUNT(*) FROM tracking_events WHERE tenant_id = 'tenant-persist'`).Scan(&count); err != nil {
		t.Fatalf("query count: %v", err)
	}
	if count != 1 {
		t.Fatalf("expected 1 persisted event, got %d", count)
	}
}

func TestRouter_RateLimit_RedisBacked(t *testing.T) {
	seedRouterData(context.Background(), t)

	tokenManager := auth.NewTokenManager("test-secret", "test-issuer", time.Hour)
	authHandler := handler.NewAuthHandler(tokenManager, "admin", "admin")
	router := NewRouter(nil, nil, authHandler, tokenManager, routerEnv.Redis, zap.NewNop(), false, 1, 1)

	for i := 0; i < 1; i++ {
		req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)
		if rec.Code != http.StatusNoContent {
			t.Fatalf("request %d expected 204, got %d", i+1, rec.Code)
		}
	}

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRouter_PolicyGuard_BlocksWallet(t *testing.T) {
	seedRouterData(context.Background(), t)
	router := newFullRouter(t, false, 120, 40)

	payload := `{"game_id":"11111111-1111-1111-1111-111111111111","session_id":"sess-wallet"}`
	req := httptest.NewRequest(http.MethodPost, "/track/impression", bytes.NewReader([]byte(payload)))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set(middleware.TenantHeader, "tenant-a")
	req.Header.Set("X-Wallet-Action", "withdraw")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusForbidden {
		t.Fatalf("expected 403, got %d: %s", rec.Code, rec.Body.String())
	}
	var body map[string]string
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body["category"] != "wallet_endpoint" {
		t.Fatalf("expected category wallet_endpoint, got %s", body["category"])
	}
}
