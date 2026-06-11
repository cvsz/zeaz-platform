//go:build integration

package repository

import (
	"context"
	"testing"
	"time"

	"game-catalog-service/internal/domain"
	"game-catalog-service/internal/testhelper"

	"github.com/google/uuid"
)

func seedTrackingData(ctx context.Context, t *testing.T) {
	t.Helper()
	if err := testhelper.TruncateTables(ctx, pgEnv.Postgres); err != nil {
		t.Fatalf("truncate tables: %v", err)
	}
	_, err := pgEnv.Postgres.Exec(ctx, `
INSERT INTO providers (id, name, is_active) VALUES
	('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Acme Gaming', TRUE)
ON CONFLICT (id) DO NOTHING`)
	if err != nil {
		t.Fatalf("seed provider: %v", err)
	}
	_, err = pgEnv.Postgres.Exec(ctx, `
INSERT INTO games (id, provider_id, name, provider, category, rtp, volatility, thumbnail_url, is_active) VALUES
	('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Golden Spins', 'Acme Gaming', 'slots', 96.50, 'medium', 'https://cdn.example.com/games/golden-spins.png', TRUE)
ON CONFLICT (id) DO NOTHING`)
	if err != nil {
		t.Fatalf("seed game: %v", err)
	}
}

func TestTrackingRepo_InsertSingleEvent(t *testing.T) {
	ctx := context.Background()
	seedTrackingData(ctx, t)

	trackingRepo := NewPostgresTrackingRepository(pgEnv.Postgres)
	now := time.Now().UTC()
	event := domain.TrackingEvent{
		ID:         uuid.New(),
		TenantID:   "tenant-a",
		Type:       domain.TrackingEventImpression,
		GameID:     uuid.MustParse("11111111-1111-1111-1111-111111111111"),
		SessionID:  "sess-001",
		UserID:     "user-1",
		Provider:   "Acme Gaming",
		Country:    "US",
		Placement:  "homepage",
		OccurredAt: now,
		ReceivedAt: now,
	}

	if err := trackingRepo.InsertTrackingEvents(ctx, []domain.TrackingEvent{event}); err != nil {
		t.Fatalf("InsertTrackingEvents: %v", err)
	}

	var count int
	if err := pgEnv.Postgres.QueryRow(ctx, `SELECT COUNT(*) FROM tracking_events`).Scan(&count); err != nil {
		t.Fatalf("count: %v", err)
	}
	if count != 1 {
		t.Fatalf("expected 1 event, got %d", count)
	}
}

func TestTrackingRepo_InsertBatch(t *testing.T) {
	ctx := context.Background()
	seedTrackingData(ctx, t)

	trackingRepo := NewPostgresTrackingRepository(pgEnv.Postgres)
	now := time.Now().UTC()
	events := make([]domain.TrackingEvent, 100)
	for i := range events {
		events[i] = domain.TrackingEvent{
			ID:         uuid.New(),
			TenantID:   "tenant-b",
			Type:       domain.TrackingEventImpression,
			GameID:     uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			SessionID:  "sess-batch",
			OccurredAt: now,
			ReceivedAt: now,
		}
	}

	if err := trackingRepo.InsertTrackingEvents(ctx, events); err != nil {
		t.Fatalf("InsertTrackingEvents batch: %v", err)
	}

	var count int
	if err := pgEnv.Postgres.QueryRow(ctx, `SELECT COUNT(*) FROM tracking_events`).Scan(&count); err != nil {
		t.Fatalf("count: %v", err)
	}
	if count != 100 {
		t.Fatalf("expected 100 events, got %d", count)
	}
}

func TestTrackingRepo_InsertEmptyBatch(t *testing.T) {
	ctx := context.Background()
	seedTrackingData(ctx, t)

	trackingRepo := NewPostgresTrackingRepository(pgEnv.Postgres)
	if err := trackingRepo.InsertTrackingEvents(ctx, nil); err != nil {
		t.Fatalf("InsertTrackingEvents nil: %v", err)
	}
	if err := trackingRepo.InsertTrackingEvents(ctx, []domain.TrackingEvent{}); err != nil {
		t.Fatalf("InsertTrackingEvents empty: %v", err)
	}

	var count int
	if err := pgEnv.Postgres.QueryRow(ctx, `SELECT COUNT(*) FROM tracking_events`).Scan(&count); err != nil {
		t.Fatalf("count: %v", err)
	}
	if count != 0 {
		t.Fatalf("expected 0 events, got %d", count)
	}
}

func TestTrackingRepo_InsertEventWithNullables(t *testing.T) {
	ctx := context.Background()
	seedTrackingData(ctx, t)

	trackingRepo := NewPostgresTrackingRepository(pgEnv.Postgres)
	now := time.Now().UTC()
	event := domain.TrackingEvent{
		ID:                uuid.New(),
		TenantID:          "tenant-c",
		Type:              domain.TrackingEventImpression,
		GameID:            uuid.MustParse("11111111-1111-1111-1111-111111111111"),
		SessionID:         "sess-nullable",
		Country:           "GB",
		AffiliateID:       "aff-123",
		CampaignID:        "cmp-456",
		ReferrerURL:       "https://example.com/ref",
		Placement:         "sidebar",
		ClickTarget:       "",
		UserID:            "",
		Provider:          "",
		SessionDurationMS: nil,
		OccurredAt:        now,
		ReceivedAt:        now,
	}

	if err := trackingRepo.InsertTrackingEvents(ctx, []domain.TrackingEvent{event}); err != nil {
		t.Fatalf("InsertTrackingEvents: %v", err)
	}

	var count int
	if err := pgEnv.Postgres.QueryRow(ctx, `SELECT COUNT(*) FROM tracking_events`).Scan(&count); err != nil {
		t.Fatalf("count: %v", err)
	}
	if count != 1 {
		t.Fatalf("expected 1 event, got %d", count)
	}
}

func TestTrackingRepo_InsertEventWithMetadata(t *testing.T) {
	ctx := context.Background()
	seedTrackingData(ctx, t)

	trackingRepo := NewPostgresTrackingRepository(pgEnv.Postgres)
	now := time.Now().UTC()
	event := domain.TrackingEvent{
		ID:         uuid.New(),
		TenantID:   "tenant-d",
		Type:       domain.TrackingEventImpression,
		GameID:     uuid.MustParse("11111111-1111-1111-1111-111111111111"),
		SessionID:  "sess-meta",
		OccurredAt: now,
		ReceivedAt: now,
		Metadata: map[string]string{
			"source":   "google",
			"campaign": "summer2025",
			"device":   "mobile",
		},
	}

	if err := trackingRepo.InsertTrackingEvents(ctx, []domain.TrackingEvent{event}); err != nil {
		t.Fatalf("InsertTrackingEvents: %v", err)
	}

	var storedMeta string
	if err := pgEnv.Postgres.QueryRow(ctx, `SELECT metadata::text FROM tracking_events WHERE id = $1`, event.ID).Scan(&storedMeta); err != nil {
		t.Fatalf("query metadata: %v", err)
	}
	if storedMeta != `{"campaign":"summer2025","device":"mobile","source":"google"}` {
		t.Fatalf("unexpected metadata JSON: %s", storedMeta)
	}
}

func TestTrackingRepo_InsertRejectsForeignKeyViolation(t *testing.T) {
	ctx := context.Background()
	seedTrackingData(ctx, t)

	trackingRepo := NewPostgresTrackingRepository(pgEnv.Postgres)
	now := time.Now().UTC()
	event := domain.TrackingEvent{
		ID:         uuid.New(),
		TenantID:   "tenant-e",
		Type:       domain.TrackingEventImpression,
		GameID:     uuid.MustParse("00000000-0000-0000-0000-000000000000"),
		SessionID:  "sess-bad-fk",
		OccurredAt: now,
		ReceivedAt: now,
	}

	err := trackingRepo.InsertTrackingEvents(ctx, []domain.TrackingEvent{event})
	if err == nil {
		t.Fatal("expected foreign key violation error, got nil")
	}
}
