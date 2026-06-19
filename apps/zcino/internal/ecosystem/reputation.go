package ecosystem

import "time"

type ReputationEngine struct {
	reputations map[string]Reputation
}

func NewReputationEngine(initial ...Reputation) *ReputationEngine {
	engine := &ReputationEngine{reputations: make(map[string]Reputation, len(initial))}
	for _, reputation := range initial {
		engine.reputations[reputation.OrgID] = reputation
	}
	return engine
}

func (e *ReputationEngine) Get(orgID string) Reputation {
	if e == nil || e.reputations == nil {
		return Reputation{OrgID: orgID, Score: 1}
	}
	reputation, ok := e.reputations[orgID]
	if !ok {
		return Reputation{OrgID: orgID, Score: 1}
	}
	return reputation
}

func (e *ReputationEngine) RecordCompletion(completion TaskCompletion, payment Payment) Reputation {
	if e.reputations == nil {
		e.reputations = make(map[string]Reputation)
	}
	reputation := e.Get(completion.BidderOrgID)
	if completion.Success {
		reputation.CompletedTasks++
		reputation.RevenueCredits += payment.Amount
		reputation.Score = clamp(reputation.Score + (completion.QualityScore * 0.05))
	} else {
		reputation.FailedTasks++
		reputation.Score = clamp(reputation.Score - 0.15)
	}
	reputation.LastUpdatedTime = time.Now().UTC()
	e.reputations[completion.BidderOrgID] = reputation
	return reputation
}

func ReputationAdjustedScore(bid Bid, reputation Reputation) float64 {
	return bid.Score * clamp(reputation.Score)
}

func clamp(value float64) float64 {
	if value < 0 {
		return 0
	}
	if value > 2 {
		return 2
	}
	return value
}
