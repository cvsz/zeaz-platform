package gateway

type RiskInput struct {
	AmountMinor int64
	CountryCode string
	MerchantID  string
}

type RiskRule struct {
	CountryWeight  map[string]int
	MerchantWeight map[string]int
	AmountSteps    []AmountRiskStep
}

type AmountRiskStep struct {
	ThresholdMinor int64
	Score          int
}

type RiskEngine struct {
	rules RiskRule
}

func NewRiskEngine(rules RiskRule) *RiskEngine {
	return &RiskEngine{rules: rules}
}

func (r *RiskEngine) Score(in RiskInput) int {
	score := 0
	cc := normalizePolicyValue(in.CountryCode)
	merchant := normalizePolicyValue(in.MerchantID)
	score += r.rules.CountryWeight[cc]
	score += r.rules.MerchantWeight[merchant]
	for _, step := range r.rules.AmountSteps {
		if in.AmountMinor >= step.ThresholdMinor {
			score += step.Score
		}
	}
	if score < 0 {
		return 0
	}
	if score > 100 {
		return 100
	}
	return score
}
