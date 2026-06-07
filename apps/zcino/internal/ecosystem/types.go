package ecosystem

import (
	"fmt"
	"strings"
	"time"
)

const (
	OrgRoleGrowth  = "growth"
	OrgRoleProduct = "product"
	OrgRoleInfra   = "infra"
	OrgRoleAI      = "ai"

	TaskStatusOpen      = "open"
	TaskStatusAssigned  = "assigned"
	TaskStatusCompleted = "completed"
)

type Org struct {
	ID        string
	Name      string
	Role      string
	PublicKey []byte
	Active    bool
}

type Task struct {
	ID             string
	RequesterOrgID string
	Type           string
	Budget         float64
	MaxRisk        float64
	Metadata       map[string]string
	Status         string
	CreatedAt      time.Time
}

type Bid struct {
	ID          string
	TaskID      string
	BidderOrgID string
	Cost        float64
	Score       float64
	Risk        float64
	Metadata    map[string]string
	CreatedAt   time.Time
}

type TaskCompletion struct {
	TaskID       string
	BidderOrgID  string
	Success      bool
	QualityScore float64
	ResultRef    string
}

type Payment struct {
	FromOrg string
	ToOrg   string
	Amount  float64
	TaskID  string
	At      time.Time
}

type Reputation struct {
	OrgID           string
	Score           float64
	CompletedTasks  int
	FailedTasks     int
	RevenueCredits  float64
	LastUpdatedTime time.Time
}

type OrgMemory struct {
	OrgID    string
	Strategy string
	Score    float64
	Private  bool
}

type Ack struct {
	Accepted bool
	Reason   string
}

func (o Org) Validate() error {
	if strings.TrimSpace(o.ID) == "" {
		return fmt.Errorf("org id is required")
	}
	if strings.TrimSpace(o.Role) == "" {
		return fmt.Errorf("org role is required")
	}
	if len(o.PublicKey) == 0 {
		return fmt.Errorf("org public key is required")
	}
	return nil
}

func (t Task) Validate() error {
	if strings.TrimSpace(t.ID) == "" {
		return fmt.Errorf("task id is required")
	}
	if strings.TrimSpace(t.RequesterOrgID) == "" {
		return fmt.Errorf("requester org id is required")
	}
	if strings.TrimSpace(t.Type) == "" {
		return fmt.Errorf("task type is required")
	}
	if t.Budget <= 0 {
		return fmt.Errorf("task budget must be positive")
	}
	if t.MaxRisk < 0 || t.MaxRisk > 1 {
		return fmt.Errorf("task max risk must be between 0 and 1")
	}
	return nil
}

func (b Bid) Validate() error {
	if strings.TrimSpace(b.ID) == "" {
		return fmt.Errorf("bid id is required")
	}
	if strings.TrimSpace(b.TaskID) == "" {
		return fmt.Errorf("task id is required")
	}
	if strings.TrimSpace(b.BidderOrgID) == "" {
		return fmt.Errorf("bidder org id is required")
	}
	if b.Cost <= 0 {
		return fmt.Errorf("bid cost must be positive")
	}
	if b.Score < 0 {
		return fmt.Errorf("bid score cannot be negative")
	}
	if b.Risk < 0 || b.Risk > 1 {
		return fmt.Errorf("bid risk must be between 0 and 1")
	}
	return nil
}
