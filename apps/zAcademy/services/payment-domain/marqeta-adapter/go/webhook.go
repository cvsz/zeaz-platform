package marqeta

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
)

type WebhookEvent struct {
	Type string
	Body []byte
	Sig  string
}

type WebhookHandler interface {
	Handle(context.Context, WebhookEvent) error
}

func VerifyWebhookSignature(secret string, body []byte, signature string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write(body)
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}

func ProcessWebhook(ctx context.Context, secret string, event WebhookEvent, handler WebhookHandler, dlq DeadLetterQueue) error {
	if !VerifyWebhookSignature(secret, event.Body, event.Sig) {
		err := errors.New("invalid webhook signature")
		_ = dlq.Enqueue(ctx, DeadLetterMessage{Reason: err.Error(), Payload: event.Body})
		return err
	}
	if err := handler.Handle(ctx, event); err != nil {
		_ = dlq.Enqueue(ctx, DeadLetterMessage{Reason: err.Error(), Payload: event.Body})
		return err
	}
	return nil
}
