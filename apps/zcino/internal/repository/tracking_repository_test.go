package repository

import (
	"encoding/json"
	"reflect"
	"testing"
	"time"

	"game-catalog-service/internal/domain"

	"github.com/google/uuid"
)

func TestTrackingEventCopyRowMatchesCopyColumns(t *testing.T) {
	duration := int64(1234)
	occurredAt := time.Date(2026, 5, 6, 4, 0, 0, 0, time.UTC)
	receivedAt := occurredAt.Add(time.Second)
	event := domain.TrackingEvent{
		ID:                uuid.MustParse("00000000-0000-0000-0000-000000000001"),
		TenantID:          "tenant-a",
		Type:              domain.TrackingEventClick,
		GameID:            uuid.MustParse("00000000-0000-0000-0000-000000000002"),
		SessionID:         "session-1",
		UserID:            "user-1",
		Provider:          "provider-1",
		Country:           "US",
		Placement:         "hero",
		ClickTarget:       "play-button",
		AffiliateID:       "affiliate-1",
		CampaignID:        "campaign-1",
		ReferrerURL:       "https://example.test/lobby",
		SessionDurationMS: &duration,
		OccurredAt:        occurredAt,
		ReceivedAt:        receivedAt,
		Metadata:          map[string]string{"experiment": "hero-a"},
	}

	row, err := trackingEventCopyRow(event)
	if err != nil {
		t.Fatalf("trackingEventCopyRow returned error: %v", err)
	}
	if len(row) != len(trackingEventColumns) {
		t.Fatalf("row length = %d, want %d columns", len(row), len(trackingEventColumns))
	}

	columnValues := map[string]any{}
	for index, column := range trackingEventColumns {
		columnValues[column] = row[index]
	}

	assertEqual(t, columnValues["id"], event.ID)
	assertEqual(t, columnValues["tenant_id"], event.TenantID)
	assertEqual(t, columnValues["event_type"], string(event.Type))
	assertEqual(t, columnValues["game_id"], event.GameID)
	assertEqual(t, columnValues["session_id"], event.SessionID)
	assertStringPtr(t, columnValues["user_id"], event.UserID)
	assertStringPtr(t, columnValues["provider"], event.Provider)
	assertStringPtr(t, columnValues["country"], event.Country)
	assertStringPtr(t, columnValues["placement"], event.Placement)
	assertStringPtr(t, columnValues["click_target"], event.ClickTarget)
	assertStringPtr(t, columnValues["affiliate_id"], event.AffiliateID)
	assertStringPtr(t, columnValues["campaign_id"], event.CampaignID)
	assertStringPtr(t, columnValues["referrer_url"], event.ReferrerURL)
	assertEqual(t, columnValues["session_duration_ms"], duration)
	assertEqual(t, columnValues["occurred_at"], occurredAt)
	assertEqual(t, columnValues["received_at"], receivedAt)

	metadataBytes, ok := columnValues["metadata"].([]byte)
	if !ok {
		t.Fatalf("metadata row value has type %T, want []byte", columnValues["metadata"])
	}
	var metadata map[string]string
	if err := json.Unmarshal(metadataBytes, &metadata); err != nil {
		t.Fatalf("metadata is not valid JSON: %v", err)
	}
	assertEqual(t, metadata["experiment"], "hero-a")
}

func TestTrackingEventCopyRowUsesNullsAndEmptyMetadata(t *testing.T) {
	now := time.Date(2026, 5, 6, 4, 0, 0, 0, time.UTC)
	event := domain.TrackingEvent{
		ID:         uuid.MustParse("00000000-0000-0000-0000-000000000001"),
		TenantID:   "public",
		Type:       domain.TrackingEventImpression,
		GameID:     uuid.MustParse("00000000-0000-0000-0000-000000000002"),
		SessionID:  "session-1",
		OccurredAt: now,
		ReceivedAt: now,
	}

	row, err := trackingEventCopyRow(event)
	if err != nil {
		t.Fatalf("trackingEventCopyRow returned error: %v", err)
	}
	columnValues := map[string]any{}
	for index, column := range trackingEventColumns {
		columnValues[column] = row[index]
	}

	for _, column := range []string{"user_id", "provider", "country", "placement", "click_target", "affiliate_id", "campaign_id", "referrer_url", "session_duration_ms"} {
		if columnValues[column] != nil {
			t.Fatalf("%s = %#v, want nil", column, columnValues[column])
		}
	}
	metadataBytes, ok := columnValues["metadata"].([]byte)
	if !ok {
		t.Fatalf("metadata row value has type %T, want []byte", columnValues["metadata"])
	}
	if string(metadataBytes) != "{}" {
		t.Fatalf("metadata = %s, want {}", metadataBytes)
	}
}

func assertEqual(t *testing.T, got, want any) {
	t.Helper()
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %#v, want %#v", got, want)
	}
}

func assertStringPtr(t *testing.T, got any, want string) {
	t.Helper()
	ptr, ok := got.(*string)
	if !ok {
		t.Fatalf("got %T, want *string", got)
	}
	if *ptr != want {
		t.Fatalf("got %q, want %q", *ptr, want)
	}
}
