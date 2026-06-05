package marqeta

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"testing"
)

type badHandler struct{}

func (badHandler) Handle(context.Context, WebhookEvent) error { return errors.New("failed") }

func TestProcessWebhookDLQOnFailure(t *testing.T) {
	secret := "s"
	body := []byte("{}")
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write(body)
	sig := hex.EncodeToString(mac.Sum(nil))
	dlq := NewMemoryDeadLetterQueue()
	err := ProcessWebhook(context.Background(), secret, WebhookEvent{Type: "x", Body: body, Sig: sig}, badHandler{}, dlq)
	if err == nil {
		t.Fatalf("expected handler error")
	}
	if len(dlq.Items()) != 1 {
		t.Fatalf("expected dlq item")
	}
}
