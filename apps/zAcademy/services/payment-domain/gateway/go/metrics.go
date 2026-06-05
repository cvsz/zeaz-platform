package gateway

import (
	"fmt"
	"net/http"
	"sort"
	"strings"
	"sync"
)

type Metrics struct {
	mu       sync.Mutex
	counter  map[string]float64
	histSum  map[string]float64
	histCnt  map[string]uint64
}

func NewMetrics() *Metrics {
	return &Metrics{
		counter: make(map[string]float64),
		histSum: make(map[string]float64),
		histCnt: make(map[string]uint64),
	}
}

func (m *Metrics) IncCounter(name string, labels map[string]string, v float64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.counter[metricKey(name, labels)] += v
}

func (m *Metrics) ObserveHistogram(name string, labels map[string]string, value float64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	k := metricKey(name, labels)
	m.histSum[k] += value
	m.histCnt[k]++
}

func (m *Metrics) PrometheusHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/plain; version=0.0.4")
		_, _ = w.Write([]byte(m.RenderPrometheus()))
	})
}

func (m *Metrics) RenderPrometheus() string {
	m.mu.Lock()
	defer m.mu.Unlock()
	keys := make([]string, 0, len(m.counter)+len(m.histCnt)*2)
	for k := range m.counter {
		keys = append(keys, k)
	}
	for k := range m.histCnt {
		keys = append(keys, k+"_sum", k+"_count")
	}
	sort.Strings(keys)
	var b strings.Builder
	seen := make(map[string]struct{}, len(keys))
	for _, k := range keys {
		if _, ok := seen[k]; ok {
			continue
		}
		seen[k] = struct{}{}
		if strings.HasSuffix(k, "_sum") {
			base := strings.TrimSuffix(k, "_sum")
			_, _ = fmt.Fprintf(&b, "%s_sum %f\n", base, m.histSum[base])
			continue
		}
		if strings.HasSuffix(k, "_count") {
			base := strings.TrimSuffix(k, "_count")
			_, _ = fmt.Fprintf(&b, "%s_count %d\n", base, m.histCnt[base])
			continue
		}
		if v, ok := m.counter[k]; ok {
			_, _ = fmt.Fprintf(&b, "%s %f\n", k, v)
		}
	}
	return b.String()
}

func metricKey(name string, labels map[string]string) string {
	if len(labels) == 0 {
		return name
	}
	keys := make([]string, 0, len(labels))
	for k := range labels {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	var b strings.Builder
	b.WriteString(name)
	b.WriteByte('{')
	for i, k := range keys {
		if i > 0 {
			b.WriteByte(',')
		}
		b.WriteString(k)
		b.WriteString("=\"")
		b.WriteString(strings.ReplaceAll(labels[k], "\"", "\\\""))
		b.WriteByte('"')
	}
	b.WriteByte('}')
	return b.String()
}
