package ecosystem

import (
	"fmt"
	"time"
)

type Marketplace struct {
	Trust      *TrustRegistry
	Governance *Governance
	Reputation *ReputationEngine
	tasks      map[string]Task
	bids       map[string][]Bid
	payments   []Payment
}

func NewMarketplace(trust *TrustRegistry, governance *Governance, reputation *ReputationEngine) *Marketplace {
	if reputation == nil {
		reputation = NewReputationEngine()
	}
	return &Marketplace{
		Trust:      trust,
		Governance: governance,
		Reputation: reputation,
		tasks:      make(map[string]Task),
		bids:       make(map[string][]Bid),
	}
}

func (m *Marketplace) SubmitTask(task Task, signature []byte) Ack {
	if err := task.Validate(); err != nil {
		return Ack{Reason: err.Error()}
	}
	if m.Trust != nil {
		if err := m.Trust.VerifySignedPayload(task.RequesterOrgID, unsignedTask(task), signature); err != nil {
			return Ack{Reason: err.Error()}
		}
	}
	if err := m.Governance.AllowTask(task); err != nil {
		return Ack{Reason: err.Error()}
	}
	if _, exists := m.tasks[task.ID]; exists {
		return Ack{Reason: fmt.Sprintf("task %q already exists", task.ID)}
	}
	if task.CreatedAt.IsZero() {
		task.CreatedAt = time.Now().UTC()
	}
	task.Status = TaskStatusOpen
	m.tasks[task.ID] = task
	return Ack{Accepted: true, Reason: "task accepted"}
}

func (m *Marketplace) SubmitBid(bid Bid, signature []byte) Ack {
	if err := bid.Validate(); err != nil {
		return Ack{Reason: err.Error()}
	}
	if m.Trust != nil {
		if err := m.Trust.VerifySignedPayload(bid.BidderOrgID, unsignedBid(bid), signature); err != nil {
			return Ack{Reason: err.Error()}
		}
	}
	task, ok := m.tasks[bid.TaskID]
	if !ok {
		return Ack{Reason: fmt.Sprintf("unknown task %q", bid.TaskID)}
	}
	if task.Status != TaskStatusOpen {
		return Ack{Reason: fmt.Sprintf("task %q is not open", bid.TaskID)}
	}
	if err := m.Governance.AllowBid(task, bid); err != nil {
		return Ack{Reason: err.Error()}
	}
	if bid.CreatedAt.IsZero() {
		bid.CreatedAt = time.Now().UTC()
	}
	m.bids[bid.TaskID] = append(m.bids[bid.TaskID], bid)
	return Ack{Accepted: true, Reason: "bid accepted"}
}

func (m *Marketplace) SelectBest(taskID string) (Bid, error) {
	bids := m.bids[taskID]
	if len(bids) == 0 {
		return Bid{}, fmt.Errorf("no bids for task %q", taskID)
	}
	best := bids[0]
	bestValue := m.bidValue(best)
	for _, bid := range bids[1:] {
		if value := m.bidValue(bid); value > bestValue {
			best = bid
			bestValue = value
		}
	}
	task := m.tasks[taskID]
	task.Status = TaskStatusAssigned
	m.tasks[taskID] = task
	return best, nil
}

func (m *Marketplace) CompleteTask(completion TaskCompletion, signature []byte) (Payment, Ack) {
	if m.Trust != nil {
		if err := m.Trust.VerifySignedPayload(completion.BidderOrgID, completion, signature); err != nil {
			return Payment{}, Ack{Reason: err.Error()}
		}
	}
	task, ok := m.tasks[completion.TaskID]
	if !ok {
		return Payment{}, Ack{Reason: fmt.Sprintf("unknown task %q", completion.TaskID)}
	}
	selected, err := m.SelectBest(completion.TaskID)
	if err != nil {
		return Payment{}, Ack{Reason: err.Error()}
	}
	if selected.BidderOrgID != completion.BidderOrgID {
		return Payment{}, Ack{Reason: "completion org does not match selected bidder"}
	}
	payment := Payment{FromOrg: task.RequesterOrgID, ToOrg: selected.BidderOrgID, Amount: selected.Cost, TaskID: task.ID, At: time.Now().UTC()}
	if completion.Success {
		m.payments = append(m.payments, payment)
		m.Governance.RecordPayment(payment)
	} else {
		payment.Amount = 0
	}
	task.Status = TaskStatusCompleted
	m.tasks[task.ID] = task
	m.Reputation.RecordCompletion(completion, payment)
	return payment, Ack{Accepted: true, Reason: "task completed"}
}

func (m *Marketplace) Payments() []Payment {
	payments := make([]Payment, len(m.payments))
	copy(payments, m.payments)
	return payments
}

func (m *Marketplace) bidValue(bid Bid) float64 {
	if bid.Cost <= 0 {
		return 0
	}
	reputation := m.Reputation.Get(bid.BidderOrgID)
	return ReputationAdjustedScore(bid, reputation) / bid.Cost
}

type taskSigningPayload struct {
	ID             string
	RequesterOrgID string
	Type           string
	Budget         float64
	MaxRisk        float64
	Metadata       map[string]string
}

type bidSigningPayload struct {
	ID          string
	TaskID      string
	BidderOrgID string
	Cost        float64
	Score       float64
	Risk        float64
	Metadata    map[string]string
}

func unsignedTask(task Task) taskSigningPayload {
	return taskSigningPayload{ID: task.ID, RequesterOrgID: task.RequesterOrgID, Type: task.Type, Budget: task.Budget, MaxRisk: task.MaxRisk, Metadata: task.Metadata}
}

func unsignedBid(bid Bid) bidSigningPayload {
	return bidSigningPayload{ID: bid.ID, TaskID: bid.TaskID, BidderOrgID: bid.BidderOrgID, Cost: bid.Cost, Score: bid.Score, Risk: bid.Risk, Metadata: bid.Metadata}
}
