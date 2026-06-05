package marqeta

import (
	"context"
	"errors"
	"net"
	"net/http"
	"sync"
	"time"
)

type Doer func(*http.Request) (*http.Response, error)
type Middleware func(Doer) Doer

func Chain(mw ...Middleware) Middleware {
	return func(next Doer) Doer {
		for i := len(mw) - 1; i >= 0; i-- {
			next = mw[i](next)
		}
		return next
	}
}

func AuthMiddleware(appToken, accessToken string) Middleware {
	header := basicAuthHeader(appToken, accessToken)
	return func(next Doer) Doer {
		return func(req *http.Request) (*http.Response, error) {
			req.Header.Set("Authorization", header)
			return next(req)
		}
	}
}

func ContextPropagationMiddleware() Middleware {
	return func(next Doer) Doer {
		return func(req *http.Request) (*http.Response, error) {
			if rid := req.Context().Value(contextKeyRequestID{}); rid != nil {
				if s, ok := rid.(string); ok && s != "" {
					req.Header.Set("X-Request-ID", s)
				}
			}
			return next(req)
		}
	}
}

func TimeoutMiddleware(timeout time.Duration) Middleware {
	if timeout <= 0 {
		timeout = 10 * time.Second
	}
	return func(next Doer) Doer {
		return func(req *http.Request) (*http.Response, error) {
			ctx, cancel := context.WithTimeout(req.Context(), timeout)
			defer cancel()
			return next(req.WithContext(ctx))
		}
	}
}

type TokenBucketLimiter struct {
	ch <-chan time.Time
}

func NewTokenBucketLimiter(ratePerSec int, burst int) *TokenBucketLimiter {
	if ratePerSec <= 0 {
		ratePerSec = 10
	}
	if burst <= 0 {
		burst = ratePerSec
	}
	ticker := time.NewTicker(time.Second / time.Duration(ratePerSec))
	ch := make(chan time.Time, burst)
	go func() {
		for t := range ticker.C {
			select {
			case ch <- t:
			default:
			}
		}
	}()
	return &TokenBucketLimiter{ch: ch}
}

func (l *TokenBucketLimiter) Wait(ctx context.Context) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-l.ch:
		return nil
	}
}

func RateLimitMiddleware(l *TokenBucketLimiter) Middleware {
	return func(next Doer) Doer {
		return func(req *http.Request) (*http.Response, error) {
			if err := l.Wait(req.Context()); err != nil {
				return nil, err
			}
			return next(req)
		}
	}
}

type CircuitBreakerConfig struct {
	FailureThreshold int
	OpenWindow       time.Duration
}

type CircuitBreaker struct {
	mu       sync.Mutex
	fails    int
	openTill time.Time
	cfg      CircuitBreakerConfig
}

func NewCircuitBreaker(cfg CircuitBreakerConfig) *CircuitBreaker {
	if cfg.FailureThreshold <= 0 {
		cfg.FailureThreshold = 5
	}
	if cfg.OpenWindow <= 0 {
		cfg.OpenWindow = 5 * time.Second
	}
	return &CircuitBreaker{cfg: cfg}
}

func (c *CircuitBreaker) before(now time.Time) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if now.Before(c.openTill) {
		return errors.New("circuit breaker open")
	}
	return nil
}

func (c *CircuitBreaker) after(now time.Time, resp *http.Response, err error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if err == nil && resp != nil && resp.StatusCode < 500 {
		c.fails = 0
		return
	}
	c.fails++
	if c.fails >= c.cfg.FailureThreshold {
		c.openTill = now.Add(c.cfg.OpenWindow)
		c.fails = 0
	}
}

func CircuitBreakerMiddleware(cb *CircuitBreaker) Middleware {
	return func(next Doer) Doer {
		return func(req *http.Request) (*http.Response, error) {
			now := time.Now().UTC()
			if err := cb.before(now); err != nil {
				return nil, err
			}
			resp, err := next(req)
			cb.after(time.Now().UTC(), resp, err)
			return resp, err
		}
	}
}

func RetryMiddleware(policy RetryPolicy, metrics MetricsRecorder) Middleware {
	p := policy.normalize()
	return func(next Doer) Doer {
		return func(req *http.Request) (*http.Response, error) {
			var lastResp *http.Response
			var lastErr error
			for attempt := 1; attempt <= p.MaxAttempts; attempt++ {
				cloned := req.Clone(req.Context())
				lastResp, lastErr = next(cloned)
				if !shouldRetry(lastResp, lastErr) {
					return lastResp, lastErr
				}
				metrics.Inc("marqeta_retry_total", map[string]string{"attempt": itoa(attempt)})
				if attempt < p.MaxAttempts {
					select {
					case <-req.Context().Done():
						return nil, req.Context().Err()
					case <-time.After(backoff(attempt, p.BaseBackoff, p.MaxBackoff)):
					}
				}
			}
			return lastResp, lastErr
		}
	}
}

func isTimeoutErr(err error) bool {
	var nerr net.Error
	if errors.As(err, &nerr) {
		return nerr.Timeout()
	}
	return errors.Is(err, context.DeadlineExceeded)
}
