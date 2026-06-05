package gateway

import (
	"context"
	"net/http"
	"time"
)

type Span interface {
	End()
	RecordError(error)
	SetAttribute(string, string)
}

type Tracer interface {
	Start(ctx context.Context, name string) (context.Context, Span)
}

type noopSpan struct{}

func (noopSpan) End()                            {}
func (noopSpan) RecordError(_ error)             {}
func (noopSpan) SetAttribute(_, _ string)        {}

type NoopTracer struct{}

func (NoopTracer) Start(ctx context.Context, _ string) (context.Context, Span) {
	return ctx, noopSpan{}
}

func TracingMiddleware(tracer Tracer) func(http.Handler) http.Handler {
	if tracer == nil {
		tracer = NoopTracer{}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx, span := tracer.Start(r.Context(), r.Method+" "+r.URL.Path)
			start := time.Now()
			span.SetAttribute("http.method", r.Method)
			span.SetAttribute("http.route", r.URL.Path)
			next.ServeHTTP(w, r.WithContext(ctx))
			span.SetAttribute("duration_ms", time.Since(start).String())
			span.End()
		})
	}
}
