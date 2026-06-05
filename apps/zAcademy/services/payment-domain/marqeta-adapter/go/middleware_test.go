package marqeta

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"
)

func TestRetryMiddlewareRetriesThenSucceeds(t *testing.T) {
	var calls int32
	do := func(*http.Request) (*http.Response, error) {
		c := atomic.AddInt32(&calls, 1)
		if c < 3 {
			return nil, errors.New("temporary")
		}
		return &http.Response{StatusCode: 200, Body: http.NoBody}, nil
	}
	wrapped := RetryMiddleware(RetryPolicy{MaxAttempts: 3, BaseBackoff: time.Millisecond, MaxBackoff: time.Millisecond}, NopMetrics{})(do)
	req := httptest.NewRequest(http.MethodGet, "http://x", nil)
	resp, err := wrapped(req)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("expected success, got resp=%v err=%v", resp, err)
	}
	if calls != 3 {
		t.Fatalf("expected 3 calls, got %d", calls)
	}
}

func TestCircuitBreakerOpens(t *testing.T) {
	cb := NewCircuitBreaker(CircuitBreakerConfig{FailureThreshold: 1, OpenWindow: time.Minute})
	do := CircuitBreakerMiddleware(cb)(func(*http.Request) (*http.Response, error) {
		return nil, errors.New("down")
	})
	req := httptest.NewRequest(http.MethodGet, "http://x", nil)
	_, _ = do(req)
	_, err := do(req)
	if err == nil {
		t.Fatalf("expected open circuit error")
	}
}

func TestRateLimitMiddleware(t *testing.T) {
	limiter := NewTokenBucketLimiter(1, 1)
	do := RateLimitMiddleware(limiter)(func(*http.Request) (*http.Response, error) {
		return &http.Response{StatusCode: 200, Body: http.NoBody}, nil
	})
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Millisecond)
	defer cancel()
	req := httptest.NewRequest(http.MethodGet, "http://x", nil).WithContext(ctx)
	_, err := do(req)
	if err == nil {
		t.Fatalf("expected timeout waiting for token")
	}
}
