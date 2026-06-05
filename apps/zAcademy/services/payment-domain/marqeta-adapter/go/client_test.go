package marqeta

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestClientCreateVirtualCard(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") == "" {
			t.Fatalf("missing authorization header")
		}
		if r.Header.Get("X-Request-ID") != "req-1" {
			t.Fatalf("missing propagated request id")
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(Card{Token: "card_1", State: "ACTIVE"})
	}))
	defer srv.Close()

	c, err := NewClient(ClientConfig{BaseURL: srv.URL, AppToken: "app", AccessToken: "access", Timeout: time.Second, RetryPolicy: RetryPolicy{MaxAttempts: 1}, BreakerConfig: CircuitBreakerConfig{FailureThreshold: 3, OpenWindow: time.Second}})
	if err != nil {
		t.Fatal(err)
	}
	ctx := WithRequestID(context.Background(), "req-1")
	card, err := c.CreateVirtualCard(ctx, CreateCardRequest{UserToken: "u1"})
	if err != nil {
		t.Fatal(err)
	}
	if card.Token != "card_1" {
		t.Fatalf("unexpected token: %s", card.Token)
	}
}
