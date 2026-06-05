package marqeta

import (
	"net/http"
	"time"
)

type RetryPolicy struct {
	MaxAttempts int
	BaseBackoff time.Duration
	MaxBackoff  time.Duration
}

func (p RetryPolicy) normalize() RetryPolicy {
	if p.MaxAttempts <= 0 {
		p.MaxAttempts = 3
	}
	if p.BaseBackoff <= 0 {
		p.BaseBackoff = 100 * time.Millisecond
	}
	if p.MaxBackoff <= 0 {
		p.MaxBackoff = 2 * time.Second
	}
	return p
}

func shouldRetry(resp *http.Response, err error) bool {
	if err != nil {
		return true
	}
	if resp == nil {
		return true
	}
	return resp.StatusCode == 429 || resp.StatusCode >= 500
}

func backoff(attempt int, base, max time.Duration) time.Duration {
	d := base << (attempt - 1)
	if d > max {
		return max
	}
	return d
}
