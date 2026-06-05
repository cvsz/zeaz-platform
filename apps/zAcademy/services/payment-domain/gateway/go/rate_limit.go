package gateway

import (
	"net/http"
	"sync"
	"time"
)

type rateState struct {
	count int
	reset time.Time
}

type RateLimiter struct {
	mu      sync.Mutex
	bucket  map[string]*rateState
	limit   int
	window  time.Duration
	nowFunc func() time.Time
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	if limit <= 0 {
		limit = 100
	}
	if window <= 0 {
		window = time.Minute
	}
	return &RateLimiter{bucket: make(map[string]*rateState), limit: limit, window: window, nowFunc: time.Now}
}

func (l *RateLimiter) Allow(key string) (allowed bool, remaining int, reset time.Time) {
	now := l.nowFunc().UTC()
	l.mu.Lock()
	defer l.mu.Unlock()
	st, ok := l.bucket[key]
	if !ok || now.After(st.reset) {
		st = &rateState{count: 0, reset: now.Add(l.window)}
		l.bucket[key] = st
	}
	if st.count >= l.limit {
		return false, 0, st.reset
	}
	st.count++
	return true, l.limit - st.count, st.reset
}

func RateLimitMiddleware(l *RateLimiter, keyFn func(*http.Request) string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := "anon"
			if keyFn != nil {
				key = keyFn(r)
			}
			allowed, remaining, reset := l.Allow(key)
			w.Header().Set("X-RateLimit-Remaining", itoa(remaining))
			w.Header().Set("X-RateLimit-Reset", reset.Format(time.RFC3339))
			if !allowed {
				http.Error(w, "rate_limit_exceeded", http.StatusTooManyRequests)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func itoa(v int) string {
	if v == 0 {
		return "0"
	}
	neg := v < 0
	if neg {
		v = -v
	}
	var b [20]byte
	i := len(b)
	for v > 0 {
		i--
		b[i] = byte('0' + v%10)
		v /= 10
	}
	if neg {
		i--
		b[i] = '-'
	}
	return string(b[i:])
}
