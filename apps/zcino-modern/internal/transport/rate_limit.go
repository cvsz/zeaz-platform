package transport

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"game-catalog-service/internal/middleware"

	"github.com/redis/go-redis/v9"
)

type rateLimiter struct {
	mu       sync.Mutex
	limit    float64
	burst    float64
	visitors map[string]*visitorBucket
	now      func() time.Time
	redis    *redis.Client
	prefix   string
	window   time.Duration
}

type visitorBucket struct {
	tokens   float64
	updated  time.Time
	lastSeen time.Time
}

func newRateLimiter(requestsPerMinute, burst int) *rateLimiter {
	return newRedisRateLimiter(nil, requestsPerMinute, burst)
}

func newRedisRateLimiter(redisClient *redis.Client, requestsPerMinute, burst int) *rateLimiter {
	if requestsPerMinute <= 0 {
		requestsPerMinute = 120
	}
	if burst <= 0 {
		burst = requestsPerMinute
	}
	return &rateLimiter{
		limit:    float64(requestsPerMinute) / float64(time.Minute),
		burst:    float64(burst),
		visitors: make(map[string]*visitorBucket),
		now:      time.Now,
		redis:    redisClient,
		prefix:   "zeaz:rate_limit",
		window:   time.Minute,
	}
}

func (l *rateLimiter) middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := l.key(r)
		allowed, retryAfter := l.allowRequest(r.Context(), key)
		if !allowed {
			w.Header().Set("Retry-After", strconv.Itoa(max(1, int(retryAfter.Seconds()))))
			writeAuthError(w, http.StatusTooManyRequests, "rate_limited", "too many requests")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (l *rateLimiter) allowRequest(ctx context.Context, key string) (bool, time.Duration) {
	if l.redis != nil {
		allowed, retryAfter, err := l.allowRedis(ctx, key)
		if err == nil {
			return allowed, retryAfter
		}
	}
	if l.allow(key) {
		return true, 0
	}
	return false, l.window
}

func (l *rateLimiter) allowRedis(ctx context.Context, key string) (bool, time.Duration, error) {
	windowKey := fmt.Sprintf("%s:%s:%d", l.prefix, key, l.now().Unix()/int64(l.window.Seconds()))
	count, err := l.redis.Incr(ctx, windowKey).Result()
	if err != nil {
		return false, 0, err
	}
	if count == 1 {
		if err := l.redis.Expire(ctx, windowKey, l.window+5*time.Second).Err(); err != nil {
			return false, 0, err
		}
	}
	if count <= int64(l.redisWindowLimit()) {
		return true, 0, nil
	}
	ttl, err := l.redis.TTL(ctx, windowKey).Result()
	if err != nil && !errors.Is(err, redis.Nil) {
		return false, 0, err
	}
	if ttl <= 0 {
		ttl = l.window
	}
	return false, ttl, nil
}

func (l *rateLimiter) redisWindowLimit() int {
	limit := int(l.limit * float64(l.window))
	if limit <= 0 {
		return int(l.burst)
	}
	return limit
}

func (l *rateLimiter) key(r *http.Request) string {
	parts := []string{clientIP(r)}
	if tenantID := strings.TrimSpace(middleware.TenantID(r.Context())); tenantID != "" {
		parts = append(parts, tenantID)
	}
	if subject := strings.TrimSpace(r.Header.Get("X-RateLimit-Subject")); subject != "" {
		parts = append(parts, subject)
	}
	return strings.Join(parts, ":")
}

func (l *rateLimiter) allow(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := l.now()
	bucket, ok := l.visitors[key]
	if !ok {
		l.visitors[key] = &visitorBucket{tokens: l.burst - 1, updated: now, lastSeen: now}
		l.cleanup(now)
		return true
	}

	elapsed := now.Sub(bucket.updated).Seconds()
	bucket.tokens += elapsed * l.limit * float64(time.Second)
	if bucket.tokens > l.burst {
		bucket.tokens = l.burst
	}
	bucket.updated = now
	bucket.lastSeen = now
	if bucket.tokens < 1 {
		return false
	}
	bucket.tokens--
	return true
}

func (l *rateLimiter) cleanup(now time.Time) {
	for key, bucket := range l.visitors {
		if now.Sub(bucket.lastSeen) > 10*time.Minute {
			delete(l.visitors, key)
		}
	}
}

func clientIP(r *http.Request) string {
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		first := strings.TrimSpace(strings.Split(forwarded, ",")[0])
		if host, _, err := net.SplitHostPort(first); err == nil {
			return host
		}
		return first
	}
	if realIP := r.Header.Get("X-Real-IP"); realIP != "" {
		return strings.TrimSpace(realIP)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
