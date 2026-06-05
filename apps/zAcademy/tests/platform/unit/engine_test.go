package unit

import (
	"context"
	"errors"
	"testing"
	"time"
	"zacademy/tests/platform/internal/paymentauth"
)

type fakeRBAC struct{ allow bool }
func (f fakeRBAC) Allowed(_ []string, _ string) bool { return f.allow }

type fakeRisk struct{ score int }
func (f fakeRisk) Score(_ context.Context, _ paymentauth.Input) int { return f.score }

type fakeVelocity struct{ allow bool }
func (f fakeVelocity) Allow(_ string, _ time.Time) bool { return f.allow }

func baseEngine() paymentauth.Engine {
	return paymentauth.Engine{
		RequiredScope: "payment:write",
		RBAC: fakeRBAC{allow: false},
		Risk: fakeRisk{score: 20},
		Velocity: fakeVelocity{allow: true},
		RiskThreshold: 70,
		AllowedGeo: map[string]struct{}{"US": {}},
		BlockedMIDs: map[string]struct{}{"M-BLOCK": {}},
	}
}

func baseInput() paymentauth.Input {
	return paymentauth.Input{Subject: "u1", Scopes: []string{"payment:write"}, Country: "us", Merchant: "M-1", Timestamp: time.Now().UTC()}
}

func TestEngineAllow(t *testing.T) {
	e := baseEngine()
	d, err := e.Evaluate(context.Background(), baseInput())
	if err != nil || !d.Allowed { t.Fatalf("expected allow got %+v err=%v", d, err) }
}

func TestEngineDenyMissingSubject(t *testing.T) {
	e := baseEngine(); in := baseInput(); in.Subject = ""
	_, err := e.Evaluate(context.Background(), in)
	if !errors.Is(err, paymentauth.ErrDenied) { t.Fatalf("expected denied") }
}

func TestEngineDenyScope(t *testing.T) {
	e := baseEngine(); in := baseInput(); in.Scopes = nil
	_, err := e.Evaluate(context.Background(), in)
	if !errors.Is(err, paymentauth.ErrDenied) { t.Fatalf("expected denied") }
}

func TestEngineAllowViaRBAC(t *testing.T) {
	e := baseEngine(); e.RBAC = fakeRBAC{allow: true}; in := baseInput(); in.Scopes = nil
	d, err := e.Evaluate(context.Background(), in)
	if err != nil || !d.Allowed { t.Fatalf("expected rbac allow") }
}

func TestEngineCountryRestriction(t *testing.T) {
	e := baseEngine(); in := baseInput(); in.Country = "FR"
	_, err := e.Evaluate(context.Background(), in)
	if !errors.Is(err, paymentauth.ErrDenied) { t.Fatalf("expected denied") }
}

func TestEngineMerchantRestriction(t *testing.T) {
	e := baseEngine(); in := baseInput(); in.Merchant = "m-block"
	_, err := e.Evaluate(context.Background(), in)
	if !errors.Is(err, paymentauth.ErrDenied) { t.Fatalf("expected denied") }
}

func TestEngineVelocityLimited(t *testing.T) {
	e := baseEngine(); e.Velocity = fakeVelocity{allow: false}
	_, err := e.Evaluate(context.Background(), baseInput())
	if !errors.Is(err, paymentauth.ErrRateLimited) { t.Fatalf("expected rate_limited") }
}

func TestEngineRiskRejected(t *testing.T) {
	e := baseEngine(); e.Risk = fakeRisk{score: 90}
	_, err := e.Evaluate(context.Background(), baseInput())
	if !errors.Is(err, paymentauth.ErrRiskRejected) { t.Fatalf("expected risk_rejected") }
}

func TestDefaultRiskThreshold(t *testing.T) {
	e := baseEngine(); e.RiskThreshold = 0; e.Risk = fakeRisk{score: 69}
	if _, err := e.Evaluate(context.Background(), baseInput()); err != nil { t.Fatalf("expected allow") }
	e.Risk = fakeRisk{score: 70}
	if _, err := e.Evaluate(context.Background(), baseInput()); !errors.Is(err, paymentauth.ErrRiskRejected) { t.Fatalf("expected reject") }
}
