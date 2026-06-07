package ecosystem

import (
	"fmt"
	"strings"
	"time"
)

type Guardrails struct {
	MaxSpendPerOrg          float64         `json:"max_spend_per_org"`
	MaxTrafficAllocationPct float64         `json:"max_traffic_allocation_pct"`
	KillSwitchOrgs          map[string]bool `json:"kill_switch_orgs,omitempty"`
	BlacklistedOrgs         map[string]bool `json:"blacklisted_orgs,omitempty"`
}

type ProposalKind string

const (
	ProposalKindSpec      ProposalKind = "spec"
	ProposalKindEconomics ProposalKind = "economics"
	ProposalKindRuntime   ProposalKind = "runtime"
)

type ProposalStatus string

const (
	ProposalStatusOpen     ProposalStatus = "open"
	ProposalStatusAccepted ProposalStatus = "accepted"
	ProposalStatusRejected ProposalStatus = "rejected"
)

type Proposal struct {
	ID            string         `json:"id"`
	Title         string         `json:"title"`
	Description   string         `json:"description,omitempty"`
	Kind          ProposalKind   `json:"kind"`
	TargetVersion string         `json:"target_version,omitempty"`
	CreatedBy     string         `json:"created_by"`
	CreatedAt     time.Time      `json:"created_at"`
	ClosesAt      time.Time      `json:"closes_at"`
	Status        ProposalStatus `json:"status"`
	Changes       []string       `json:"changes,omitempty"`
}

type Vote struct {
	Node   string  `json:"node"`
	Weight float64 `json:"weight"`
	Value  bool    `json:"value"`
}

type Tally struct {
	ProposalID   string         `json:"proposal_id"`
	YesWeight    float64        `json:"yes_weight"`
	NoWeight     float64        `json:"no_weight"`
	QuorumWeight float64        `json:"quorum_weight"`
	Passed       bool           `json:"passed"`
	Status       ProposalStatus `json:"status"`
}

type Governance struct {
	Guardrails Guardrails
	Quorum     float64
	spent      map[string]float64
	proposals  map[string]Proposal
	votes      map[string]map[string]Vote
}

func NewGovernance(guardrails Guardrails) *Governance {
	return &Governance{
		Guardrails: guardrails,
		Quorum:     1,
		spent:      make(map[string]float64),
		proposals:  make(map[string]Proposal),
		votes:      make(map[string]map[string]Vote),
	}
}

func (g *Governance) AllowTask(task Task) error {
	if g == nil {
		return nil
	}
	if g.Guardrails.KillSwitchOrgs[task.RequesterOrgID] {
		return fmt.Errorf("requester org %q is kill-switched", task.RequesterOrgID)
	}
	if g.Guardrails.BlacklistedOrgs[task.RequesterOrgID] {
		return fmt.Errorf("requester org %q is blacklisted", task.RequesterOrgID)
	}
	if g.Guardrails.MaxSpendPerOrg > 0 && g.spent[task.RequesterOrgID]+task.Budget > g.Guardrails.MaxSpendPerOrg {
		return fmt.Errorf("task budget exceeds max spend for org %q", task.RequesterOrgID)
	}
	return nil
}

func (g *Governance) AllowBid(task Task, bid Bid) error {
	if g == nil {
		return nil
	}
	if g.Guardrails.KillSwitchOrgs[bid.BidderOrgID] {
		return fmt.Errorf("bidder org %q is kill-switched", bid.BidderOrgID)
	}
	if g.Guardrails.BlacklistedOrgs[bid.BidderOrgID] {
		return fmt.Errorf("bidder org %q is blacklisted", bid.BidderOrgID)
	}
	if bid.Cost > task.Budget {
		return fmt.Errorf("bid cost exceeds task budget")
	}
	if bid.Risk > task.MaxRisk {
		return fmt.Errorf("bid risk exceeds task risk limit")
	}
	return nil
}

func (g *Governance) RecordPayment(payment Payment) {
	if g == nil {
		return
	}
	if g.spent == nil {
		g.spent = make(map[string]float64)
	}
	g.spent[payment.FromOrg] += payment.Amount
}

func (g *Governance) SubmitProposal(proposal Proposal) error {
	if g == nil {
		return fmt.Errorf("governance is not configured")
	}
	if strings.TrimSpace(proposal.ID) == "" {
		return fmt.Errorf("proposal id is required")
	}
	if strings.TrimSpace(proposal.Title) == "" {
		return fmt.Errorf("proposal title is required")
	}
	if strings.TrimSpace(proposal.CreatedBy) == "" {
		return fmt.Errorf("proposal creator is required")
	}
	if proposal.Kind == "" {
		return fmt.Errorf("proposal kind is required")
	}
	if proposal.CreatedAt.IsZero() {
		proposal.CreatedAt = time.Now().UTC()
	}
	if proposal.ClosesAt.IsZero() {
		proposal.ClosesAt = proposal.CreatedAt.Add(7 * 24 * time.Hour)
	}
	if !proposal.ClosesAt.After(proposal.CreatedAt) {
		return fmt.Errorf("proposal close time must be after creation time")
	}
	if proposal.Status == "" {
		proposal.Status = ProposalStatusOpen
	}
	if proposal.Status != ProposalStatusOpen {
		return fmt.Errorf("new proposals must start open")
	}
	g.ensureGovernanceMaps()
	if _, exists := g.proposals[proposal.ID]; exists {
		return fmt.Errorf("proposal %q already exists", proposal.ID)
	}
	proposal.Changes = append([]string(nil), proposal.Changes...)
	g.proposals[proposal.ID] = proposal
	return nil
}

func (g *Governance) CastVote(proposalID string, vote Vote, now time.Time) error {
	if g == nil {
		return fmt.Errorf("governance is not configured")
	}
	g.ensureGovernanceMaps()
	proposal, ok := g.proposals[proposalID]
	if !ok {
		return fmt.Errorf("unknown proposal %q", proposalID)
	}
	if proposal.Status != ProposalStatusOpen {
		return fmt.Errorf("proposal %q is %s", proposalID, proposal.Status)
	}
	if now.IsZero() {
		now = time.Now().UTC()
	}
	if now.After(proposal.ClosesAt) {
		return fmt.Errorf("proposal %q is closed", proposalID)
	}
	if strings.TrimSpace(vote.Node) == "" {
		return fmt.Errorf("vote node is required")
	}
	if vote.Weight <= 0 {
		return fmt.Errorf("vote weight must be positive")
	}
	if g.votes[proposalID] == nil {
		g.votes[proposalID] = make(map[string]Vote)
	}
	g.votes[proposalID][vote.Node] = vote
	return nil
}

func (g *Governance) Proposals() []Proposal {
	if g == nil {
		return nil
	}
	g.ensureGovernanceMaps()
	proposals := make([]Proposal, 0, len(g.proposals))
	for _, proposal := range g.proposals {
		proposal.Changes = append([]string(nil), proposal.Changes...)
		proposals = append(proposals, proposal)
	}
	return proposals
}

func (g *Governance) Proposal(id string) (Proposal, bool) {
	if g == nil {
		return Proposal{}, false
	}
	g.ensureGovernanceMaps()
	proposal, ok := g.proposals[id]
	proposal.Changes = append([]string(nil), proposal.Changes...)
	return proposal, ok
}

func (g *Governance) Tally(proposalID string, now time.Time) (Tally, error) {
	if g == nil {
		return Tally{}, fmt.Errorf("governance is not configured")
	}
	g.ensureGovernanceMaps()
	proposal, ok := g.proposals[proposalID]
	if !ok {
		return Tally{}, fmt.Errorf("unknown proposal %q", proposalID)
	}
	var tally Tally
	tally.ProposalID = proposalID
	tally.QuorumWeight = g.Quorum
	if tally.QuorumWeight <= 0 {
		tally.QuorumWeight = 1
	}
	for _, vote := range g.votes[proposalID] {
		if vote.Value {
			tally.YesWeight += vote.Weight
		} else {
			tally.NoWeight += vote.Weight
		}
	}
	tally.Passed = tally.YesWeight >= tally.QuorumWeight && tally.YesWeight > tally.NoWeight
	if now.IsZero() {
		now = time.Now().UTC()
	}
	tally.Status = proposal.Status
	if proposal.Status == ProposalStatusOpen && !now.Before(proposal.ClosesAt) {
		if tally.Passed {
			proposal.Status = ProposalStatusAccepted
		} else {
			proposal.Status = ProposalStatusRejected
		}
		g.proposals[proposalID] = proposal
		tally.Status = proposal.Status
	}
	return tally, nil
}

func (g *Governance) ensureGovernanceMaps() {
	if g.spent == nil {
		g.spent = make(map[string]float64)
	}
	if g.proposals == nil {
		g.proposals = make(map[string]Proposal)
	}
	if g.votes == nil {
		g.votes = make(map[string]map[string]Vote)
	}
}
