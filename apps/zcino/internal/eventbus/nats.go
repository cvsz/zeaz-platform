package eventbus

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"game-catalog-service/internal/events"

	"github.com/nats-io/nats.go"
)

type Publisher interface {
	PublishClick(ctx context.Context, event events.ClickEvent) error
	Close()
}

type NoopPublisher struct{}

func (NoopPublisher) PublishClick(context.Context, events.ClickEvent) error { return nil }
func (NoopPublisher) Close()                                                {}

type NATSPublisher struct {
	conn *nats.Conn
}

func NewNATSPublisher(url string) (*NATSPublisher, error) {
	conn, err := nats.Connect(url,
		nats.Name("zeaz-tracking-publisher"),
		nats.Timeout(5*time.Second),
		nats.RetryOnFailedConnect(true),
		nats.MaxReconnects(10),
		nats.ReconnectWait(time.Second),
	)
	if err != nil {
		return nil, fmt.Errorf("connect nats: %w", err)
	}
	return &NATSPublisher{conn: conn}, nil
}

func (p *NATSPublisher) PublishClick(ctx context.Context, event events.ClickEvent) error {
	data, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("marshal click event: %w", err)
	}
	done := make(chan error, 1)
	go func() {
		done <- p.conn.Publish(events.ClickEventsSubject, data)
	}()
	select {
	case err := <-done:
		if err != nil {
			return fmt.Errorf("publish click event: %w", err)
		}
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func (p *NATSPublisher) Close() {
	p.conn.Drain()
	p.conn.Close()
}
