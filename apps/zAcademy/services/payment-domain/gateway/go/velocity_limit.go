package gateway

import (
	"sync"
	"time"
)

type velocityState struct {
	count int
	reset time.Time
}

type VelocityLimiter struct {
	mu      sync.Mutex
	window  time.Duration
	limit   int
	nowFn   func() time.Time
	buckets map[string]*velocityState
}

func NewVelocityLimiter(limit int, window time.Duration) *VelocityLimiter {
	if limit <= 0 {
		limit = 5
	}
	if window <= 0 {
		window = time.Minute
	}
	return &VelocityLimiter{
		window:  window,
		limit:   limit,
		nowFn:   time.Now,
		buckets: make(map[string]*velocityState),
	}
}

func (l *VelocityLimiter) Allow(key string) bool {
	if key == "" {
		return false
	}
	now := l.nowFn().UTC()
	l.mu.Lock()
	defer l.mu.Unlock()
	state, ok := l.buckets[key]
	if !ok || now.After(state.reset) {
		state = &velocityState{count: 0, reset: now.Add(l.window)}
		l.buckets[key] = state
	}
	if state.count >= l.limit {
		return false
	}
	state.count++
	return true
}
