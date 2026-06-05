package gateway

import (
	"context"
	"errors"
	"net/http"
	"sync"
	"time"
)

type ReplayProtector struct {
	mu    sync.Mutex
	seen  map[string]time.Time
	ttl   time.Duration
	nowFn func() time.Time
}

func NewReplayProtector(ttl time.Duration) *ReplayProtector {
	if ttl <= 0 {
		ttl = 5 * time.Minute
	}
	return &ReplayProtector{seen: make(map[string]time.Time), ttl: ttl, nowFn: time.Now}
}

func (r *ReplayProtector) ValidateAndStore(_ context.Context, nonce string) error {
	if nonce == "" {
		return errors.New("missing replay nonce")
	}
	now := r.nowFn().UTC()
	r.mu.Lock()
	defer r.mu.Unlock()
	r.gc(now)
	if exp, ok := r.seen[nonce]; ok && exp.After(now) {
		return errors.New("replay detected")
	}
	r.seen[nonce] = now.Add(r.ttl)
	return nil
}

func (r *ReplayProtector) gc(now time.Time) {
	for k, exp := range r.seen {
		if !exp.After(now) {
			delete(r.seen, k)
		}
	}
}

func ReplayProtectionMiddleware(protector *ReplayProtector, nonceHeader string) func(http.Handler) http.Handler {
	if nonceHeader == "" {
		nonceHeader = "X-Nonce"
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			if req.Method == http.MethodGet || req.Method == http.MethodHead || req.Method == http.MethodOptions {
				next.ServeHTTP(w, req)
				return
			}
			nonce := req.Header.Get(nonceHeader)
			if err := protector.ValidateAndStore(req.Context(), nonce); err != nil {
				http.Error(w, "replay_blocked", http.StatusUnauthorized)
				return
			}
			next.ServeHTTP(w, req)
		})
	}
}
