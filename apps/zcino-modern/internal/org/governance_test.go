package org

import (
	"strings"
	"testing"

	"game-catalog-service/internal/evolution"
)

func TestGovernanceApprovesWithQuorumPolicyAndBudget(t *testing.T) {
	governance := NewGovernance(nil, 3, evolution.DefaultPolicy(), evolution.Budget{HourlyLimit: 100, CurrentCost: 20})
	proposal := evolution.Proposal{ID: "p1", Type: evolution.ProposalTypeStrategy, Description: "boost high conversion segment", Risk: 0.2, EstimatedCost: 10}
	votes := []Vote{{AgentID: "ceo", Approve: true}, {AgentID: "cpo", Approve: true}, {AgentID: "cto", Approve: true}, {AgentID: "cfo", Approve: false}}

	decision := governance.Decide(proposal, votes)

	if !decision.Allowed {
		t.Fatalf("decision = %+v, want approval", decision)
	}
	if decision.Approvals != 3 {
		t.Fatalf("approvals = %d, want 3", decision.Approvals)
	}
}

func TestGovernanceRejectsUnauthorizedApproval(t *testing.T) {
	governance := NewGovernance([]Agent{{ID: "ceo", Role: RoleCEO, Org: OrgExecutive, Authorities: map[string]bool{AuthorityStrategy: true}}}, 1, evolution.DefaultPolicy(), evolution.Budget{})
	proposal := evolution.Proposal{ID: "p1", Type: evolution.ProposalTypeInfra, Description: "scale nodes", Risk: 0.2}

	decision := governance.Decide(proposal, []Vote{{AgentID: "ceo", Approve: true}})

	if decision.Allowed {
		t.Fatal("CEO strategy-only authority should not sponsor infra proposal")
	}
	if !strings.Contains(decision.Reason, "no approving agent has authority") {
		t.Fatalf("reason = %q, want authority failure", decision.Reason)
	}
}

func TestGovernanceRejectsBudgetOverrunAfterQuorum(t *testing.T) {
	governance := NewGovernance(nil, 3, evolution.DefaultPolicy(), evolution.Budget{HourlyLimit: 50, CurrentCost: 45})
	proposal := evolution.Proposal{ID: "p1", Type: evolution.ProposalTypeCode, Description: "expensive experiment", Risk: 0.2, EstimatedCost: 10}

	decision := governance.Decide(proposal, []Vote{{AgentID: "cto", Approve: true}, {AgentID: "cpo", Approve: true}, {AgentID: "cfo", Approve: true}})

	if decision.Allowed {
		t.Fatal("budget overrun should reject proposal")
	}
	if !strings.Contains(decision.Reason, "exceeds remaining budget") {
		t.Fatalf("reason = %q, want budget failure", decision.Reason)
	}
}

func TestSelectBestBidUsesScoreThenCostWithinBudget(t *testing.T) {
	allocation, err := SelectBestBid(Task{ID: "t1", Name: "optimize lobby", Budget: 10}, []Bid{
		{AgentID: "expensive", Cost: 25, Score: 0.99},
		{AgentID: "winner", Cost: 8, Score: 0.90},
		{AgentID: "tie", Cost: 9, Score: 0.90},
		{AgentID: "cheap", Cost: 2, Score: 0.50},
	})
	if err != nil {
		t.Fatalf("SelectBestBid() error = %v", err)
	}
	if allocation.Bid.AgentID != "winner" {
		t.Fatalf("winner = %q", allocation.Bid.AgentID)
	}
}

func TestMemoryStoreReturnsBestStrategy(t *testing.T) {
	var store MemoryStore
	store.Record(Memory{Strategy: "a", Score: 0.4})
	store.Record(Memory{Strategy: "b", Score: 0.9})

	best, ok := store.BestStrategy()
	if !ok || best.Strategy != "b" {
		t.Fatalf("best = %+v, ok = %v", best, ok)
	}
	if len(store.Entries()) != 2 {
		t.Fatal("entries should return recorded memory")
	}
}
