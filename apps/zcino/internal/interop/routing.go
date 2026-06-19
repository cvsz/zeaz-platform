package interop

import "fmt"

// Guardrails constrain cross-ecosystem routing before any external call occurs.
type Guardrails struct {
	MaxExternalSpend float64
	Blacklist        map[string]bool
	FailureThreshold float64
	AllowInternal    bool
}

// RouteTask selects the highest-reputation eligible partner. It skips disabled,
// blacklisted, over-budget, and circuit-broken partners, and can fall back to an
// internal organization when allowed by guardrails.
func RouteTask(task Task, partners []Org, guardrails Guardrails) (Org, error) {
	var best Org
	found := false

	for _, partner := range partners {
		if !eligible(task, partner, guardrails) {
			continue
		}
		if !found || partner.Reputation > best.Reputation || (partner.Reputation == best.Reputation && partner.ID < best.ID) {
			best = partner
			found = true
		}
	}

	if !found {
		return Org{}, fmt.Errorf("no eligible interop partner")
	}
	return best, nil
}

// CircuitOpen returns true when a partner should be temporarily disabled.
func CircuitOpen(failureRate float64, threshold float64) bool {
	if threshold <= 0 {
		threshold = 0.20
	}
	return failureRate > threshold
}

func eligible(task Task, partner Org, guardrails Guardrails) bool {
	if partner.Disabled {
		return false
	}
	if guardrails.Blacklist != nil && guardrails.Blacklist[partner.ID] {
		return false
	}
	if CircuitOpen(partner.FailureRate, guardrails.FailureThreshold) {
		return false
	}
	if partner.InternalOnly {
		return guardrails.AllowInternal
	}
	if guardrails.MaxExternalSpend > 0 && task.Budget > guardrails.MaxExternalSpend {
		return false
	}
	return true
}
