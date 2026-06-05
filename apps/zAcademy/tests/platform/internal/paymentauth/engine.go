package paymentauth

import (
	"context"
	"errors"
	"strings"
	"time"
)

var (
	ErrDenied       = errors.New("denied")
	ErrRateLimited  = errors.New("rate_limited")
	ErrRiskRejected = errors.New("risk_rejected")
)

type Decision struct {
	Allowed bool
	Reason  string
}

type Input struct {
	Subject   string
	Roles     []string
	Scopes    []string
	Amount    int64
	Country   string
	Merchant  string
	Timestamp time.Time
}

type RBAC interface {
	Allowed(roles []string, scope string) bool
}

type Risk interface {
	Score(ctx context.Context, in Input) int
}

type Velocity interface {
	Allow(subject string, at time.Time) bool
}

type Engine struct {
	RequiredScope string
	RBAC          RBAC
	Risk          Risk
	Velocity      Velocity
	RiskThreshold int
	AllowedGeo    map[string]struct{}
	BlockedMIDs   map[string]struct{}
}

func (e Engine) Evaluate(ctx context.Context, in Input) (Decision, error) {
	if in.Subject == "" {
		return Decision{Allowed: false, Reason: "missing_subject"}, ErrDenied
	}
	if e.RequiredScope == "" {
		return Decision{Allowed: false, Reason: "misconfigured_scope"}, ErrDenied
	}
	if !hasScope(in.Scopes, e.RequiredScope) && (e.RBAC == nil || !e.RBAC.Allowed(in.Roles, e.RequiredScope)) {
		return Decision{Allowed: false, Reason: "insufficient_scope"}, ErrDenied
	}
	if len(e.AllowedGeo) > 0 {
		if _, ok := e.AllowedGeo[strings.ToUpper(strings.TrimSpace(in.Country))]; !ok {
			return Decision{Allowed: false, Reason: "country_restricted"}, ErrDenied
		}
	}
	if _, blocked := e.BlockedMIDs[strings.ToUpper(strings.TrimSpace(in.Merchant))]; blocked {
		return Decision{Allowed: false, Reason: "merchant_restricted"}, ErrDenied
	}
	if e.Velocity != nil && !e.Velocity.Allow(in.Subject, in.Timestamp) {
		return Decision{Allowed: false, Reason: "velocity_limited"}, ErrRateLimited
	}
	if e.Risk != nil {
		score := e.Risk.Score(ctx, in)
		if score >= e.effectiveThreshold() {
			return Decision{Allowed: false, Reason: "risk_rejected"}, ErrRiskRejected
		}
	}
	return Decision{Allowed: true, Reason: "allowed"}, nil
}

func (e Engine) effectiveThreshold() int {
	if e.RiskThreshold <= 0 {
		return 70
	}
	return e.RiskThreshold
}

func hasScope(scopes []string, required string) bool {
	required = strings.ToLower(strings.TrimSpace(required))
	for _, s := range scopes {
		if strings.ToLower(strings.TrimSpace(s)) == required {
			return true
		}
	}
	return false
}
