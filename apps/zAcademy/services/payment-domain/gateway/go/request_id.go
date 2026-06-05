package gateway

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"
)

type requestIDKey struct{}

const RequestIDHeader = "X-Request-ID"

func RequestIDFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(requestIDKey{}).(string); ok {
		return v
	}
	return ""
}

func RequestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rid := r.Header.Get(RequestIDHeader)
		if rid == "" {
			rid = generateRequestID()
		}
		w.Header().Set(RequestIDHeader, rid)
		ctx := context.WithValue(r.Context(), requestIDKey{}, rid)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func generateRequestID() string {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return "fallback-request-id"
	}
	return hex.EncodeToString(buf)
}
