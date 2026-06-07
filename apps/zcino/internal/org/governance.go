package org

import (
	"fmt"
	"strings"
	"time"

	"game-catalog-service/internal/evolution"
)

const (
	RoleCEO = "ceo"
	RoleCFO = "cfo"
	RoleCTO = "cto"
	RoleCPO = "cpo"

	OrgExecutive = "executive"
	OrgProduct   = "product"
	OrgGrowth    = "growth"
	OrgInfra     = "infra"

	AuthorityStrategy = "strategy"
	AuthorityBudget   = "budget"
	AuthorityInfra    = "infra"
	AuthorityProduct  = "product"
)

type Agent struct {
	ID          string
	Role        string
	Org         string
	Authorities map[string]bool
}

type Vote struct {
	AgentID string
	Approve bool
	Reason  string
}

type DecisionRecord struct {
	ProposalID string
	Allowed    bool
	Reason     string
	Approvals  int
	Quorum     int
	Voters     []string
	DecidedAt  time.Time
}

type Governance struct {
	Agents    map[string]Agent
	Quorum    int
	Policy    evolution.PolicyEngine
	Economics evolution.EconomicController
}

func DefaultAgents() []Agent {
	return []Agent{
		{ID: "ceo", Role: RoleCEO, Org: OrgExecutive, Authorities: map[string]bool{AuthorityStrategy: true}},
		{ID: "cfo", Role: RoleCFO, Org: OrgExecutive, Authorities: map[string]bool{AuthorityBudget: true}},
		{ID: "cto", Role: RoleCTO, Org: OrgExecutive, Authorities: map[string]bool{AuthorityInfra: true}},
		{ID: "cpo", Role: RoleCPO, Org: OrgExecutive, Authorities: map[string]bool{AuthorityProduct: true}},
	}
}

func NewGovernance(agents []Agent, quorum int, policy evolution.Policy, budget evolution.Budget) Governance {
	if len(agents) == 0 {
		agents = DefaultAgents()
	}
	if quorum <= 0 {
		quorum = 3
	}
	indexed := make(map[string]Agent, len(agents))
	for _, agent := range agents {
		if strings.TrimSpace(agent.ID) == "" {
			continue
		}
		indexed[agent.ID] = agent
	}
	return Governance{
		Agents:    indexed,
		Quorum:    quorum,
		Policy:    evolution.NewPolicyEngine(policy),
		Economics: evolution.NewEconomicController(budget),
	}
}

func (g Governance) Decide(proposal evolution.Proposal, votes []Vote) DecisionRecord {
	record := DecisionRecord{ProposalID: proposal.ID, Quorum: g.Quorum, DecidedAt: time.Now().UTC()}
	if g.Quorum <= 0 {
		record.Quorum = 3
	}
	seen := map[string]bool{}
	hasAuthorizedSponsor := false
	for _, vote := range votes {
		agent, ok := g.Agents[vote.AgentID]
		if !ok || seen[vote.AgentID] {
			continue
		}
		seen[vote.AgentID] = true
		record.Voters = append(record.Voters, vote.AgentID)
		if !vote.Approve {
			continue
		}
		record.Approvals++
		if agent.CanSponsor(proposal) {
			hasAuthorizedSponsor = true
		}
	}
	if !hasAuthorizedSponsor {
		record.Reason = fmt.Sprintf("no approving agent has authority for %q proposal", proposal.Type)
		return record
	}
	if record.Approvals < record.Quorum {
		record.Reason = fmt.Sprintf("quorum not met: %d/%d approvals", record.Approvals, record.Quorum)
		return record
	}
	if evaluation := g.Policy.Evaluate(proposal); !evaluation.Allowed {
		record.Reason = evaluation.Reason
		return record
	}
	if evaluation := g.Economics.Evaluate(proposal); !evaluation.Allowed {
		record.Reason = evaluation.Reason
		return record
	}
	record.Allowed = true
	record.Reason = "proposal approved by quorum, policy, and budget"
	return record
}

func (a Agent) CanSponsor(p evolution.Proposal) bool {
	switch p.Type {
	case evolution.ProposalTypeStrategy:
		return a.Authorities[AuthorityStrategy] || a.Authorities[AuthorityProduct]
	case evolution.ProposalTypeInfra:
		return a.Authorities[AuthorityInfra] || a.Authorities[AuthorityBudget]
	case evolution.ProposalTypeCode:
		return a.Authorities[AuthorityProduct] || a.Authorities[AuthorityInfra]
	default:
		return false
	}
}
