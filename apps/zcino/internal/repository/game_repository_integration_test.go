//go:build integration

package repository

import (
	"context"
	"os"
	"testing"

	"game-catalog-service/internal/domain"
	"game-catalog-service/internal/testhelper"

	"github.com/google/uuid"
)

var (
	pgEnv   *testhelper.IntegrationEnv
	pgClean func()
	gameRepo *PostgresGameRepository
)

func TestMain(m *testing.M) {
	ctx := context.Background()
	pgEnv, pgClean = testhelper.MustStartContainers(ctx)
	defer pgClean()
	gameRepo = NewPostgresGameRepository(pgEnv.Postgres)
	os.Exit(m.Run())
}

func seedGames(ctx context.Context, t *testing.T) {
	t.Helper()
	if err := testhelper.TruncateTables(ctx, pgEnv.Postgres); err != nil {
		t.Fatalf("truncate tables: %v", err)
	}
	_, err := pgEnv.Postgres.Exec(ctx, `
INSERT INTO providers (id, name, is_active) VALUES
	('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Acme Gaming', TRUE),
	('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'TableWorks', TRUE),
	('cccccccc-cccc-cccc-cccc-cccccccccccc', 'MegaLuck', TRUE)
ON CONFLICT (id) DO NOTHING`)
	if err != nil {
		t.Fatalf("seed providers: %v", err)
	}
	_, err = pgEnv.Postgres.Exec(ctx, `
INSERT INTO games (id, provider_id, name, provider, category, rtp, volatility, thumbnail_url, is_active) VALUES
	('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Golden Spins',     'Acme Gaming', 'slots',    96.50, 'medium', 'https://cdn.example.com/games/golden-spins.png',    TRUE),
	('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Roulette Royale',  'TableWorks',  'roulette', 97.30, 'low',    'https://cdn.example.com/games/roulette-royale.png',  TRUE),
	('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dragon Fortune',  'Acme Gaming', 'slots',    95.10, 'high',   'https://cdn.example.com/games/dragon-fortune.png',   TRUE),
	('44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Lucky 7s',        'MegaLuck',    'slots',    98.00, 'medium', 'https://cdn.example.com/games/lucky-7s.png',        TRUE),
	('55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Blackjack Pro',   'TableWorks',  'blackjack', 99.10, 'low',    'https://cdn.example.com/games/blackjack-pro.png',    TRUE)
ON CONFLICT (id) DO NOTHING`)
	if err != nil {
		t.Fatalf("seed games: %v", err)
	}
}

func TestGameRepo_ListGames_NoFilter(t *testing.T) {
	ctx := context.Background()
	seedGames(ctx, t)

	games, total, err := gameRepo.ListGames(ctx, domain.GameFilter{}, domain.Pagination{Page: 1, PerPage: 100})
	if err != nil {
		t.Fatalf("ListGames: %v", err)
	}
	if total != 5 {
		t.Fatalf("expected total 5, got %d", total)
	}
	if len(games) != 5 {
		t.Fatalf("expected 5 games, got %d", len(games))
	}
}

func TestGameRepo_ListGames_FilterByProvider(t *testing.T) {
	ctx := context.Background()
	seedGames(ctx, t)

	games, total, err := gameRepo.ListGames(ctx, domain.GameFilter{Provider: "Acme Gaming"}, domain.Pagination{Page: 1, PerPage: 100})
	if err != nil {
		t.Fatalf("ListGames: %v", err)
	}
	if total != 2 {
		t.Fatalf("expected total 2, got %d", total)
	}
	if len(games) != 2 {
		t.Fatalf("expected 2 games, got %d", len(games))
	}
	for _, g := range games {
		if g.Provider != "Acme Gaming" {
			t.Fatalf("expected provider Acme Gaming, got %s", g.Provider)
		}
	}
}

func TestGameRepo_ListGames_FilterByCategory(t *testing.T) {
	ctx := context.Background()
	seedGames(ctx, t)

	games, total, err := gameRepo.ListGames(ctx, domain.GameFilter{Category: "slots"}, domain.Pagination{Page: 1, PerPage: 100})
	if err != nil {
		t.Fatalf("ListGames: %v", err)
	}
	if total != 3 {
		t.Fatalf("expected total 3, got %d", total)
	}
	if len(games) != 3 {
		t.Fatalf("expected 3 games, got %d", len(games))
	}
}

func TestGameRepo_ListGames_RTPRange(t *testing.T) {
	ctx := context.Background()
	seedGames(ctx, t)

	min := 97.0
	max := 100.0
	games, total, err := gameRepo.ListGames(ctx, domain.GameFilter{RTPRange: &domain.RTPRange{Min: &min, Max: &max}}, domain.Pagination{Page: 1, PerPage: 100})
	if err != nil {
		t.Fatalf("ListGames: %v", err)
	}
	if total != 2 {
		t.Fatalf("expected total 2 for rtp >= 97, got %d", total)
	}
	for _, g := range games {
		if g.RTP < 97 || g.RTP > 100 {
			t.Fatalf("game %s has rtp %f outside expected range", g.ID, g.RTP)
		}
	}
}

func TestGameRepo_ListGames_Pagination(t *testing.T) {
	ctx := context.Background()
	seedGames(ctx, t)

	page1, total, err := gameRepo.ListGames(ctx, domain.GameFilter{}, domain.Pagination{Page: 1, PerPage: 2})
	if err != nil {
		t.Fatalf("ListGames page 1: %v", err)
	}
	if total != 5 {
		t.Fatalf("expected total 5, got %d", total)
	}
	if len(page1) != 2 {
		t.Fatalf("expected 2 items on page 1, got %d", len(page1))
	}

	page2, _, err := gameRepo.ListGames(ctx, domain.GameFilter{}, domain.Pagination{Page: 2, PerPage: 2})
	if err != nil {
		t.Fatalf("ListGames page 2: %v", err)
	}
	if len(page2) != 2 {
		t.Fatalf("expected 2 items on page 2, got %d", len(page2))
	}

	page3, _, err := gameRepo.ListGames(ctx, domain.GameFilter{}, domain.Pagination{Page: 3, PerPage: 2})
	if err != nil {
		t.Fatalf("ListGames page 3: %v", err)
	}
	if len(page3) != 1 {
		t.Fatalf("expected 1 item on page 3, got %d", len(page3))
	}

	ids := make(map[uuid.UUID]bool)
	for _, g := range page1 {
		ids[g.ID] = true
	}
	for _, g := range page2 {
		ids[g.ID] = true
	}
	for _, g := range page3 {
		ids[g.ID] = true
	}
	if len(ids) != 5 {
		t.Fatalf("expected 5 unique games across pages, got %d", len(ids))
	}
}

func TestGameRepo_GetGameByID_Found(t *testing.T) {
	ctx := context.Background()
	seedGames(ctx, t)

	game, err := gameRepo.GetGameByID(ctx, uuid.MustParse("11111111-1111-1111-1111-111111111111"))
	if err != nil {
		t.Fatalf("GetGameByID: %v", err)
	}
	if game.Name != "Golden Spins" {
		t.Fatalf("expected name Golden Spins, got %s", game.Name)
	}
	if game.Provider != "Acme Gaming" {
		t.Fatalf("expected provider Acme Gaming, got %s", game.Provider)
	}
	if game.Category != "slots" {
		t.Fatalf("expected category slots, got %s", game.Category)
	}
}

func TestGameRepo_GetGameByID_NotFound(t *testing.T) {
	ctx := context.Background()
	seedGames(ctx, t)

	_, err := gameRepo.GetGameByID(ctx, uuid.MustParse("00000000-0000-0000-0000-000000000000"))
	if err != domain.ErrNotFound {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func TestGameRepo_ListProviders(t *testing.T) {
	ctx := context.Background()
	seedGames(ctx, t)

	providers, err := gameRepo.ListProviders(ctx)
	if err != nil {
		t.Fatalf("ListProviders: %v", err)
	}
	if len(providers) != 3 {
		t.Fatalf("expected 3 providers, got %d", len(providers))
	}
	expected := []string{"Acme Gaming", "MegaLuck", "TableWorks"}
	for i, p := range providers {
		if p != expected[i] {
			t.Fatalf("provider[%d] = %s, expected %s", i, p, expected[i])
		}
	}
}
