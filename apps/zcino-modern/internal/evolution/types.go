package evolution

import (
	"fmt"
	"strings"
	"time"
)

const (
	ProposalTypeCode     = "code"
	ProposalTypeInfra    = "infra"
	ProposalTypeStrategy = "strategy"

	StatusRejected  = "rejected"
	StatusValidated = "validated"
	StatusCanary    = "canary"
)

type Proposal struct {
	ID            string
	Type          string
	Description   string
	Risk          float64
	Change        string
	EstimatedCost float64
	Metadata      map[string]string
}

type Result struct {
	ProposalID string
	Status     string
	Success    bool
	Score      float64
	Reason     string
	StartedAt  time.Time
	FinishedAt time.Time
}

type Evaluation struct {
	Allowed bool
	Reason  string
}

type Budget struct {
	HourlyLimit float64
	CurrentCost float64
	Reserved    float64
}

func (b Budget) Remaining() float64 {
	remaining := b.HourlyLimit - b.CurrentCost - b.Reserved
	if remaining < 0 {
		return 0
	}
	return remaining
}

func (p Proposal) Validate() error {
	if strings.TrimSpace(p.ID) == "" {
		return fmt.Errorf("proposal id is required")
	}
	if strings.TrimSpace(p.Description) == "" {
		return fmt.Errorf("proposal description is required")
	}
	switch p.Type {
	case ProposalTypeCode, ProposalTypeInfra, ProposalTypeStrategy:
		return nil
	default:
		return fmt.Errorf("unsupported proposal type %q", p.Type)
	}
}
