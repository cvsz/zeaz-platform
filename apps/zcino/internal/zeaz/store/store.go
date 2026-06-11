package store

import (
	"context"
	"errors"
	"time"

	"game-catalog-service/internal/zeaz/consensus"
	"game-catalog-service/internal/zeaz/ledger"
	"game-catalog-service/internal/zeaz/protocol"
	"game-catalog-service/internal/zeaz/settlement"
	"game-catalog-service/internal/zeaz/staking"
	"game-catalog-service/internal/zeaz/wasm"
)

var ErrNotFound = errors.New("not found")

type Store interface {
	// Ledger
	CreateOrg(ctx context.Context, org ledger.Org) error
	GetOrg(ctx context.Context, id string) (ledger.Org, error)
	ListOrgs(ctx context.Context) ([]ledger.Org, error)
	UpdateOrg(ctx context.Context, org ledger.Org) error
	UpsertAccount(ctx context.Context, acct ledger.Account) error
	GetAccount(ctx context.Context, did string) (ledger.Account, error)
	ListAccounts(ctx context.Context) ([]ledger.Account, error)
	GetActivePolicy(ctx context.Context) (ledger.Policy, error)
	SetActivePolicy(ctx context.Context, p ledger.Policy) error
	CreateTask(ctx context.Context, task protocol.Task) error
	GetTask(ctx context.Context, id string) (protocol.Task, error)
	ListTasks(ctx context.Context) ([]protocol.Task, error)
	CreateBid(ctx context.Context, bid protocol.Bid) error
	GetBidsForTask(ctx context.Context, taskID string) ([]protocol.Bid, error)
	UpsertCompletion(ctx context.Context, c protocol.Completion) error
	GetCompletion(ctx context.Context, taskID string) (protocol.Completion, error)
	CreateResult(ctx context.Context, result protocol.Result) error
	GetResultsForTask(ctx context.Context, taskID string) ([]protocol.Result, error)
	UpsertReputation(ctx context.Context, rep ledger.Reputation) error
	GetReputation(ctx context.Context, orgID string) (ledger.Reputation, error)
	ListReputations(ctx context.Context) (map[string]ledger.Reputation, error)
	IsSettled(ctx context.Context, taskID string) (bool, error)
	MarkSettled(ctx context.Context, taskID string) error
	AppendRecord(ctx context.Context, rec ledger.Record) error
	GetRecords(ctx context.Context) ([]ledger.Record, error)
	GetRecordByHeight(ctx context.Context, height uint64) (ledger.Record, error)
	GetHeadHash(ctx context.Context) (string, error)
	SetHeadHash(ctx context.Context, hash string, height uint64) error

	// Envelopes
	StoreEnvelope(ctx context.Context, env protocol.Envelope) error
	GetEnvelopes(ctx context.Context, offset, limit int) ([]protocol.Envelope, error)
	CountEnvelopes(ctx context.Context) (int, error)

	// Consensus
	UpsertConsensusValidator(ctx context.Context, v consensus.Validator) error
	GetConsensusValidator(ctx context.Context, id string) (consensus.Validator, error)
	ListConsensusValidators(ctx context.Context) (map[string]consensus.Validator, error)
	GetTotalConsensusPower(ctx context.Context) (uint64, error)
	CreateVote(ctx context.Context, v consensus.Vote) error
	GetVotesAtHeightRoundPhase(ctx context.Context, height, round uint64, phase string) ([]consensus.Vote, error)
	CreateCommit(ctx context.Context, c consensus.Commit) error
	GetCommits(ctx context.Context) ([]consensus.Commit, error)
	GetCommitAtHeight(ctx context.Context, height uint64) (consensus.Commit, error)
	LatestCommitHeight(ctx context.Context) (uint64, error)

	// Staking
	UpsertStakingValidator(ctx context.Context, v staking.Validator) error
	GetStakingValidator(ctx context.Context, id string) (staking.Validator, error)
	ListStakingValidators(ctx context.Context) (map[string]staking.Validator, error)
	GetActiveStakingValidators(ctx context.Context, now time.Time) ([]staking.Validator, error)
	AppendStakingEvent(ctx context.Context, e staking.Event) error
	GetStakingEvents(ctx context.Context, afterSeq int64) ([]staking.Event, error)

	// Settlement
	CreateReceipt(ctx context.Context, r settlement.Receipt) error
	GetReceipt(ctx context.Context, id string) (settlement.Receipt, error)
	GetReceiptsByHeight(ctx context.Context, height uint64) ([]settlement.Receipt, error)

	// WASM
	RegisterWasmModule(ctx context.Context, m wasm.Module) error
	GetWasmModule(ctx context.Context, id string) (wasm.Module, error)
	ListWasmModules(ctx context.Context) (map[string]wasm.Module, error)

	// Peers
	UpsertPeer(ctx context.Context, p protocol.Peer) error
	GetPeer(ctx context.Context, nodeID string) (protocol.Peer, error)
	GetActivePeers(ctx context.Context, ttl time.Duration, now time.Time) ([]protocol.Peer, error)

	// Health
	Ping(ctx context.Context) error
	Close() error
}
