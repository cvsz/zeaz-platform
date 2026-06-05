package provider

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type HTTPAdapterConfig struct {
	Provider       string
	Endpoint       string
	APIKey         string
	HeaderName     string
	Timeout        time.Duration
	MaxRetries     int
	RetryBackoff   time.Duration
	RequireTLS     bool
	ResponseMapper func([]byte) ([]RawGame, error)
}

type HTTPAdapter struct {
	cfg    HTTPAdapterConfig
	client *http.Client
}

func NewHTTPAdapter(cfg HTTPAdapterConfig) (*HTTPAdapter, error) {
	providerName := strings.TrimSpace(cfg.Provider)
	if providerName == "" {
		return nil, fmt.Errorf("provider name is required")
	}
	endpoint, err := url.Parse(strings.TrimSpace(cfg.Endpoint))
	if err != nil || endpoint.Scheme == "" || endpoint.Host == "" {
		return nil, fmt.Errorf("valid provider endpoint is required")
	}
	if cfg.RequireTLS && endpoint.Scheme != "https" {
		return nil, fmt.Errorf("provider %s endpoint must use https", providerName)
	}
	if cfg.ResponseMapper == nil {
		return nil, fmt.Errorf("response mapper is required")
	}
	if cfg.Timeout <= 0 {
		cfg.Timeout = 10 * time.Second
	}
	if cfg.MaxRetries <= 0 {
		cfg.MaxRetries = 3
	}
	if cfg.RetryBackoff <= 0 {
		cfg.RetryBackoff = 200 * time.Millisecond
	}
	if cfg.HeaderName == "" {
		cfg.HeaderName = "Authorization"
	}
	return &HTTPAdapter{
		cfg: cfg,
		client: &http.Client{
			Timeout:   cfg.Timeout,
			Transport: &http.Transport{TLSClientConfig: &tls.Config{MinVersion: tls.VersionTLS12}},
		},
	}, nil
}

func (a *HTTPAdapter) GetGames() ([]Game, error) {
	ctx, cancel := context.WithTimeout(context.Background(), a.cfg.Timeout*time.Duration(a.cfg.MaxRetries+1))
	defer cancel()
	return a.GetGamesContext(ctx)
}

func (a *HTTPAdapter) GetGamesContext(ctx context.Context) ([]Game, error) {
	var lastErr error
	for attempt := 0; attempt <= a.cfg.MaxRetries; attempt++ {
		games, err := a.fetchOnce(ctx)
		if err == nil {
			return games, nil
		}
		lastErr = err
		if !retryable(err) || attempt == a.cfg.MaxRetries {
			break
		}
		timer := time.NewTimer(a.cfg.RetryBackoff * time.Duration(1<<attempt))
		select {
		case <-ctx.Done():
			timer.Stop()
			return nil, ctx.Err()
		case <-timer.C:
		}
	}
	return nil, fmt.Errorf("fetch provider %s games: %w", a.cfg.Provider, lastErr)
}

func (a *HTTPAdapter) fetchOnce(ctx context.Context) ([]Game, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, a.cfg.Endpoint, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "zeaz-provider-adapter/1.0")
	if a.cfg.APIKey != "" {
		if strings.EqualFold(a.cfg.HeaderName, "Authorization") {
			req.Header.Set(a.cfg.HeaderName, "Bearer "+a.cfg.APIKey)
		} else {
			req.Header.Set(a.cfg.HeaderName, a.cfg.APIKey)
		}
	}
	resp, err := a.client.Do(req)
	if err != nil {
		return nil, transientError{err: err}
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusTooManyRequests || resp.StatusCode >= http.StatusInternalServerError {
		_, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, 4096))
		return nil, transientError{err: fmt.Errorf("upstream status %d", resp.StatusCode)}
	}
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return nil, fmt.Errorf("upstream status %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	body, err := io.ReadAll(io.LimitReader(resp.Body, 8<<20))
	if err != nil {
		return nil, err
	}
	rawGames, err := a.cfg.ResponseMapper(body)
	if err != nil {
		return nil, err
	}
	games := make([]Game, 0, len(rawGames))
	for _, raw := range rawGames {
		if raw.Provider == "" {
			raw.Provider = a.cfg.Provider
		}
		game, err := NormalizeGame(raw)
		if err != nil {
			return nil, err
		}
		games = append(games, game)
	}
	return games, nil
}

func MapRawGameArray(body []byte) ([]RawGame, error) {
	var games []RawGame
	if err := json.Unmarshal(body, &games); err != nil {
		return nil, err
	}
	return games, nil
}

type transientError struct{ err error }

func (e transientError) Error() string { return e.err.Error() }
func (e transientError) Unwrap() error { return e.err }

func retryable(err error) bool {
	var transient transientError
	return err != nil && (strings.Contains(err.Error(), "timeout") || strings.Contains(err.Error(), "connection") || strings.Contains(err.Error(), "upstream status 429") || strings.Contains(err.Error(), "upstream status 5") || errors.As(err, &transient))
}
