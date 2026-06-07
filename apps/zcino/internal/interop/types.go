package interop

import "time"

// Task is the stable cross-ecosystem task contract used by gateways and
// adapters before it is serialized to gRPC or JSON fallback transports.
type Task struct {
	ID       string
	Type     string
	Budget   float64
	Origin   string
	Deadline time.Time
}

// Response is the normalized result returned by every partner adapter.
type Response struct {
	Accepted bool
	Score    float64
	Reason   string
}

// Org describes a partner ecosystem visible to the global routing layer.
type Org struct {
	ID           string
	Domain       string
	Reputation   float64
	FailureRate  float64
	Disabled     bool
	InternalOnly bool
}

// Settlement records a cross-ecosystem accounting entry. V8 intentionally uses
// internal credits plus reconciliation before introducing external currencies.
type Settlement struct {
	FromEcosystem string
	ToEcosystem   string
	Amount        float64
	Currency      string
	TaskID        string
	CreatedAt     time.Time
}
