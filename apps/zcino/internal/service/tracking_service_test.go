package service

import (
	"context"
	"sync"
	"testing"
	"time"

	"game-catalog-service/internal/domain"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type fakeTrackingRepo struct {
	mu      sync.Mutex
	events  []domain.TrackingEvent
	flushes int
}

func (r *fakeTrackingRepo) InsertTrackingEvents(_ context.Context, events []domain.TrackingEvent) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.flushes++
	r.events = append(r.events, events...)
	return nil
}

func (r *fakeTrackingRepo) count() int {
	r.mu.Lock()
	defer r.mu.Unlock()
	return len(r.events)
}

func TestTrackingServiceBatchesBySize(t *testing.T) {
	repo := &fakeTrackingRepo{}
	svc := NewTrackingService(repo, TrackingServiceConfig{BatchSize: 2, FlushInterval: time.Hour, QueueSize: 4}, zap.NewNop())
	svc.Start(context.Background())

	for range 2 {
		if err := svc.Track(context.Background(), validTrackingEvent()); err != nil {
			t.Fatalf("track event: %v", err)
		}
	}

	assertEventually(t, func() bool { return repo.count() == 2 })
	if err := svc.Stop(context.Background()); err != nil {
		t.Fatalf("stop service: %v", err)
	}
}

func TestTrackingServiceRejectsInvalidEvent(t *testing.T) {
	repo := &fakeTrackingRepo{}
	svc := NewTrackingService(repo, TrackingServiceConfig{BatchSize: 2, FlushInterval: time.Hour, QueueSize: 1}, zap.NewNop())
	event := validTrackingEvent()
	event.GameID = uuid.Nil
	if err := svc.Track(context.Background(), event); err == nil {
		t.Fatal("expected validation error")
	}
}

func validTrackingEvent() domain.TrackingEvent {
	now := time.Now().UTC()
	return domain.TrackingEvent{
		ID:         uuid.New(),
		TenantID:   "tenant-a",
		Type:       domain.TrackingEventImpression,
		GameID:     uuid.New(),
		SessionID:  "session-123",
		OccurredAt: now,
		ReceivedAt: now,
	}
}

func assertEventually(t *testing.T, condition func() bool) {
	t.Helper()
	deadline := time.Now().Add(time.Second)
	for time.Now().Before(deadline) {
		if condition() {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatal("condition was not met before deadline")
}
