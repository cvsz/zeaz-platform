package marqeta

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
	Start(context.Context, string) (context.Context, Span)
}

type noopSpan struct{}

func (noopSpan) End()                     {}
func (noopSpan) RecordError(_ error)      {}
func (noopSpan) SetAttribute(_, _ string) {}

type NoopTracer struct{}

func (NoopTracer) Start(ctx context.Context, _ string) (context.Context, Span) {
	return ctx, noopSpan{}
}

func TracingMiddleware(tracer Tracer) Middleware {
	return func(next Doer) Doer {
		return func(req *http.Request) (*http.Response, error) {
			ctx, span := tracer.Start(req.Context(), "marqeta.http")
			start := time.Now()
			span.SetAttribute("http.method", req.Method)
			span.SetAttribute("http.url", req.URL.String())
			resp, err := next(req.WithContext(ctx))
			span.SetAttribute("latency_ms", time.Since(start).String())
			if err != nil {
				span.RecordError(err)
			}
			if resp != nil {
				span.SetAttribute("http.status", itoa(resp.StatusCode))
			}
			span.End()
			return resp, err
		}
	}
}

type MetricsRecorder interface {
	Inc(string, map[string]string)
	Observe(string, float64, map[string]string)
}

type NopMetrics struct{}

func (NopMetrics) Inc(string, map[string]string)              {}
func (NopMetrics) Observe(string, float64, map[string]string) {}

func MetricsMiddleware(m MetricsRecorder) Middleware {
	return func(next Doer) Doer {
		return func(req *http.Request) (*http.Response, error) {
			start := time.Now()
			resp, err := next(req)
			labels := map[string]string{"method": req.Method}
			if resp != nil {
				labels["status"] = itoa(resp.StatusCode)
			}
			if err != nil {
				labels["error"] = "true"
			}
			m.Inc("marqeta_http_requests_total", labels)
			m.Observe("marqeta_http_latency_seconds", time.Since(start).Seconds(), labels)
			return resp, err
		}
	}
}

type contextKeyRequestID struct{}

func WithRequestID(ctx context.Context, id string) context.Context {
	return context.WithValue(ctx, contextKeyRequestID{}, id)
}
