package gateway

import (
	"context"
	"net/http"
)

type AuthorizationInput struct {
	Claims      Claims
	Scope       string
	MerchantID  string
	CountryCode string
	AmountMinor int64
}

type AuthorizationDecision struct {
	Allowed   bool
	Reason    string
	RiskScore int
}

type PolicyEngine struct {
	permissionMatrix *PermissionMatrix
	merchantPolicy   *MerchantPolicy
	countryPolicy    *CountryPolicy
	velocityLimiter  *VelocityLimiter
	riskEngine       *RiskEngine
	riskThreshold    int
}

func NewPolicyEngine(
	permissionMatrix *PermissionMatrix,
	merchantPolicy *MerchantPolicy,
	countryPolicy *CountryPolicy,
	velocityLimiter *VelocityLimiter,
	riskEngine *RiskEngine,
	riskThreshold int,
) *PolicyEngine {
	if riskThreshold <= 0 {
		riskThreshold = 70
	}
	return &PolicyEngine{
		permissionMatrix: permissionMatrix,
		merchantPolicy:   merchantPolicy,
		countryPolicy:    countryPolicy,
		velocityLimiter:  velocityLimiter,
		riskEngine:       riskEngine,
		riskThreshold:    riskThreshold,
	}
}

func (e *PolicyEngine) Evaluate(ctx context.Context, in AuthorizationInput) AuthorizationDecision {
	_ = ctx
	normalizedScope := NormalizeScopes([]string{in.Scope})
	if len(normalizedScope) == 0 {
		return AuthorizationDecision{Allowed: false, Reason: "deny_by_default_missing_scope"}
	}
	scope := normalizedScope[0]

	if in.Claims.Subject == "" {
		return AuthorizationDecision{Allowed: false, Reason: "deny_by_default_missing_subject"}
	}

	// Payment scope + RBAC integration.
	if !HasScope(in.Claims.Scope, scope) {
		if e.permissionMatrix == nil || !e.permissionMatrix.Allows(in.Claims.Roles, scope) {
			return AuthorizationDecision{Allowed: false, Reason: "insufficient_scope_or_role"}
		}
	}

	if e.merchantPolicy != nil && !e.merchantPolicy.Allowed(in.MerchantID) {
		return AuthorizationDecision{Allowed: false, Reason: "merchant_restricted"}
	}

	if e.countryPolicy != nil && !e.countryPolicy.Allowed(in.CountryCode) {
		return AuthorizationDecision{Allowed: false, Reason: "country_restricted"}
	}

	velocityKey := in.Claims.Subject + ":" + normalizePolicyValue(in.MerchantID)
	if e.velocityLimiter != nil && !e.velocityLimiter.Allow(velocityKey) {
		return AuthorizationDecision{Allowed: false, Reason: "velocity_limit_exceeded"}
	}

	risk := 0
	if e.riskEngine != nil {
		risk = e.riskEngine.Score(RiskInput{
			AmountMinor: in.AmountMinor,
			CountryCode: in.CountryCode,
			MerchantID:  in.MerchantID,
		})
		if risk >= e.riskThreshold {
			return AuthorizationDecision{Allowed: false, Reason: "risk_threshold_exceeded", RiskScore: risk}
		}
	}

	return AuthorizationDecision{Allowed: true, Reason: "allowed", RiskScore: risk}
}

func AuthorizationMiddleware(engine *DecisionEngine, scope string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := ClaimsFromContext(r.Context())
			if !ok {
				http.Error(w, "forbidden", http.StatusForbidden)
				return
			}
			decision := engine.Decide(r.Context(), AuthorizationInput{
				Claims:      claims,
				Scope:       scope,
				MerchantID:  r.Header.Get("X-Merchant-ID"),
				CountryCode: r.Header.Get("X-Country"),
			})
			if !decision.Allowed {
				http.Error(w, decision.Reason, http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
