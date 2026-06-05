package chaos

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"
)

type breaker struct {
	fails int32
	open  int32
}

func (b *breaker) call(fn func() error) error {
	if atomic.LoadInt32(&b.open) == 1 {
		return errors.New("open")
	}
	err := fn()
	if err != nil {
		if atomic.AddInt32(&b.fails, 1) >= 3 {
			atomic.StoreInt32(&b.open, 1)
		}
		return err
	}
	atomic.StoreInt32(&b.fails, 0)
	return nil
}

func TestFailureInjectionCircuitOpens(t *testing.T) {
	var fail int32 = 1
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		if atomic.LoadInt32(&fail) == 1 {
			http.Error(w, "boom", 500)
			return
		}
		w.WriteHeader(200)
	}))
	defer upstream.Close()

	client := &http.Client{Timeout: 200 * time.Millisecond}
	cb := &breaker{}

	call := func() error {
		resp, err := client.Get(upstream.URL)
		if err != nil { return err }
		defer resp.Body.Close()
		if resp.StatusCode >= 500 { return errors.New("upstream_5xx") }
		return nil
	}

	for i := 0; i < 3; i++ {
		if err := cb.call(call); err == nil { t.Fatalf("expected failure") }
	}
	if err := cb.call(call); err == nil || err.Error() != "open" {
		t.Fatalf("expected open circuit, got %v", err)
	}
}
