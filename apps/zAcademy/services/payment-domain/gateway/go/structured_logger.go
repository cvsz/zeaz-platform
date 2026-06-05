package gateway

import (
	"context"
	"io"
	"log/slog"
	"os"
)

type StructuredLogger struct {
	base *slog.Logger
}

func NewStructuredLogger(w io.Writer) *StructuredLogger {
	if w == nil {
		w = os.Stdout
	}
	h := slog.NewJSONHandler(w, &slog.HandlerOptions{Level: slog.LevelInfo})
	return &StructuredLogger{base: slog.New(h)}
}

func (l *StructuredLogger) WithRequest(ctx context.Context) *slog.Logger {
	requestID := RequestIDFromContext(ctx)
	if requestID == "" {
		return l.base
	}
	return l.base.With("request_id", requestID)
}

func (l *StructuredLogger) Info(ctx context.Context, msg string, args ...any) {
	l.WithRequest(ctx).Info(msg, args...)
}

func (l *StructuredLogger) Error(ctx context.Context, msg string, args ...any) {
	l.WithRequest(ctx).Error(msg, args...)
}
