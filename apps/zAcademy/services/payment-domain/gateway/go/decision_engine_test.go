package gateway

import (
	"context"
	"testing"
	"time"
)

func TestDecisionEngine_DenyByDefaultMissingScope(t *testing.T) {
	engine := NewDecisionEngine(NewPolicyEngine(
		DefaultPaymentPermissionMatrix(),
		NewMerchantPolicy(nil, nil),
		NewCountryPolicy(nil, nil),
		NewVelocityLimiter(2, time.Minute),
		NewRiskEngine(RiskRule{}),
		70,
	), nil)

	decision := engine.Decide(context.Background(), AuthorizationInput{
		Claims: Claims{Subject: "user-1", Scope: []string{ScopePaymentRead}, Roles: []string{"payment_operator"}},
		Scope:  "",
	})
	if decision.Allowed {
		t.Fatalf("expected deny by default")
	}
}

func TestDecisionEngine_RBACAndScopeAllow(t *testing.T) {
	engine := NewDecisionEngine(NewPolicyEngine(
		DefaultPaymentPermissionMatrix(),
		NewMerchantPolicy([]string{"M1"}, nil),
		NewCountryPolicy([]string{"US"}, nil),
		NewVelocityLimiter(2, time.Minute),
		NewRiskEngine(RiskRule{}),
		70,
	), nil)

	decision := engine.Decide(context.Background(), AuthorizationInput{
		Claims:      Claims{Subject: "user-1", Scope: []string{ScopePaymentRead}, Roles: []string{"payment_operator"}},
		Scope:       ScopePaymentWrite,
		MerchantID:  "M1",
		CountryCode: "US",
		AmountMinor: 1000,
	})
	if !decision.Allowed {
		t.Fatalf("expected allowed, got denied: %s", decision.Reason)
	}
}

func TestDecisionEngine_MerchantRestricted(t *testing.T) {
	engine := NewDecisionEngine(NewPolicyEngine(
		DefaultPaymentPermissionMatrix(),
		NewMerchantPolicy([]string{"M1"}, []string{"M2"}),
		NewCountryPolicy([]string{"US"}, nil),
		NewVelocityLimiter(2, time.Minute),
		NewRiskEngine(RiskRule{}),
		70,
	), nil)

	decision := engine.Decide(context.Background(), AuthorizationInput{
		Claims:      Claims{Subject: "user-1", Roles: []string{"payment_admin"}},
		Scope:       ScopePaymentWrite,
		MerchantID:  "M2",
		CountryCode: "US",
	})
	if decision.Allowed || decision.Reason != "merchant_restricted" {
		t.Fatalf("expected merchant restriction deny, got %+v", decision)
	}
}

func TestDecisionEngine_CountryRestricted(t *testing.T) {
	engine := NewDecisionEngine(NewPolicyEngine(
		DefaultPaymentPermissionMatrix(),
		NewMerchantPolicy(nil, nil),
		NewCountryPolicy([]string{"US"}, []string{"IR"}),
		NewVelocityLimiter(2, time.Minute),
		NewRiskEngine(RiskRule{}),
		70,
	), nil)

	decision := engine.Decide(context.Background(), AuthorizationInput{
		Claims:      Claims{Subject: "user-1", Roles: []string{"payment_admin"}},
		Scope:       ScopePaymentWrite,
		MerchantID:  "M9",
		CountryCode: "IR",
	})
	if decision.Allowed || decision.Reason != "country_restricted" {
		t.Fatalf("expected country restriction deny, got %+v", decision)
	}
}

func TestDecisionEngine_VelocityLimit(t *testing.T) {
	limiter := NewVelocityLimiter(1, time.Minute)
	engine := NewDecisionEngine(NewPolicyEngine(
		DefaultPaymentPermissionMatrix(),
		NewMerchantPolicy(nil, nil),
		NewCountryPolicy(nil, nil),
		limiter,
		NewRiskEngine(RiskRule{}),
		70,
	), nil)

	in := AuthorizationInput{
		Claims:      Claims{Subject: "user-1", Roles: []string{"payment_admin"}},
		Scope:       ScopePaymentWrite,
		MerchantID:  "M1",
		CountryCode: "US",
	}
	if d := engine.Decide(context.Background(), in); !d.Allowed {
		t.Fatalf("first call should pass")
	}
	if d := engine.Decide(context.Background(), in); d.Allowed || d.Reason != "velocity_limit_exceeded" {
		t.Fatalf("expected velocity limit deny, got %+v", d)
	}
}

func TestDecisionEngine_RiskScoring(t *testing.T) {
	risk := NewRiskEngine(RiskRule{
		CountryWeight:  map[string]int{"NG": 35},
		MerchantWeight: map[string]int{"M-RISK": 20},
		AmountSteps:    []AmountRiskStep{{ThresholdMinor: 100000, Score: 25}},
	})
	engine := NewDecisionEngine(NewPolicyEngine(
		DefaultPaymentPermissionMatrix(),
		NewMerchantPolicy(nil, nil),
		NewCountryPolicy(nil, nil),
		NewVelocityLimiter(5, time.Minute),
		risk,
		70,
	), nil)

	decision := engine.Decide(context.Background(), AuthorizationInput{
		Claims:      Claims{Subject: "user-1", Roles: []string{"payment_admin"}},
		Scope:       ScopePaymentWrite,
		MerchantID:  "M-RISK",
		CountryCode: "NG",
		AmountMinor: 150000,
	})
	if decision.Allowed || decision.Reason != "risk_threshold_exceeded" {
		t.Fatalf("expected risk deny, got %+v", decision)
	}
	if decision.RiskScore < 70 {
		t.Fatalf("expected risk >= threshold, got %d", decision.RiskScore)
	}
}
