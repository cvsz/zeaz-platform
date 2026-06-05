package paymentauth

import (
	"context"
	"errors"
	"testing"
	"time"
)

type testRBAC struct{ allow bool }
func (t testRBAC) Allowed(_ []string, _ string) bool { return t.allow }

type testRisk struct{ score int }
func (t testRisk) Score(_ context.Context, _ Input) int { return t.score }

type testVelocity struct{ allow bool }
func (t testVelocity) Allow(_ string, _ time.Time) bool { return t.allow }

func mkEngine() Engine {
	return Engine{
		RequiredScope: "payment:write",
		RBAC:          testRBAC{allow: false},
		Risk:          testRisk{score: 10},
		Velocity:      testVelocity{allow: true},
		RiskThreshold: 70,
		AllowedGeo:    map[string]struct{}{"US": {}},
		BlockedMIDs:   map[string]struct{}{"M-BLOCK": {}},
	}
}

func mkInput() Input {
	return Input{Subject: "u1", Scopes: []string{"payment:write"}, Country: "US", Merchant: "M-1", Timestamp: time.Now().UTC()}
}

func TestEvaluate_Allowed(t *testing.T) {
	d, err := mkEngine().Evaluate(context.Background(), mkInput())
	if err != nil || !d.Allowed {
		t.Fatalf("expected allowed, got %+v err=%v", d, err)
	}
}

func TestEvaluate_Denies(t *testing.T) {
	tests := []struct {
		name string
		mut  func(*Engine, *Input)
		err  error
	}{
		{"missing_subject", func(_ *Engine, in *Input) { in.Subject = "" }, ErrDenied},
		{"missing_scope", func(_ *Engine, in *Input) { in.Scopes = nil }, ErrDenied},
		{"country", func(_ *Engine, in *Input) { in.Country = "FR" }, ErrDenied},
		{"merchant", func(_ *Engine, in *Input) { in.Merchant = "M-BLOCK" }, ErrDenied},
		{"velocity", func(e *Engine, _ *Input) { e.Velocity = testVelocity{allow: false} }, ErrRateLimited},
		{"risk", func(e *Engine, _ *Input) { e.Risk = testRisk{score: 90} }, ErrRiskRejected},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			e := mkEngine(); in := mkInput(); tc.mut(&e, &in)
			_, err := e.Evaluate(context.Background(), in)
			if !errors.Is(err, tc.err) {
				t.Fatalf("expected %v, got %v", tc.err, err)
			}
		})
	}
}

func TestEvaluate_RBACFallbackAndThreshold(t *testing.T) {
	e := mkEngine()
	in := mkInput()
	in.Scopes = nil
	e.RBAC = testRBAC{allow: true}
	if _, err := e.Evaluate(context.Background(), in); err != nil {
		t.Fatalf("expected rbac allow: %v", err)
	}
	e.RiskThreshold = 0
	e.Risk = testRisk{score: 70}
	if _, err := e.Evaluate(context.Background(), mkInput()); !errors.Is(err, ErrRiskRejected) {
		t.Fatalf("expected default threshold reject")
	}
}

func TestHasScope(t *testing.T) {
	if !hasScope([]string{" Payment:Write "}, "payment:write") {
		t.Fatalf("expected normalized match")
	}
	if hasScope([]string{"payment:read"}, "payment:write") {
		t.Fatalf("unexpected scope match")
	}
}
