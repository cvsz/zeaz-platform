package ledger

import (
	"context"
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"game-catalog-service/internal/zeaz/protocol"
)

type Org struct {
	ID                string
	Name              string
	PublicKey         []byte
	Active            bool
	Balance           float64
	Stake             float64
	InitialReputation float64
}

type Account struct {
	DID     string  `json:"did"`
	Balance float64 `json:"balance"`
	Stake   float64 `json:"stake"`
	Escrow  float64 `json:"escrow"`
}

type Policy struct {
	MinReputation      float64 `json:"min_reputation"`
	MinStake           float64 `json:"min_stake"`
	TaskSubmissionFee  float64 `json:"task_submission_fee"`
	VerificationQuorum int     `json:"verification_quorum"`
}

func DefaultPolicy() Policy {
	return Policy{MinReputation: 0.2, MinStake: 0, TaskSubmissionFee: 0, VerificationQuorum: 0}
}

func OpenNetworkPolicy() Policy {
	return Policy{MinReputation: 0.2, MinStake: 1, TaskSubmissionFee: 0.01, VerificationQuorum: 2}
}

type Record struct {
	Height       uint64            `json:"height"`
	Type         string            `json:"type"`
	EnvelopeID   string            `json:"envelope_id"`
	EnvelopeHash string            `json:"envelope_hash"`
	PreviousHash string            `json:"previous_hash"`
	Hash         string            `json:"hash"`
	At           time.Time         `json:"at"`
	Metadata     map[string]string `json:"metadata,omitempty"`
}

type Reputation struct {
	OrgID          string    `json:"org_id"`
	Score          float64   `json:"score"`
	CompletedTasks int       `json:"completed_tasks"`
	FailedTasks    int       `json:"failed_tasks"`
	RevenueCredits float64   `json:"revenue_credits"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type Snapshot struct {
	Height     uint64                       `json:"height"`
	HeadHash   string                       `json:"head_hash"`
	Policy     Policy                       `json:"policy"`
	Accounts   map[string]Account           `json:"accounts"`
	Tasks      map[string]protocol.Task     `json:"tasks"`
	Bids       map[string][]protocol.Bid    `json:"bids"`
	Results    map[string][]protocol.Result `json:"results"`
	Reputation map[string]Reputation        `json:"reputation"`
}

type Service struct {
	mu          sync.RWMutex
	policy      Policy
	orgs        map[string]Org
	accounts    map[string]Account
	tasks       map[string]protocol.Task
	bids        map[string][]protocol.Bid
	completions map[string]protocol.Completion
	results     map[string][]protocol.Result
	reputation  map[string]Reputation
	settled     map[string]bool
	records     []Record
	headHash    string
}

func NewService(orgs ...Org) *Service { return NewServiceWithPolicy(DefaultPolicy(), orgs...) }

func NewOpenService(orgs ...Org) *Service { return NewServiceWithPolicy(OpenNetworkPolicy(), orgs...) }

func NewServiceWithPolicy(policy Policy, orgs ...Org) *Service {
	if policy.MinReputation == 0 {
		policy.MinReputation = 0.2
	}
	s := &Service{policy: policy, orgs: map[string]Org{}, accounts: map[string]Account{}, tasks: map[string]protocol.Task{}, bids: map[string][]protocol.Bid{}, completions: map[string]protocol.Completion{}, results: map[string][]protocol.Result{}, reputation: map[string]Reputation{}, settled: map[string]bool{}}
	for _, org := range orgs {
		s.RegisterOrg(org)
	}
	return s
}

func (s *Service) RegisterOrg(org Org) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if !org.Active {
		org.Active = true
	}
	s.orgs[org.ID] = org
	if _, ok := s.reputation[org.ID]; !ok {
		score := org.InitialReputation
		if score == 0 {
			score = 1
		}
		s.reputation[org.ID] = Reputation{OrgID: org.ID, Score: score, UpdatedAt: time.Now().UTC()}
	}
	if _, ok := s.accounts[org.ID]; !ok {
		s.accounts[org.ID] = Account{DID: org.ID, Balance: org.Balance, Stake: org.Stake}
	}
}

func (s *Service) ResolvePublicKey(keyID string) (ed25519.PublicKey, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	org, ok := s.orgs[keyID]
	if !ok || !org.Active {
		return nil, false
	}
	return org.PublicKey, true
}

func (s *Service) SubmitEnvelope(ctx context.Context, env protocol.Envelope) (Record, error) {
	select {
	case <-ctx.Done():
		return Record{}, ctx.Err()
	default:
	}
	if err := protocol.Verify(env, protocol.KeyResolverFunc(s.ResolvePublicKey), time.Now().UTC()); err != nil {
		return Record{}, err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	recordMeta := map[string]string{}
	switch env.Kind {
	case protocol.KindTask:
		var task protocol.Task
		if err := json.Unmarshal(env.Payload, &task); err != nil {
			return Record{}, err
		}
		if task.ID == "" || task.RequesterOrgID == "" || task.Budget <= 0 || task.MaxRisk < 0 || task.MaxRisk > 1 {
			return Record{}, fmt.Errorf("invalid task payload")
		}
		if env.Issuer != task.RequesterOrgID {
			return Record{}, fmt.Errorf("task issuer must match requester org")
		}
		if err := s.allowParticipantLocked(task.RequesterOrgID); err != nil {
			return Record{}, err
		}
		if err := s.reserveTaskBudgetLocked(task); err != nil {
			return Record{}, err
		}
		task.Metadata = cloneMap(task.Metadata)
		s.tasks[task.ID] = task
	case protocol.KindBid:
		var bid protocol.Bid
		if err := json.Unmarshal(env.Payload, &bid); err != nil {
			return Record{}, err
		}
		if bid.ID == "" || bid.TaskID == "" || bid.BidderOrgID == "" || bid.Cost <= 0 || bid.Risk < 0 || bid.Risk > 1 {
			return Record{}, fmt.Errorf("invalid bid payload")
		}
		if env.Issuer != bid.BidderOrgID {
			return Record{}, fmt.Errorf("bid issuer must match bidder org")
		}
		if err := s.allowParticipantLocked(bid.BidderOrgID); err != nil {
			return Record{}, err
		}
		task, ok := s.tasks[bid.TaskID]
		if !ok {
			return Record{}, fmt.Errorf("unknown task %q", bid.TaskID)
		}
		if bid.Cost > task.Budget || bid.Risk > task.MaxRisk {
			return Record{}, fmt.Errorf("bid exceeds task constraints")
		}
		bid.Metadata = cloneMap(bid.Metadata)
		s.bids[bid.TaskID] = append(s.bids[bid.TaskID], bid)
	case protocol.KindCompletion:
		var completion protocol.Completion
		if err := json.Unmarshal(env.Payload, &completion); err != nil {
			return Record{}, err
		}
		if completion.TaskID == "" || completion.BidderOrgID == "" || completion.QualityScore < 0 || completion.QualityScore > 1 {
			return Record{}, fmt.Errorf("invalid completion payload")
		}
		if env.Issuer != completion.BidderOrgID {
			return Record{}, fmt.Errorf("completion issuer must match bidder org")
		}
		if _, ok := s.tasks[completion.TaskID]; !ok {
			return Record{}, fmt.Errorf("unknown task %q", completion.TaskID)
		}
		s.completions[completion.TaskID] = completion
		if s.policy.VerificationQuorum == 0 || s.taskVerifiedLocked(completion.TaskID) {
			s.settleCompletionLocked(completion)
			recordMeta["settled"] = "true"
		}
	case protocol.KindResult:
		var result protocol.Result
		if err := json.Unmarshal(env.Payload, &result); err != nil {
			return Record{}, err
		}
		if result.TaskID == "" || result.VerifierOrgID == "" || result.Score < 0 || result.Score > 1 {
			return Record{}, fmt.Errorf("invalid result payload")
		}
		if env.Issuer != result.VerifierOrgID {
			return Record{}, fmt.Errorf("result issuer must match verifier org")
		}
		if err := s.allowParticipantLocked(result.VerifierOrgID); err != nil {
			return Record{}, err
		}
		if _, ok := s.tasks[result.TaskID]; !ok {
			return Record{}, fmt.Errorf("unknown task %q", result.TaskID)
		}
		s.results[result.TaskID] = append(s.results[result.TaskID], result)
		if completion, ok := s.completions[result.TaskID]; ok && s.taskVerifiedLocked(result.TaskID) {
			s.settleCompletionLocked(completion)
			recordMeta["settled"] = "true"
		}
	default:
		return Record{}, fmt.Errorf("unsupported envelope kind %q", env.Kind)
	}
	return s.appendRecord(env, recordMeta)
}

func (s *Service) Snapshot() Snapshot {
	s.mu.RLock()
	defer s.mu.RUnlock()
	tasks := make(map[string]protocol.Task, len(s.tasks))
	for id, task := range s.tasks {
		task.Metadata = cloneMap(task.Metadata)
		tasks[id] = task
	}
	bids := make(map[string][]protocol.Bid, len(s.bids))
	for taskID, values := range s.bids {
		bids[taskID] = append([]protocol.Bid(nil), values...)
	}
	results := make(map[string][]protocol.Result, len(s.results))
	for taskID, values := range s.results {
		results[taskID] = append([]protocol.Result(nil), values...)
	}
	reps := make(map[string]Reputation, len(s.reputation))
	for id, rep := range s.reputation {
		reps[id] = rep
	}
	accounts := make(map[string]Account, len(s.accounts))
	for id, account := range s.accounts {
		accounts[id] = account
	}
	return Snapshot{Height: uint64(len(s.records)), HeadHash: s.headHash, Policy: s.policy, Accounts: accounts, Tasks: tasks, Bids: bids, Results: results, Reputation: reps}
}

func (s *Service) Records() []Record {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return append([]Record(nil), s.records...)
}

func (s *Service) appendRecord(env protocol.Envelope, metadata map[string]string) (Record, error) {
	canonical, err := protocol.CanonicalJSON(env)
	if err != nil {
		return Record{}, err
	}
	if len(metadata) == 0 {
		metadata = nil
	}
	envHashBytes := sha256.Sum256(canonical)
	record := Record{Height: uint64(len(s.records) + 1), Type: env.Kind, EnvelopeID: env.ID, EnvelopeHash: hex.EncodeToString(envHashBytes[:]), PreviousHash: s.headHash, At: time.Now().UTC(), Metadata: metadata}
	recordHashBytes := sha256.Sum256([]byte(fmt.Sprintf("%d:%s:%s:%s", record.Height, record.Type, record.EnvelopeHash, record.PreviousHash)))
	record.Hash = hex.EncodeToString(recordHashBytes[:])
	s.records = append(s.records, record)
	s.headHash = record.Hash
	return record, nil
}

func (s *Service) allowParticipantLocked(did string) error {
	org, ok := s.orgs[did]
	if !ok || !org.Active {
		return fmt.Errorf("unknown or inactive did %q", did)
	}
	rep := s.reputation[did]
	account := s.accounts[did]
	if rep.Score < s.policy.MinReputation && account.Stake < s.policy.MinStake {
		return fmt.Errorf("did %q blocked by sybil policy: reputation %.2f stake %.2f", did, rep.Score, account.Stake)
	}
	return nil
}

func (s *Service) reserveTaskBudgetLocked(task protocol.Task) error {
	if s.policy.TaskSubmissionFee == 0 && s.policy.VerificationQuorum == 0 && s.policy.MinStake == 0 {
		return nil
	}
	account := s.accounts[task.RequesterOrgID]
	total := task.Budget + s.policy.TaskSubmissionFee
	if total <= 0 {
		return nil
	}
	if account.Balance < total {
		return fmt.Errorf("insufficient balance for task budget and fee")
	}
	account.Balance -= total
	account.Escrow += task.Budget
	s.accounts[task.RequesterOrgID] = account
	return nil
}

func (s *Service) taskVerifiedLocked(taskID string) bool {
	if s.policy.VerificationQuorum <= 0 {
		return true
	}
	seen := map[string]bool{}
	valid := 0
	for _, result := range s.results[taskID] {
		if result.Valid && !seen[result.VerifierOrgID] {
			seen[result.VerifierOrgID] = true
			valid++
		}
	}
	return valid >= s.policy.VerificationQuorum
}

func (s *Service) settleCompletionLocked(completion protocol.Completion) {
	if s.settled[completion.TaskID] {
		return
	}
	s.settled[completion.TaskID] = true
	task := s.tasks[completion.TaskID]
	requester := s.accounts[task.RequesterOrgID]
	if requester.Escrow >= task.Budget {
		requester.Escrow -= task.Budget
		s.accounts[task.RequesterOrgID] = requester
		bidder := s.accounts[completion.BidderOrgID]
		bidder.Balance += task.Budget
		s.accounts[completion.BidderOrgID] = bidder
	}
	s.updateReputation(completion)
}

func (s *Service) updateReputation(completion protocol.Completion) {
	rep := s.reputation[completion.BidderOrgID]
	if rep.OrgID == "" {
		rep = Reputation{OrgID: completion.BidderOrgID, Score: 1}
	}
	if completion.Success {
		rep.CompletedTasks++
		rep.RevenueCredits += completion.QualityScore
		rep.Score = clamp(rep.Score + completion.QualityScore*0.05)
	} else {
		rep.FailedTasks++
		rep.Score = clamp(rep.Score - 0.15)
	}
	rep.UpdatedAt = time.Now().UTC()
	s.reputation[completion.BidderOrgID] = rep
}

func clamp(v float64) float64 {
	if v < 0 {
		return 0
	}
	if v > 2 {
		return 2
	}
	return v
}
func cloneMap(in map[string]string) map[string]string {
	if len(in) == 0 {
		return nil
	}
	out := make(map[string]string, len(in))
	for k, v := range in {
		out[k] = v
	}
	return out
}
