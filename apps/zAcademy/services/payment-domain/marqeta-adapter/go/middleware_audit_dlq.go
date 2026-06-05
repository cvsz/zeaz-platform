package marqeta

import (
	"context"
	"net/http"
	"time"
)

type DeadLetterMessage struct {
	OccurredAt time.Time
	Reason     string
	Payload    []byte
}

type DeadLetterQueue interface {
	Enqueue(context.Context, DeadLetterMessage) error
}

type MemoryDeadLetterQueue struct {
	items []DeadLetterMessage
}

func NewMemoryDeadLetterQueue() *MemoryDeadLetterQueue { return &MemoryDeadLetterQueue{} }

func (m *MemoryDeadLetterQueue) Enqueue(_ context.Context, msg DeadLetterMessage) error {
	if msg.OccurredAt.IsZero() {
		msg.OccurredAt = time.Now().UTC()
	}
	m.items = append(m.items, msg)
	return nil
}

func (m *MemoryDeadLetterQueue) Items() []DeadLetterMessage {
	return append([]DeadLetterMessage(nil), m.items...)
}

func DeadLetterMiddleware(dlq DeadLetterQueue) Middleware {
	return func(next Doer) Doer {
		return func(req *http.Request) (*http.Response, error) {
			resp, err := next(req)
			if err != nil {
				_ = dlq.Enqueue(req.Context(), DeadLetterMessage{Reason: err.Error()})
			}
			return resp, err
		}
	}
}

type AuditEvent struct {
	At         time.Time
	Method     string
	URL        string
	StatusCode int
	Error      string
}

type AuditSink interface {
	Write(context.Context, AuditEvent) error
}

type NopAuditSink struct{}

func (NopAuditSink) Write(context.Context, AuditEvent) error { return nil }

func AuditMiddleware(sink AuditSink) Middleware {
	return func(next Doer) Doer {
		return func(req *http.Request) (*http.Response, error) {
			resp, err := next(req)
			e := AuditEvent{At: time.Now().UTC(), Method: req.Method, URL: req.URL.String()}
			if resp != nil {
				e.StatusCode = resp.StatusCode
			}
			if err != nil {
				e.Error = err.Error()
			}
			_ = sink.Write(req.Context(), e)
			return resp, err
		}
	}
}

type APIError struct {
	StatusCode int
	Body       string
}

func (e APIError) Error() string {
	return "marqeta api error: status=" + itoa(e.StatusCode) + " body=" + e.Body
}
