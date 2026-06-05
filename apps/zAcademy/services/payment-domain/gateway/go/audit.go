package gateway

import (
	"context"
	"encoding/json"
	"errors"
	"os"
	"sync"
	"time"
)

type AuditEvent struct {
	Timestamp time.Time       `json:"timestamp"`
	RequestID string          `json:"request_id"`
	Subject   string          `json:"subject"`
	Action    string          `json:"action"`
	Resource  string          `json:"resource"`
	Outcome   string          `json:"outcome"`
	Metadata  json.RawMessage `json:"metadata,omitempty"`
}

type AuditStore interface {
	Persist(context.Context, AuditEvent) error
}

type FileAuditStore struct {
	mu   sync.Mutex
	path string
}

func NewFileAuditStore(path string) (*FileAuditStore, error) {
	if path == "" {
		return nil, errors.New("audit path required")
	}
	if _, err := os.Stat(path); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			f, createErr := os.OpenFile(path, os.O_CREATE|os.O_WRONLY, 0o640)
			if createErr != nil {
				return nil, createErr
			}
			_ = f.Close()
		} else {
			return nil, err
		}
	}
	return &FileAuditStore{path: path}, nil
}

func (s *FileAuditStore) Persist(_ context.Context, event AuditEvent) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now().UTC()
	}
	blob, err := json.Marshal(event)
	if err != nil {
		return err
	}
	f, err := os.OpenFile(s.path, os.O_APPEND|os.O_WRONLY, 0o640)
	if err != nil {
		return err
	}
	defer f.Close()
	if _, err := f.Write(append(blob, '\n')); err != nil {
		return err
	}
	return nil
}
