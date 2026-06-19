//go:build integration

package service

import (
	"context"
	"os"
	"testing"
	"time"

	"game-catalog-service/internal/cache"
	"game-catalog-service/internal/domain"
	"game-catalog-service/internal/repository"
	"game-catalog-service/internal/testhelper"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

var (
	svcEnv   *testhelper.IntegrationEnv
	svcClean func()
)

func TestMain(m *testing.M) {
	ctx := context.Background()
	svcEnv, svcClean = testhelper.MustStartContainers(ctx)
	defer svcClean()
	os.Exit(m.Run())
}

func seedCatalogData(ctx context.Context, t *testing.T) {
	t.Helper()
	if err := testhelper.TruncateTables(ctx, svcEnv.Postgres); err != nil {
		t.Fatalf("truncate: %v", err)
	}
	if err := testhelper.FlushRedis(ctx, svcEnv.Redis); err != nil {
		t.Fatalf("flush redis: %v", err)
	}
	_, err := svcEnv.Postgres.Exec(ctx, `
INSERT INTO providers (id, name, is_active) VALUES
	('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Acme Gaming', TRUE),
	('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'TableWorks', TRUE)
ON CONFLICT (id) DO NOTHING`)
	if err != nil {
		t.Fatalf("seed providers: %v", err)
	}
	_, err = svcEnv.Postgres.Exec(ctx, `
INSERT INTO games (id, provider_id, name, provider, category, rtp, volatility, thumbnail_url, is_active) VALUES
	('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Golden Spins',    'Acme Gaming', 'slots',    96.50, 'medium', 'https://cdn.example.com/games/golden-spins.png',   TRUE),
	('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Roulette Royale', 'TableWorks',  'roulette', 97.30, 'low',    'https://cdn.example.com/games/roulette-royale.png', TRUE),
	('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dragon Fortune',  'Acme Gaming', 'slots',    95.10, 'high',   'https://cdn.example.com/games/dragon-fortune.png',  TRUE)
ON CONFLICT (id) DO NOTHING`)
	if err != nil {
		t.Fatalf("seed games: %v", err)
	}
}

func newCatalogServiceForTest() CatalogService {
	validate := validator.New(validator.WithRequiredStructEnabled())
	repo := repository.NewPostgresGameRepository(svcEnv.Postgres)
	gameCache := cache.NewRedisGameCache(svcEnv.Redis, 5*time.Minute)
	return NewCatalogService(repo, gameCache, validate, zap.NewNop())
}

func TestCatalogService_GetGame_CacheMissThenHit(t *testing.T) {
	ctx := context.Background()
	seedCatalogData(ctx, t)
	svc := newCatalogServiceForTest()

	gameID := uuid.MustParse("11111111-1111-1111-1111-111111111111")

	game1, err := svc.GetGame(ctx, gameID)
	if err != nil {
		t.Fatalf("GetGame (first call): %v", err)
	}
	if game1.Name != "Golden Spins" {
		t.Fatalf("expected Golden Spins, got %s", game1.Name)
	}

	game2, err := svc.GetGame(ctx, gameID)
	if err != nil {
		t.Fatalf("GetGame (second call): %v", err)
	}
	if game2.Name != "Golden Spins" {
		t.Fatalf("expected Golden Spins, got %s", game2.Name)
	}
}

func TestCatalogService_ListGames_CacheThrough(t *testing.T) {
	ctx := context.Background()
	seedCatalogData(ctx, t)
	svc := newCatalogServiceForTest()

	filter := domain.GameFilter{}
	pagination := domain.Pagination{Page: 1, PerPage: 20}

	page1, err := svc.ListGames(ctx, filter, pagination)
	if err != nil {
		t.Fatalf("ListGames (first call): %v", err)
	}
	if page1.Total != 3 {
		t.Fatalf("expected total 3, got %d", page1.Total)
	}

	page2, err := svc.ListGames(ctx, filter, pagination)
	if err != nil {
		t.Fatalf("ListGames (second call): %v", err)
	}
	if page2.Total != 3 {
		t.Fatalf("expected total 3 on second call, got %d", page2.Total)
	}
}

func TestCatalogService_ListGames_Filtered(t *testing.T) {
	ctx := context.Background()
	seedCatalogData(ctx, t)
	svc := newCatalogServiceForTest()

	filter := domain.GameFilter{Provider: "Acme Gaming"}
	pagination := domain.Pagination{Page: 1, PerPage: 20}

	page, err := svc.ListGames(ctx, filter, pagination)
	if err != nil {
		t.Fatalf("ListGames filtered: %v", err)
	}
	if page.Total != 2 {
		t.Fatalf("expected 2 games for Acme Gaming, got %d", page.Total)
	}
	for _, g := range page.Items {
		if g.Provider != "Acme Gaming" {
			t.Fatalf("expected Acme Gaming provider, got %s", g.Provider)
		}
	}
}

func TestCatalogService_ListGames_Pagination(t *testing.T) {
	ctx := context.Background()
	seedCatalogData(ctx, t)
	svc := newCatalogServiceForTest()

	page1, err := svc.ListGames(ctx, domain.GameFilter{}, domain.Pagination{Page: 1, PerPage: 2})
	if err != nil {
		t.Fatalf("ListGames page 1: %v", err)
	}
	if page1.Total != 3 {
		t.Fatalf("expected total 3, got %d", page1.Total)
	}
	if len(page1.Items) != 2 {
		t.Fatalf("expected 2 items on page 1, got %d", len(page1.Items))
	}
	if page1.Page != 1 {
		t.Fatalf("expected page 1, got %d", page1.Page)
	}
	if page1.TotalPages != 2 {
		t.Fatalf("expected 2 total pages, got %d", page1.TotalPages)
	}

	page2, err := svc.ListGames(ctx, domain.GameFilter{}, domain.Pagination{Page: 2, PerPage: 2})
	if err != nil {
		t.Fatalf("ListGames page 2: %v", err)
	}
	if len(page2.Items) != 1 {
		t.Fatalf("expected 1 item on page 2, got %d", len(page2.Items))
	}
	if page2.TotalPages != 2 {
		t.Fatalf("expected 2 total pages, got %d", page2.TotalPages)
	}
}

func TestCatalogService_GetGame_NotFound(t *testing.T) {
	ctx := context.Background()
	seedCatalogData(ctx, t)
	svc := newCatalogServiceForTest()

	_, err := svc.GetGame(ctx, uuid.MustParse("00000000-0000-0000-0000-000000000000"))
	if err == nil {
		t.Fatal("expected error for non-existent game, got nil")
	}
}
