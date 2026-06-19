package metrics

import (
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
)

var (
	RequestCount = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests handled by path and status.",
		},
		[]string{"path", "method", "status"},
	)

	RequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration in seconds by path and method.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"path", "method"},
	)
)

func init() {
	prometheus.MustRegister(RequestCount, RequestDuration)
}

func Observe(path, method string, status int, duration time.Duration) {
	RequestCount.WithLabelValues(path, method, strconv.Itoa(status)).Inc()
	RequestDuration.WithLabelValues(path, method).Observe(duration.Seconds())
}
