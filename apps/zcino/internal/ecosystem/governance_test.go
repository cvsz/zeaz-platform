package ecosystem

import (
	"testing"
	"time"
)

func TestGovernanceWeightedProposalVoting(t *testing.T) {
	opened := time.Date(2026, 5, 6, 12, 0, 0, 0, time.UTC)
	governance := NewGovernance(Guardrails{})
	governance.Quorum = 1.5

	proposal := Proposal{
		ID:            "zep-10",
		Title:         "Standardize protocol economics",
		Kind:          ProposalKindEconomics,
		TargetVersion: "1.1.0",
		CreatedBy:     "core-maintainer",
		CreatedAt:     opened,
		ClosesAt:      opened.Add(24 * time.Hour),
		Changes:       []string{"define unit of account", "require deterministic settlement"},
	}
	if err := governance.SubmitProposal(proposal); err != nil {
		t.Fatalf("submit proposal: %v", err)
	}
	if err := governance.CastVote(proposal.ID, Vote{Node: "node-a", Weight: 1.0, Value: true}, opened.Add(time.Hour)); err != nil {
		t.Fatalf("cast yes vote: %v", err)
	}
	if err := governance.CastVote(proposal.ID, Vote{Node: "node-b", Weight: 0.75, Value: true}, opened.Add(2*time.Hour)); err != nil {
		t.Fatalf("cast second yes vote: %v", err)
	}
	if err := governance.CastVote(proposal.ID, Vote{Node: "node-c", Weight: 0.5, Value: false}, opened.Add(3*time.Hour)); err != nil {
		t.Fatalf("cast no vote: %v", err)
	}

	tally, err := governance.Tally(proposal.ID, opened.Add(25*time.Hour))
	if err != nil {
		t.Fatalf("tally: %v", err)
	}
	if !tally.Passed || tally.Status != ProposalStatusAccepted {
		t.Fatalf("expected accepted proposal, got %+v", tally)
	}
	if tally.YesWeight != 1.75 || tally.NoWeight != 0.5 || tally.QuorumWeight != 1.5 {
		t.Fatalf("unexpected vote weights: %+v", tally)
	}
}

func TestGovernanceRejectsInvalidAndLateVotes(t *testing.T) {
	opened := time.Date(2026, 5, 6, 12, 0, 0, 0, time.UTC)
	governance := NewGovernance(Guardrails{})
	proposal := Proposal{ID: "zep-late", Title: "Compatibility window", Kind: ProposalKindSpec, CreatedBy: "maintainer", CreatedAt: opened, ClosesAt: opened.Add(time.Hour)}
	if err := governance.SubmitProposal(proposal); err != nil {
		t.Fatalf("submit proposal: %v", err)
	}
	if err := governance.CastVote(proposal.ID, Vote{Node: "node-a", Weight: 0, Value: true}, opened.Add(30*time.Minute)); err == nil {
		t.Fatal("expected zero-weight vote to be rejected")
	}
	if err := governance.CastVote(proposal.ID, Vote{Node: "node-a", Weight: 1, Value: true}, opened.Add(2*time.Hour)); err == nil {
		t.Fatal("expected late vote to be rejected")
	}
}
