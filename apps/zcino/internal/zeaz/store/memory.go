package store

import (
	"context"
	"fmt"
	"sort"
	"sync"
	"time"

	"game-catalog-service/internal/zeaz/consensus"
	"game-catalog-service/internal/zeaz/ledger"
	"game-catalog-service/internal/zeaz/protocol"
	"game-catalog-service/internal/zeaz/settlement"
	"game-catalog-service/internal/zeaz/staking"
	"game-catalog-service/internal/zeaz/wasm"
)

type MemoryStore struct {
	mu sync.RWMutex

	orgs       map[string]ledger.Org
	accounts   map[string]ledger.Account
	policies   []ledger.Policy
	tasks      map[string]protocol.Task
	bids       map[string][]protocol.Bid
	completions map[string]protocol.Completion
	results    map[string][]protocol.Result
	reputation map[string]ledger.Reputation
	settled    map[string]bool
	records    []ledger.Record
	headHash   string
	headHeight uint64

	envelopes []protocol.Envelope
	envByID   map[string]int

	consensusValidators map[string]consensus.Validator
	votes               []consensus.Vote
	voteIndex           map[string]int
	commits             []consensus.Commit
	commitByHeight      map[uint64]int

	stakingValidators map[string]staking.Validator
	stakingEvents     []staking.Event

	receipts     map[string]settlement.Receipt
	receiptIndex map[uint64][]string

	wasmModules map[string]wasm.Module

	peers map[string]protocol.Peer

	seqCounter int64
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		orgs:                make(map[string]ledger.Org),
		accounts:            make(map[string]ledger.Account),
		tasks:               make(map[string]protocol.Task),
		bids:                make(map[string][]protocol.Bid),
		completions:         make(map[string]protocol.Completion),
		results:             make(map[string][]protocol.Result),
		reputation:          make(map[string]ledger.Reputation),
		settled:             make(map[string]bool),
		envelopes:           make([]protocol.Envelope, 0),
		envByID:             make(map[string]int),
		consensusValidators: make(map[string]consensus.Validator),
		voteIndex:           make(map[string]int),
		commitByHeight:      make(map[uint64]int),
		stakingValidators:   make(map[string]staking.Validator),
		receipts:            make(map[string]settlement.Receipt),
		receiptIndex:        make(map[uint64][]string),
		wasmModules:         make(map[string]wasm.Module),
		peers:               make(map[string]protocol.Peer),
	}
}

func (m *MemoryStore) Ping(_ context.Context) error { return nil }

func (m *MemoryStore) Close() error { return nil }

// --- Ledger ---

func (m *MemoryStore) CreateOrg(_ context.Context, org ledger.Org) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.orgs[org.ID]; ok {
		return nil
	}
	m.orgs[org.ID] = org
	return nil
}

func (m *MemoryStore) GetOrg(_ context.Context, id string) (ledger.Org, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	org, ok := m.orgs[id]
	if !ok {
		return ledger.Org{}, ErrNotFound
	}
	return org, nil
}

func (m *MemoryStore) ListOrgs(_ context.Context) ([]ledger.Org, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]ledger.Org, 0, len(m.orgs))
	for _, org := range m.orgs {
		out = append(out, org)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out, nil
}

func (m *MemoryStore) UpdateOrg(_ context.Context, org ledger.Org) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.orgs[org.ID]; !ok {
		return ErrNotFound
	}
	m.orgs[org.ID] = org
	return nil
}

func (m *MemoryStore) UpsertAccount(_ context.Context, acct ledger.Account) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.accounts[acct.DID] = acct
	return nil
}

func (m *MemoryStore) GetAccount(_ context.Context, did string) (ledger.Account, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	acct, ok := m.accounts[did]
	if !ok {
		return ledger.Account{}, ErrNotFound
	}
	return acct, nil
}

func (m *MemoryStore) ListAccounts(_ context.Context) ([]ledger.Account, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]ledger.Account, 0, len(m.accounts))
	for _, acct := range m.accounts {
		out = append(out, acct)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].DID < out[j].DID })
	return out, nil
}

func (m *MemoryStore) GetActivePolicy(_ context.Context) (ledger.Policy, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if len(m.policies) == 0 {
		return ledger.DefaultPolicy(), nil
	}
	// policies is append-only; latest is last
	return m.policies[len(m.policies)-1], nil
}

func (m *MemoryStore) SetActivePolicy(_ context.Context, p ledger.Policy) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.policies = append(m.policies, p)
	return nil
}

func (m *MemoryStore) CreateTask(_ context.Context, task protocol.Task) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.tasks[task.ID]; ok {
		return nil
	}
	m.tasks[task.ID] = task
	return nil
}

func (m *MemoryStore) GetTask(_ context.Context, id string) (protocol.Task, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	task, ok := m.tasks[id]
	if !ok {
		return protocol.Task{}, ErrNotFound
	}
	return task, nil
}

func (m *MemoryStore) ListTasks(_ context.Context) ([]protocol.Task, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]protocol.Task, 0, len(m.tasks))
	for _, task := range m.tasks {
		out = append(out, task)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out, nil
}

func (m *MemoryStore) CreateBid(_ context.Context, bid protocol.Bid) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.bids[bid.TaskID] = append(m.bids[bid.TaskID], bid)
	return nil
}

func (m *MemoryStore) GetBidsForTask(_ context.Context, taskID string) ([]protocol.Bid, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	bids := m.bids[taskID]
	out := make([]protocol.Bid, len(bids))
	copy(out, bids)
	return out, nil
}

func (m *MemoryStore) UpsertCompletion(_ context.Context, c protocol.Completion) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.completions[c.TaskID] = c
	return nil
}

func (m *MemoryStore) GetCompletion(_ context.Context, taskID string) (protocol.Completion, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	c, ok := m.completions[taskID]
	if !ok {
		return protocol.Completion{}, ErrNotFound
	}
	return c, nil
}

func (m *MemoryStore) CreateResult(_ context.Context, result protocol.Result) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.results[result.TaskID] = append(m.results[result.TaskID], result)
	return nil
}

func (m *MemoryStore) GetResultsForTask(_ context.Context, taskID string) ([]protocol.Result, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	results := m.results[taskID]
	out := make([]protocol.Result, len(results))
	copy(out, results)
	return out, nil
}

func (m *MemoryStore) UpsertReputation(_ context.Context, rep ledger.Reputation) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.reputation[rep.OrgID] = rep
	return nil
}

func (m *MemoryStore) GetReputation(_ context.Context, orgID string) (ledger.Reputation, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	rep, ok := m.reputation[orgID]
	if !ok {
		return ledger.Reputation{}, ErrNotFound
	}
	return rep, nil
}

func (m *MemoryStore) ListReputations(_ context.Context) (map[string]ledger.Reputation, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make(map[string]ledger.Reputation, len(m.reputation))
	for k, v := range m.reputation {
		out[k] = v
	}
	return out, nil
}

func (m *MemoryStore) IsSettled(_ context.Context, taskID string) (bool, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.settled[taskID], nil
}

func (m *MemoryStore) MarkSettled(_ context.Context, taskID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.settled[taskID] = true
	return nil
}

func (m *MemoryStore) AppendRecord(_ context.Context, rec ledger.Record) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.records = append(m.records, rec)
	return nil
}

func (m *MemoryStore) GetRecords(_ context.Context) ([]ledger.Record, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]ledger.Record, len(m.records))
	copy(out, m.records)
	return out, nil
}

func (m *MemoryStore) GetRecordByHeight(_ context.Context, height uint64) (ledger.Record, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, rec := range m.records {
		if rec.Height == height {
			return rec, nil
		}
	}
	return ledger.Record{}, ErrNotFound
}

func (m *MemoryStore) GetHeadHash(_ context.Context) (string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.headHash, nil
}

func (m *MemoryStore) SetHeadHash(_ context.Context, hash string, height uint64) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.headHash = hash
	m.headHeight = height
	return nil
}

// --- Envelopes ---

func (m *MemoryStore) StoreEnvelope(_ context.Context, env protocol.Envelope) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.envByID[env.ID]; ok {
		return nil
	}
	m.envByID[env.ID] = len(m.envelopes)
	m.envelopes = append(m.envelopes, env)
	return nil
}

func (m *MemoryStore) GetEnvelopes(_ context.Context, offset, limit int) ([]protocol.Envelope, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if offset >= len(m.envelopes) {
		return []protocol.Envelope{}, nil
	}
	end := offset + limit
	if end > len(m.envelopes) {
		end = len(m.envelopes)
	}
	out := make([]protocol.Envelope, end-offset)
	copy(out, m.envelopes[offset:end])
	return out, nil
}

func (m *MemoryStore) CountEnvelopes(_ context.Context) (int, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.envelopes), nil
}

// --- Consensus ---

func (m *MemoryStore) UpsertConsensusValidator(_ context.Context, v consensus.Validator) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.consensusValidators[v.ID] = v
	return nil
}

func (m *MemoryStore) GetConsensusValidator(_ context.Context, id string) (consensus.Validator, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	v, ok := m.consensusValidators[id]
	if !ok {
		return consensus.Validator{}, ErrNotFound
	}
	return v, nil
}

func (m *MemoryStore) ListConsensusValidators(_ context.Context) (map[string]consensus.Validator, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make(map[string]consensus.Validator, len(m.consensusValidators))
	for k, v := range m.consensusValidators {
		out[k] = v
	}
	return out, nil
}

func (m *MemoryStore) GetTotalConsensusPower(_ context.Context) (uint64, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var total uint64
	for _, v := range m.consensusValidators {
		total += v.Power
	}
	return total, nil
}

func (m *MemoryStore) CreateVote(_ context.Context, v consensus.Vote) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	key := fmt.Sprintf("%d/%d/%s/%s", v.Height, v.Round, v.Phase, v.ValidatorID)
	if _, ok := m.voteIndex[key]; ok {
		return nil
	}
	m.voteIndex[key] = len(m.votes)
	m.votes = append(m.votes, v)
	return nil
}

func (m *MemoryStore) GetVotesAtHeightRoundPhase(_ context.Context, height, round uint64, phase string) ([]consensus.Vote, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var out []consensus.Vote
	for _, v := range m.votes {
		if v.Height == height && v.Round == round && string(v.Phase) == phase {
			out = append(out, v)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ValidatorID < out[j].ValidatorID })
	return out, nil
}

func (m *MemoryStore) CreateCommit(_ context.Context, c consensus.Commit) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.commitByHeight[c.Proposal.Height]; ok {
		return nil
	}
	m.commitByHeight[c.Proposal.Height] = len(m.commits)
	m.commits = append(m.commits, c)
	return nil
}

func (m *MemoryStore) GetCommits(_ context.Context) ([]consensus.Commit, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]consensus.Commit, len(m.commits))
	copy(out, m.commits)
	return out, nil
}

func (m *MemoryStore) GetCommitAtHeight(_ context.Context, height uint64) (consensus.Commit, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	idx, ok := m.commitByHeight[height]
	if !ok {
		return consensus.Commit{}, ErrNotFound
	}
	return m.commits[idx], nil
}

func (m *MemoryStore) LatestCommitHeight(_ context.Context) (uint64, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if len(m.commits) == 0 {
		return 0, nil
	}
	return m.commits[len(m.commits)-1].Proposal.Height, nil
}

// --- Staking ---

func (m *MemoryStore) UpsertStakingValidator(_ context.Context, v staking.Validator) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.stakingValidators[v.ID] = v
	return nil
}

func (m *MemoryStore) GetStakingValidator(_ context.Context, id string) (staking.Validator, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	v, ok := m.stakingValidators[id]
	if !ok {
		return staking.Validator{}, ErrNotFound
	}
	return v, nil
}

func (m *MemoryStore) ListStakingValidators(_ context.Context) (map[string]staking.Validator, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make(map[string]staking.Validator, len(m.stakingValidators))
	for k, v := range m.stakingValidators {
		out[k] = v
	}
	return out, nil
}

func (m *MemoryStore) GetActiveStakingValidators(_ context.Context, now time.Time) ([]staking.Validator, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var active []staking.Validator
	for _, v := range m.stakingValidators {
		if v.Status == staking.StatusBonded && v.Stake+v.DelegatedStake >= 1 {
			active = append(active, v)
			continue
		}
		if v.Status == staking.StatusJailed && !v.JailedUntil.IsZero() && now.After(v.JailedUntil) && v.Stake+v.DelegatedStake >= 1 {
			v.Status = staking.StatusBonded
			active = append(active, v)
		}
	}
	sort.Slice(active, func(i, j int) bool {
		pi := active[i].Stake + active[i].DelegatedStake
		pj := active[j].Stake + active[j].DelegatedStake
		if pi == pj {
			return active[i].ID < active[j].ID
		}
		return pi > pj
	})
	return active, nil
}

func (m *MemoryStore) AppendStakingEvent(_ context.Context, e staking.Event) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.seqCounter++
	m.stakingEvents = append(m.stakingEvents, e)
	return nil
}

func (m *MemoryStore) GetStakingEvents(_ context.Context, afterSeq int64) ([]staking.Event, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if afterSeq < 0 {
		afterSeq = 0
	}
	start := int(afterSeq)
	if start >= len(m.stakingEvents) {
		return []staking.Event{}, nil
	}
	out := make([]staking.Event, len(m.stakingEvents)-start)
	copy(out, m.stakingEvents[start:])
	return out, nil
}

// --- Settlement ---

func (m *MemoryStore) CreateReceipt(_ context.Context, r settlement.Receipt) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.receipts[r.ID]; ok {
		return nil
	}
	m.receipts[r.ID] = r
	m.receiptIndex[r.Height] = append(m.receiptIndex[r.Height], r.ID)
	return nil
}

func (m *MemoryStore) GetReceipt(_ context.Context, id string) (settlement.Receipt, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	r, ok := m.receipts[id]
	if !ok {
		return settlement.Receipt{}, ErrNotFound
	}
	return r, nil
}

func (m *MemoryStore) GetReceiptsByHeight(_ context.Context, height uint64) ([]settlement.Receipt, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	ids := m.receiptIndex[height]
	out := make([]settlement.Receipt, 0, len(ids))
	for _, id := range ids {
		if r, ok := m.receipts[id]; ok {
			out = append(out, r)
		}
	}
	return out, nil
}

// --- WASM ---

func (m *MemoryStore) RegisterWasmModule(_ context.Context, mod wasm.Module) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.wasmModules[mod.ID] = mod
	return nil
}

func (m *MemoryStore) GetWasmModule(_ context.Context, id string) (wasm.Module, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	mod, ok := m.wasmModules[id]
	if !ok {
		return wasm.Module{}, ErrNotFound
	}
	return mod, nil
}

func (m *MemoryStore) ListWasmModules(_ context.Context) (map[string]wasm.Module, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make(map[string]wasm.Module, len(m.wasmModules))
	for k, v := range m.wasmModules {
		out[k] = v
	}
	return out, nil
}

// --- Peers ---

func (m *MemoryStore) UpsertPeer(_ context.Context, p protocol.Peer) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.peers[p.NodeID] = p
	return nil
}

func (m *MemoryStore) GetPeer(_ context.Context, nodeID string) (protocol.Peer, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	p, ok := m.peers[nodeID]
	if !ok {
		return protocol.Peer{}, ErrNotFound
	}
	return p, nil
}

func (m *MemoryStore) GetActivePeers(_ context.Context, ttl time.Duration, now time.Time) ([]protocol.Peer, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var peers []protocol.Peer
	for _, p := range m.peers {
		if now.Sub(p.SeenAt) <= ttl {
			peers = append(peers, p)
		}
	}
	sort.Slice(peers, func(i, j int) bool { return peers[i].NodeID < peers[j].NodeID })
	return peers, nil
}
