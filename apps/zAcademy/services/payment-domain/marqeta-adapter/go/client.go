package marqeta

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type ClientConfig struct {
	BaseURL         string
	AppToken        string
	AccessToken     string
	Timeout         time.Duration
	RateLimitPerSec int
	RetryPolicy     RetryPolicy
	BreakerConfig   CircuitBreakerConfig
	DeadLetter      DeadLetterQueue
	Audit           AuditSink
	Metrics         MetricsRecorder
	Tracer          Tracer
}

type Client struct {
	baseURL    *url.URL
	http       *http.Client
	middleware []Middleware
	deadLetter DeadLetterQueue
	audit      AuditSink
	metrics    MetricsRecorder
	tracer     Tracer
}

func NewClient(cfg ClientConfig) (*Client, error) {
	if cfg.BaseURL == "" {
		return nil, fmt.Errorf("base url required")
	}
	u, err := url.Parse(strings.TrimRight(cfg.BaseURL, "/"))
	if err != nil {
		return nil, err
	}
	if cfg.Timeout <= 0 {
		cfg.Timeout = 10 * time.Second
	}
	if cfg.RateLimitPerSec <= 0 {
		cfg.RateLimitPerSec = 10
	}
	if cfg.DeadLetter == nil {
		cfg.DeadLetter = NewMemoryDeadLetterQueue()
	}
	if cfg.Audit == nil {
		cfg.Audit = NopAuditSink{}
	}
	if cfg.Metrics == nil {
		cfg.Metrics = NopMetrics{}
	}
	if cfg.Tracer == nil {
		cfg.Tracer = NoopTracer{}
	}

	c := &Client{
		baseURL:    u,
		http:       &http.Client{Timeout: cfg.Timeout},
		deadLetter: cfg.DeadLetter,
		audit:      cfg.Audit,
		metrics:    cfg.Metrics,
		tracer:     cfg.Tracer,
	}

	c.middleware = []Middleware{
		AuthMiddleware(cfg.AppToken, cfg.AccessToken),
		ContextPropagationMiddleware(),
		RateLimitMiddleware(NewTokenBucketLimiter(cfg.RateLimitPerSec, cfg.RateLimitPerSec)),
		CircuitBreakerMiddleware(NewCircuitBreaker(cfg.BreakerConfig)),
		RetryMiddleware(cfg.RetryPolicy, c.metrics),
		TimeoutMiddleware(cfg.Timeout),
		TracingMiddleware(c.tracer),
		MetricsMiddleware(c.metrics),
		AuditMiddleware(c.audit),
		DeadLetterMiddleware(c.deadLetter),
	}
	return c, nil
}

func (c *Client) doJSON(ctx context.Context, method, path string, reqBody any, out any) error {
	var body io.Reader
	if reqBody != nil {
		b, err := json.Marshal(reqBody)
		if err != nil {
			return err
		}
		body = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.baseURL.String()+path, body)
	if err != nil {
		return err
	}
	if reqBody != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	res, err := Chain(c.middleware...)(c.http.Do)(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		raw, _ := io.ReadAll(io.LimitReader(res.Body, 8192))
		return APIError{StatusCode: res.StatusCode, Body: string(raw)}
	}
	if out == nil {
		return nil
	}
	return json.NewDecoder(res.Body).Decode(out)
}
