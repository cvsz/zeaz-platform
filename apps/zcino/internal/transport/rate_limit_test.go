package transport

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestRateLimiterBlocksAfterBurst(t *testing.T) {
	limiter := newRateLimiter(60, 2)
	now := time.Date(2026, 5, 6, 12, 0, 0, 0, time.UTC)
	limiter.now = func() time.Time { return now }
	handler := limiter.middleware(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	for i := 0; i < 2; i++ {
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/games", nil))
		if response.Code != http.StatusNoContent {
			t.Fatalf("request %d expected status %d, got %d", i+1, http.StatusNoContent, response.Code)
		}
	}

	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/games", nil))
	if response.Code != http.StatusTooManyRequests {
		t.Fatalf("expected status %d, got %d", http.StatusTooManyRequests, response.Code)
	}
}

func TestRedisWindowLimitUsesConfiguredRequestsPerMinute(t *testing.T) {
	limiter := newRedisRateLimiter(nil, 120, 40)
	if got := limiter.redisWindowLimit(); got != 120 {
		t.Fatalf("expected redis window limit 120, got %d", got)
	}
}
