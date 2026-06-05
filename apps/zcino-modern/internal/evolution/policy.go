package evolution

import "fmt"

type Policy struct {
	MaxRisk          float64
	AllowedTypes     map[string]bool
	ForbiddenChanges map[string]bool
}

func DefaultPolicy() Policy {
	return Policy{
		MaxRisk: 0.7,
		AllowedTypes: map[string]bool{
			ProposalTypeCode:     true,
			ProposalTypeInfra:    true,
			ProposalTypeStrategy: true,
		},
		ForbiddenChanges: map[string]bool{
			"delete_cluster":          true,
			"direct_production_write": true,
			"disable_observability":   true,
			"unbounded_resources":     true,
			"auto_merge":              true,
		},
	}
}

type PolicyEngine struct {
	policy Policy
}

func NewPolicyEngine(policy Policy) PolicyEngine {
	if policy.MaxRisk <= 0 {
		policy.MaxRisk = DefaultPolicy().MaxRisk
	}
	if policy.AllowedTypes == nil {
		policy.AllowedTypes = DefaultPolicy().AllowedTypes
	}
	if policy.ForbiddenChanges == nil {
		policy.ForbiddenChanges = DefaultPolicy().ForbiddenChanges
	}
	return PolicyEngine{policy: policy}
}

func (e PolicyEngine) Evaluate(p Proposal) Evaluation {
	if err := p.Validate(); err != nil {
		return Evaluation{Reason: err.Error()}
	}
	if p.Risk < 0 || p.Risk > 1 {
		return Evaluation{Reason: "risk must be between 0 and 1"}
	}
	if p.Risk > e.policy.MaxRisk {
		return Evaluation{Reason: fmt.Sprintf("risk %.2f exceeds max %.2f", p.Risk, e.policy.MaxRisk)}
	}
	if !e.policy.AllowedTypes[p.Type] {
		return Evaluation{Reason: fmt.Sprintf("proposal type %q is not allowed", p.Type)}
	}
	if e.policy.ForbiddenChanges[p.Change] {
		return Evaluation{Reason: fmt.Sprintf("change %q is forbidden by policy", p.Change)}
	}
	return Evaluation{Allowed: true, Reason: "policy accepted proposal"}
}

func Evaluate(p Proposal) bool {
	return NewPolicyEngine(DefaultPolicy()).Evaluate(p).Allowed
}
