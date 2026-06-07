package service

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"game-catalog-service/internal/domain"
	"game-catalog-service/internal/eventbus"
	"game-catalog-service/internal/events"
	"game-catalog-service/internal/repository"

	"go.uber.org/zap"
)

var ErrTrackingQueueFull = errors.New("tracking event queue is full")

type TrackingService interface {
	Track(ctx context.Context, event domain.TrackingEvent) error
	Start(ctx context.Context)
	Stop(ctx context.Context) error
}

type TrackingServiceConfig struct {
	BatchSize     int
	FlushInterval time.Duration
	QueueSize     int
}

type trackingService struct {
	repo      repository.TrackingRepository
	publisher eventbus.Publisher
	cfg       TrackingServiceConfig
	log       *zap.Logger
	events    chan domain.TrackingEvent

	startOnce sync.Once
	stopOnce  sync.Once
	done      chan struct{}
	mu        sync.RWMutex
	stopped   bool
}

func NewTrackingService(repo repository.TrackingRepository, cfg TrackingServiceConfig, log *zap.Logger, publisher ...eventbus.Publisher) TrackingService {
	if cfg.BatchSize <= 0 {
		cfg.BatchSize = 100
	}
	if cfg.FlushInterval <= 0 {
		cfg.FlushInterval = 5 * time.Second
	}
	if cfg.QueueSize <= 0 {
		cfg.QueueSize = cfg.BatchSize * 10
	}
	clickPublisher := eventbus.Publisher(eventbus.NoopPublisher{})
	if len(publisher) > 0 && publisher[0] != nil {
		clickPublisher = publisher[0]
	}
	return &trackingService{
		repo:      repo,
		publisher: clickPublisher,
		cfg:       cfg,
		log:       log,
		events:    make(chan domain.TrackingEvent, cfg.QueueSize),
		done:      make(chan struct{}),
	}
}

func (s *trackingService) Start(ctx context.Context) {
	s.startOnce.Do(func() {
		go s.run(ctx)
	})
}

func (s *trackingService) Track(ctx context.Context, event domain.TrackingEvent) error {
	if err := event.Validate(); err != nil {
		return domain.ValidationError{Message: fmt.Sprintf("invalid tracking event: %v", err)}
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.stopped {
		return ErrTrackingQueueFull
	}
	select {
	case s.events <- event:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	default:
		return ErrTrackingQueueFull
	}
}

func (s *trackingService) Stop(ctx context.Context) error {
	var waitErr error
	s.stopOnce.Do(func() {
		s.mu.Lock()
		s.stopped = true
		close(s.events)
		s.mu.Unlock()
		select {
		case <-s.done:
		case <-ctx.Done():
			waitErr = ctx.Err()
		}
	})
	return waitErr
}

func (s *trackingService) run(ctx context.Context) {
	defer close(s.done)
	ticker := time.NewTicker(s.cfg.FlushInterval)
	defer ticker.Stop()

	batch := make([]domain.TrackingEvent, 0, s.cfg.BatchSize)
	flush := func() {
		if len(batch) == 0 {
			return
		}
		flushCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := s.repo.InsertTrackingEvents(flushCtx, batch); err != nil {
			s.log.Error("flush tracking events failed", zap.Error(err), zap.Int("count", len(batch)))
		} else {
			s.publishClickEvents(flushCtx, batch)
			s.log.Debug("flushed tracking events", zap.Int("count", len(batch)))
		}
		batch = batch[:0]
	}

	for {
		select {
		case event, ok := <-s.events:
			if !ok {
				flush()
				return
			}
			batch = append(batch, event)
			if len(batch) >= s.cfg.BatchSize {
				flush()
			}
		case <-ticker.C:
			flush()
		case <-ctx.Done():
			for {
				select {
				case event, ok := <-s.events:
					if !ok {
						flush()
						return
					}
					batch = append(batch, event)
					if len(batch) >= s.cfg.BatchSize {
						flush()
					}
				default:
					flush()
					return
				}
			}
		}
	}
}

func (s *trackingService) publishClickEvents(ctx context.Context, batch []domain.TrackingEvent) {
	for _, event := range batch {
		if event.Type != domain.TrackingEventClick {
			continue
		}
		click := events.ClickEvent{
			TenantID:  event.TenantID,
			GameID:    event.GameID.String(),
			UserID:    event.UserID,
			Country:   event.Country,
			SessionID: event.SessionID,
			Time:      event.OccurredAt.Unix(),
			Timestamp: event.OccurredAt,
		}
		if err := s.publisher.PublishClick(ctx, click); err != nil {
			s.log.Error("publish click event failed", zap.Error(err), zap.String("event_id", event.ID.String()))
		}
	}
}
