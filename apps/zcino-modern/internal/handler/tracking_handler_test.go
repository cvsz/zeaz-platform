package handler

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"game-catalog-service/internal/domain"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type fakeTrackingService struct {
	event domain.TrackingEvent
	err   error
}

func (s *fakeTrackingService) Track(_ context.Context, event domain.TrackingEvent) error {
	s.event = event
	return s.err
}

func (s *fakeTrackingService) Start(context.Context)      {}
func (s *fakeTrackingService) Stop(context.Context) error { return nil }

func TestTrackingHandlerAcceptsClick(t *testing.T) {
	svc := &fakeTrackingService{}
	handler := NewTrackingHandler(svc, zap.NewNop())
	gameID := uuid.New()
	body := `{"game_id":"` + gameID.String() + `","session_id":" session-123 ","click_target":"play_button","affiliate_id":"aff-123","campaign_id":"spring","country":"us","referrer_url":"https://example.com","session_duration_ms":2500}`
	req := httptest.NewRequest(http.MethodPost, "/track/click", strings.NewReader(body))
	res := httptest.NewRecorder()

	handler.TrackClick(res, req)

	if res.Code != http.StatusAccepted {
		t.Fatalf("expected status %d, got %d", http.StatusAccepted, res.Code)
	}
	if svc.event.Type != domain.TrackingEventClick {
		t.Fatalf("expected click event, got %s", svc.event.Type)
	}
	if svc.event.GameID != gameID {
		t.Fatalf("expected game id %s, got %s", gameID, svc.event.GameID)
	}
	if svc.event.SessionID != "session-123" {
		t.Fatalf("expected trimmed session id, got %q", svc.event.SessionID)
	}
	if svc.event.SessionDurationMS == nil || *svc.event.SessionDurationMS != 2500 {
		t.Fatalf("expected session duration to be preserved")
	}
	if svc.event.AffiliateID != "aff-123" || svc.event.CampaignID != "spring" || svc.event.Country != "US" || svc.event.ReferrerURL != "https://example.com" {
		t.Fatalf("expected affiliate attribution fields to be preserved, got %#v", svc.event)
	}
}

func TestTrackingRequestUsesProvidedOccurredAt(t *testing.T) {
	occurredAt := time.Date(2026, 5, 6, 12, 0, 0, 0, time.UTC)
	receivedAt := occurredAt.Add(time.Minute)
	event := TrackingRequest{GameID: uuid.New(), SessionID: "session-123", OccurredAt: &occurredAt}.toEvent(uuid.New(), "tenant-a", domain.TrackingEventImpression, receivedAt)
	if !event.OccurredAt.Equal(occurredAt) {
		t.Fatalf("expected occurred_at %s, got %s", occurredAt, event.OccurredAt)
	}
}
