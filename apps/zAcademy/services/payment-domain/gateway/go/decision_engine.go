package gateway

import "context"

type DecisionEngine struct {
	policy *PolicyEngine
	tracer Tracer
}

func NewDecisionEngine(policy *PolicyEngine, tracer Tracer) *DecisionEngine {
	if tracer == nil {
		tracer = NoopTracer{}
	}
	return &DecisionEngine{policy: policy, tracer: tracer}
}

func (e *DecisionEngine) Decide(ctx context.Context, in AuthorizationInput) AuthorizationDecision {
	ctx, span := e.tracer.Start(ctx, "gateway.authorization.decision")
	defer span.End()
	span.SetAttribute("subject", in.Claims.Subject)
	span.SetAttribute("scope", in.Scope)
	span.SetAttribute("merchant", in.MerchantID)
	span.SetAttribute("country", in.CountryCode)

	decision := e.policy.Evaluate(ctx, in)
	if decision.Allowed {
		span.SetAttribute("decision", "allow")
	} else {
		span.SetAttribute("decision", "deny")
		span.SetAttribute("reason", decision.Reason)
	}
	return decision
}
