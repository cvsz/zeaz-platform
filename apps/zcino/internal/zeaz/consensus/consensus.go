package consensus

import (
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sort"
	"sync"
	"time"
)

type Algorithm string

const (
	AlgorithmHotStuff   Algorithm = "hotstuff"
	AlgorithmTendermint Algorithm = "tendermint"
)

type Phase string

const (
	PhasePrepare   Phase = "prepare"
	PhasePrecommit Phase = "precommit"
	PhaseCommit    Phase = "commit"
)

type Validator struct {
	ID        string            `json:"id"`
	Power     uint64            `json:"power"`
	PublicKey ed25519.PublicKey `json:"-"`
	Metadata  map[string]string `json:"metadata,omitempty"`
}

type Proposal struct {
	Height      uint64    `json:"height"`
	Round       uint64    `json:"round"`
	ProposerID  string    `json:"proposer_id"`
	ParentHash  string    `json:"parent_hash"`
	PayloadHash string    `json:"payload_hash"`
	Timestamp   time.Time `json:"timestamp"`
}

type Vote struct {
	Height      uint64    `json:"height"`
	Round       uint64    `json:"round"`
	Phase       Phase     `json:"phase"`
	BlockHash   string    `json:"block_hash"`
	ValidatorID string    `json:"validator_id"`
	Signature   []byte    `json:"signature,omitempty"`
	At          time.Time `json:"at"`
}

type QuorumCertificate struct {
	Algorithm Algorithm `json:"algorithm"`
	Height    uint64    `json:"height"`
	Round     uint64    `json:"round"`
	Phase     Phase     `json:"phase"`
	BlockHash string    `json:"block_hash"`
	Power     uint64    `json:"power"`
	Total     uint64    `json:"total"`
	Voters    []string  `json:"voters"`
}

type Commit struct {
	Proposal Proposal          `json:"proposal"`
	QC       QuorumCertificate `json:"qc"`
	At       time.Time         `json:"at"`
}

type Engine struct {
	mu         sync.RWMutex
	algorithm  Algorithm
	validators map[string]Validator
	totalPower uint64
	votes      map[string]Vote
	commits    []Commit
}

func NewEngine(algorithm Algorithm, validators []Validator) (*Engine, error) {
	if algorithm == "" {
		algorithm = AlgorithmHotStuff
	}
	e := &Engine{algorithm: algorithm, validators: map[string]Validator{}, votes: map[string]Vote{}}
	for _, v := range validators {
		if v.ID == "" || v.Power == 0 || len(v.PublicKey) != ed25519.PublicKeySize {
			return nil, fmt.Errorf("validator id, power, and public key are required")
		}
		e.validators[v.ID] = v
		e.totalPower += v.Power
	}
	if e.totalPower == 0 {
		return nil, fmt.Errorf("validator set cannot be empty")
	}
	return e, nil
}

func HashProposal(p Proposal) string {
	body := fmt.Sprintf("%d:%d:%s:%s:%s:%s", p.Height, p.Round, p.ProposerID, p.ParentHash, p.PayloadHash, p.Timestamp.UTC().Format(time.RFC3339Nano))
	sum := sha256.Sum256([]byte(body))
	return hex.EncodeToString(sum[:])
}

func VoteSignBytes(v Vote) []byte {
	return []byte(fmt.Sprintf("zeaz-consensus-v1:%d:%d:%s:%s:%s", v.Height, v.Round, v.Phase, v.BlockHash, v.ValidatorID))
}

func SignVote(v Vote, privateKey ed25519.PrivateKey) (Vote, error) {
	if len(privateKey) != ed25519.PrivateKeySize {
		return Vote{}, fmt.Errorf("ed25519 private key must be %d bytes", ed25519.PrivateKeySize)
	}
	v.Signature = ed25519.Sign(privateKey, VoteSignBytes(v))
	return v, nil
}

func (e *Engine) AddVote(v Vote) (QuorumCertificate, bool, error) {
	e.mu.Lock()
	defer e.mu.Unlock()
	validator, ok := e.validators[v.ValidatorID]
	if !ok {
		return QuorumCertificate{}, false, fmt.Errorf("unknown validator %q", v.ValidatorID)
	}
	if v.BlockHash == "" || v.Height == 0 || v.Phase == "" {
		return QuorumCertificate{}, false, fmt.Errorf("vote height, phase, and block hash are required")
	}
	if !ed25519.Verify(validator.PublicKey, VoteSignBytes(v), v.Signature) {
		return QuorumCertificate{}, false, fmt.Errorf("invalid consensus vote signature")
	}
	key := voteKey(v)
	if existing, ok := e.votes[key]; ok && existing.BlockHash != v.BlockHash {
		return QuorumCertificate{}, false, fmt.Errorf("equivocation by validator %q at height %d round %d phase %s", v.ValidatorID, v.Height, v.Round, v.Phase)
	}
	e.votes[key] = v
	qc := e.qcLocked(v.Height, v.Round, v.Phase, v.BlockHash)
	return qc, qc.Power*3 > e.totalPower*2, nil
}

func (e *Engine) Commit(proposal Proposal, qc QuorumCertificate, now time.Time) (Commit, error) {
	e.mu.Lock()
	defer e.mu.Unlock()
	if qc.Algorithm != e.algorithm || qc.Phase != PhaseCommit || qc.Height != proposal.Height || qc.Round != proposal.Round || qc.BlockHash != HashProposal(proposal) {
		return Commit{}, fmt.Errorf("commit qc does not match proposal")
	}
	if qc.Power*3 <= e.totalPower*2 {
		return Commit{}, fmt.Errorf("qc power %d does not reach >2/3 of total %d", qc.Power, e.totalPower)
	}
	commit := Commit{Proposal: proposal, QC: qc, At: now.UTC()}
	e.commits = append(e.commits, commit)
	return commit, nil
}

func (e *Engine) Commits() []Commit {
	e.mu.RLock()
	defer e.mu.RUnlock()
	return append([]Commit(nil), e.commits...)
}

func (e *Engine) qcLocked(height, round uint64, phase Phase, blockHash string) QuorumCertificate {
	voters := []string{}
	power := uint64(0)
	for _, vote := range e.votes {
		if vote.Height == height && vote.Round == round && vote.Phase == phase && vote.BlockHash == blockHash {
			voters = append(voters, vote.ValidatorID)
			power += e.validators[vote.ValidatorID].Power
		}
	}
	sort.Strings(voters)
	return QuorumCertificate{Algorithm: e.algorithm, Height: height, Round: round, Phase: phase, BlockHash: blockHash, Power: power, Total: e.totalPower, Voters: voters}
}

func voteKey(v Vote) string {
	return fmt.Sprintf("%d/%d/%s/%s", v.Height, v.Round, v.Phase, v.ValidatorID)
}
