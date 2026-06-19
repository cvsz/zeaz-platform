package evolution

type RegoInput struct {
	TenantID        string        `json:"tenant_id"`
	RealMoney       bool          `json:"real_money"`
	Country         string        `json:"country"`
	Risk            float64       `json:"risk"`
	Type            string        `json:"type"`
	Change          string        `json:"change"`
	RequestedAction string        `json:"requested_action"`
	Metrics         RegoMetrics   `json:"metrics"`
	Guardrails      RegoGuardrails `json:"guardrails"`
}

type RegoMetrics struct {
	KillSwitchActive bool    `json:"kill_switch_active"`
	ErrorRate        float64 `json:"error_rate"`
	BudgetPerHour    float64 `json:"budget_per_hour"`
	SpendPerHour     float64 `json:"spend_per_hour"`
}

type RegoGuardrails struct {
	MaxErrorRate             float64 `json:"max_error_rate"`
	AllowDirectRiskyActions bool    `json:"allow_direct_risky_actions"`
}

func RegoInputFromProposal(p Proposal) RegoInput {
	input := RegoInput{
		Risk:   p.Risk,
		Type:   p.Type,
		Change: p.Change,
	}
	if p.Metadata != nil {
		if v, ok := p.Metadata["tenant_id"]; ok {
			input.TenantID = v
		}
		if v, ok := p.Metadata["country"]; ok {
			input.Country = v
		}
		if v, ok := p.Metadata["requested_action"]; ok {
			input.RequestedAction = v
		}
	}
	return input
}
