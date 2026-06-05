package gateway

import (
	"context"
	"errors"
	"net/http"
	"sync"
	"time"
)

type IdempotencyStore struct {
	mu    sync.Mutex
	keys  map[string]time.Time
	ttl   time.Duration
	nowFn func() time.Time
}

func NewIdempotencyStore(ttl time.Duration) *IdempotencyStore {
	if ttl <= 0 {
		ttl = 24 * time.Hour
	}
	return &IdempotencyStore{keys: make(map[string]time.Time), ttl: ttl, nowFn: time.Now}
}

func (s *IdempotencyStore) Reserve(_ context.Context, key string) error {
	if key == "" {
		return errors.New("missing idempotency key")
	}
	now := s.nowFn().UTC()
	s.mu.Lock()
	defer s.mu.Unlock()
	s.gc(now)
	if exp, ok := s.keys[key]; ok && exp.After(now) {
		return errors.New("duplicate idempotency key")
	}
	s.keys[key] = now.Add(s.ttl)
	return nil
}

func (s *IdempotencyStore) gc(now time.Time) {
	for k, exp := range s.keys {
		if !exp.After(now) {
			delete(s.keys, k)
		}
	}
}

func IdempotencyMiddleware(store *IdempotencyStore, header string) func(http.Handler) http.Handler {
	if header == "" {
		header = "Idempotency-Key"
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodPost && r.Method != http.MethodPut && r.Method != http.MethodPatch {
				next.ServeHTTP(w, r)
				return
			}
			if err := store.Reserve(r.Context(), r.Header.Get(header)); err != nil {
				http.Error(w, "duplicate_request", http.StatusConflict)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
