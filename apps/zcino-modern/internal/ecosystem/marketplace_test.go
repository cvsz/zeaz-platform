package ecosystem

import (
	"testing"
)

func TestMarketplaceSignedTaskBidCompletionFlow(t *testing.T) {
	requesterKeys, err := GenerateIdentity()
	if err != nil {
		t.Fatalf("generate requester identity: %v", err)
	}
	growthKeys, err := GenerateIdentity()
	if err != nil {
		t.Fatalf("generate bidder identity: %v", err)
	}
	infraKeys, err := GenerateIdentity()
	if err != nil {
		t.Fatalf("generate second bidder identity: %v", err)
	}

	trust, err := NewTrustRegistry(
		Org{ID: "product-org", Name: "Product Org", Role: OrgRoleProduct, PublicKey: requesterKeys.PublicKey, Active: true},
		Org{ID: "growth-org", Name: "Growth Org", Role: OrgRoleGrowth, PublicKey: growthKeys.PublicKey, Active: true},
		Org{ID: "infra-org", Name: "Infra Org", Role: OrgRoleInfra, PublicKey: infraKeys.PublicKey, Active: true},
	)
	if err != nil {
		t.Fatalf("new trust registry: %v", err)
	}

	market := NewMarketplace(
		trust,
		NewGovernance(Guardrails{MaxSpendPerOrg: 100}),
		NewReputationEngine(Reputation{OrgID: "growth-org", Score: 1.2}, Reputation{OrgID: "infra-org", Score: 0.8}),
	)

	task := Task{ID: "task-1", RequesterOrgID: "product-org", Type: "landing-page-optimization", Budget: 20, MaxRisk: 0.4}
	taskMsg, err := CanonicalBytes(unsignedTask(task))
	if err != nil {
		t.Fatalf("canonical task: %v", err)
	}
	if ack := market.SubmitTask(task, Sign(taskMsg, requesterKeys.PrivateKey)); !ack.Accepted {
		t.Fatalf("submit task rejected: %s", ack.Reason)
	}

	growthBid := Bid{ID: "bid-growth", TaskID: task.ID, BidderOrgID: "growth-org", Cost: 10, Score: 8, Risk: 0.2}
	growthMsg, err := CanonicalBytes(unsignedBid(growthBid))
	if err != nil {
		t.Fatalf("canonical growth bid: %v", err)
	}
	if ack := market.SubmitBid(growthBid, Sign(growthMsg, growthKeys.PrivateKey)); !ack.Accepted {
		t.Fatalf("submit growth bid rejected: %s", ack.Reason)
	}

	infraBid := Bid{ID: "bid-infra", TaskID: task.ID, BidderOrgID: "infra-org", Cost: 9, Score: 8, Risk: 0.2}
	infraMsg, err := CanonicalBytes(unsignedBid(infraBid))
	if err != nil {
		t.Fatalf("canonical infra bid: %v", err)
	}
	if ack := market.SubmitBid(infraBid, Sign(infraMsg, infraKeys.PrivateKey)); !ack.Accepted {
		t.Fatalf("submit infra bid rejected: %s", ack.Reason)
	}

	best, err := market.SelectBest(task.ID)
	if err != nil {
		t.Fatalf("select best: %v", err)
	}
	if best.ID != "bid-growth" {
		t.Fatalf("expected reputation-adjusted growth bid to win, got %q", best.ID)
	}

	completion := TaskCompletion{TaskID: task.ID, BidderOrgID: "growth-org", Success: true, QualityScore: 0.9, ResultRef: "artifact://task-1"}
	completionMsg, err := CanonicalBytes(completion)
	if err != nil {
		t.Fatalf("canonical completion: %v", err)
	}
	payment, ack := market.CompleteTask(completion, Sign(completionMsg, growthKeys.PrivateKey))
	if !ack.Accepted {
		t.Fatalf("complete task rejected: %s", ack.Reason)
	}
	if payment.FromOrg != "product-org" || payment.ToOrg != "growth-org" || payment.Amount != 10 {
		t.Fatalf("unexpected payment: %#v", payment)
	}
	if got := market.Reputation.Get("growth-org"); got.CompletedTasks != 1 || got.RevenueCredits != 10 || got.Score <= 1.2 {
		t.Fatalf("reputation was not updated: %#v", got)
	}
}

func TestMarketplaceRejectsInvalidSignatureAndGuardrailViolations(t *testing.T) {
	requesterKeys, err := GenerateIdentity()
	if err != nil {
		t.Fatalf("generate requester identity: %v", err)
	}
	bidderKeys, err := GenerateIdentity()
	if err != nil {
		t.Fatalf("generate bidder identity: %v", err)
	}
	attackerKeys, err := GenerateIdentity()
	if err != nil {
		t.Fatalf("generate attacker identity: %v", err)
	}

	trust, err := NewTrustRegistry(
		Org{ID: "requester", Role: OrgRoleProduct, PublicKey: requesterKeys.PublicKey, Active: true},
		Org{ID: "bidder", Role: OrgRoleAI, PublicKey: bidderKeys.PublicKey, Active: true},
	)
	if err != nil {
		t.Fatalf("new trust registry: %v", err)
	}
	market := NewMarketplace(trust, NewGovernance(Guardrails{MaxSpendPerOrg: 15}), nil)

	task := Task{ID: "task-guarded", RequesterOrgID: "requester", Type: "copy-test", Budget: 10, MaxRisk: 0.3}
	taskMsg, err := CanonicalBytes(unsignedTask(task))
	if err != nil {
		t.Fatalf("canonical task: %v", err)
	}
	if ack := market.SubmitTask(task, Sign(taskMsg, attackerKeys.PrivateKey)); ack.Accepted {
		t.Fatal("expected task signed by attacker key to be rejected")
	}
	if ack := market.SubmitTask(task, Sign(taskMsg, requesterKeys.PrivateKey)); !ack.Accepted {
		t.Fatalf("submit task rejected: %s", ack.Reason)
	}

	riskyBid := Bid{ID: "risky", TaskID: task.ID, BidderOrgID: "bidder", Cost: 8, Score: 10, Risk: 0.9}
	riskyMsg, err := CanonicalBytes(unsignedBid(riskyBid))
	if err != nil {
		t.Fatalf("canonical risky bid: %v", err)
	}
	if ack := market.SubmitBid(riskyBid, Sign(riskyMsg, bidderKeys.PrivateKey)); ack.Accepted {
		t.Fatal("expected risky bid to be rejected")
	}

	expensiveBid := Bid{ID: "expensive", TaskID: task.ID, BidderOrgID: "bidder", Cost: 11, Score: 10, Risk: 0.1}
	expensiveMsg, err := CanonicalBytes(unsignedBid(expensiveBid))
	if err != nil {
		t.Fatalf("canonical expensive bid: %v", err)
	}
	if ack := market.SubmitBid(expensiveBid, Sign(expensiveMsg, bidderKeys.PrivateKey)); ack.Accepted {
		t.Fatal("expected over-budget bid to be rejected")
	}
}
