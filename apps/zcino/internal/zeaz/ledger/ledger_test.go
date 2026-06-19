package ledger_test

import (
	"context"
	"testing"

	"game-catalog-service/internal/zeaz/ledger"
	"game-catalog-service/internal/zeaz/protocol"
	"game-catalog-service/internal/zeaz/runtime"
)

func TestSignedTaskBidCompletionFlow(t *testing.T) {
	requester, _ := runtime.NewWallet("org-requester")
	bidder, _ := runtime.NewWallet("org-bidder")
	service := ledger.NewService(
		ledger.Org{ID: requester.OrgID, PublicKey: requester.PublicKey, Active: true},
		ledger.Org{ID: bidder.OrgID, PublicKey: bidder.PublicKey, Active: true},
	)
	requesterAgent := runtime.NewAgent("requester-agent", "growth", requester, service)
	bidderAgent := runtime.NewAgent("bidder-agent", "infra", bidder, service)

	if _, err := requesterAgent.SubmitTask(context.Background(), protocol.Task{ID: "task-1", Type: "optimize", Budget: 10, MaxRisk: .4}); err != nil {
		t.Fatalf("submit task: %v", err)
	}
	if _, err := bidderAgent.SubmitBid(context.Background(), protocol.Bid{ID: "bid-1", TaskID: "task-1", Cost: 8, Score: .9, Risk: .2}); err != nil {
		t.Fatalf("submit bid: %v", err)
	}
	if _, err := bidderAgent.CompleteTask(context.Background(), protocol.Completion{TaskID: "task-1", Success: true, QualityScore: .8, ResultRef: "ipfs://result"}); err != nil {
		t.Fatalf("complete task: %v", err)
	}

	snapshot := service.Snapshot()
	if snapshot.Height != 3 {
		t.Fatalf("height = %d, want 3", snapshot.Height)
	}
	if snapshot.Reputation[bidder.OrgID].CompletedTasks != 1 {
		t.Fatalf("completion not reflected in reputation")
	}
	if len(service.Records()) != 3 || service.Records()[2].PreviousHash == "" {
		t.Fatalf("ledger hash chain not linked")
	}
}

func TestRejectTamperedEnvelope(t *testing.T) {
	wallet, _ := runtime.NewWallet("org-a")
	service := ledger.NewService(ledger.Org{ID: wallet.OrgID, PublicKey: wallet.PublicKey, Active: true})
	env, err := wallet.Sign(protocol.KindTask, protocol.Task{ID: "task-1", RequesterOrgID: wallet.OrgID, Type: "x", Budget: 1, MaxRisk: .1}, "n")
	if err != nil {
		t.Fatal(err)
	}
	env.Payload[5] = 'X'
	if _, err := service.SubmitEnvelope(context.Background(), env); err == nil {
		t.Fatalf("expected tampered envelope to be rejected")
	}
}

func TestOpenNetworkRequiresEconomicWeight(t *testing.T) {
	requester, _ := runtime.NewWallet("did-requester")
	newcomer, _ := runtime.NewWallet("did-newcomer")
	service := ledger.NewOpenService(
		ledger.Org{ID: requester.OrgID, PublicKey: requester.PublicKey, Active: true, Balance: 5, Stake: 1},
		ledger.Org{ID: newcomer.OrgID, PublicKey: newcomer.PublicKey, Active: true, InitialReputation: .1},
	)
	requesterAgent := runtime.NewAgent("requester-agent", "market", requester, service)
	newcomerAgent := runtime.NewAgent("newcomer-agent", "worker", newcomer, service)

	if _, err := requesterAgent.SubmitTask(context.Background(), protocol.Task{ID: "open-task-1", Type: "verify", Budget: 2, MaxRisk: .5}); err != nil {
		t.Fatalf("submit task with stake-backed requester: %v", err)
	}
	if _, err := newcomerAgent.SubmitBid(context.Background(), protocol.Bid{ID: "newcomer-bid", TaskID: "open-task-1", Cost: 1, Score: .5, Risk: .1}); err == nil {
		t.Fatalf("expected unstaked low-reputation bidder to be blocked")
	}

	snapshot := service.Snapshot()
	account := snapshot.Accounts[requester.OrgID]
	if account.Balance != 2.99 || account.Escrow != 2 {
		t.Fatalf("requester account = %+v, want balance 2.99 and escrow 2", account)
	}
}

func TestOpenNetworkSettlesAfterVerificationQuorum(t *testing.T) {
	requester, _ := runtime.NewWallet("did-requester")
	bidder, _ := runtime.NewWallet("did-bidder")
	verifierA, _ := runtime.NewWallet("did-verifier-a")
	verifierB, _ := runtime.NewWallet("did-verifier-b")
	service := ledger.NewOpenService(
		ledger.Org{ID: requester.OrgID, PublicKey: requester.PublicKey, Active: true, Balance: 10, Stake: 1},
		ledger.Org{ID: bidder.OrgID, PublicKey: bidder.PublicKey, Active: true, Stake: 1},
		ledger.Org{ID: verifierA.OrgID, PublicKey: verifierA.PublicKey, Active: true, Stake: 1},
		ledger.Org{ID: verifierB.OrgID, PublicKey: verifierB.PublicKey, Active: true, Stake: 1},
	)
	requesterAgent := runtime.NewAgent("requester", "market", requester, service)
	bidderAgent := runtime.NewAgent("bidder", "worker", bidder, service)
	verifierAgentA := runtime.NewAgent("verifier-a", "verifier", verifierA, service)
	verifierAgentB := runtime.NewAgent("verifier-b", "verifier", verifierB, service)

	if _, err := requesterAgent.SubmitTask(context.Background(), protocol.Task{ID: "open-task-2", Type: "compute", Budget: 3, MaxRisk: .5}); err != nil {
		t.Fatalf("submit task: %v", err)
	}
	if _, err := bidderAgent.SubmitBid(context.Background(), protocol.Bid{ID: "bid-2", TaskID: "open-task-2", Cost: 3, Score: .8, Risk: .2}); err != nil {
		t.Fatalf("submit bid: %v", err)
	}
	if _, err := bidderAgent.CompleteTask(context.Background(), protocol.Completion{TaskID: "open-task-2", Success: true, QualityScore: .9, ResultRef: "sha256:abc"}); err != nil {
		t.Fatalf("complete task: %v", err)
	}
	if got := service.Snapshot().Accounts[bidder.OrgID].Balance; got != 0 {
		t.Fatalf("bidder paid before quorum: %v", got)
	}
	if _, err := verifierAgentA.SubmitResult(context.Background(), protocol.Result{TaskID: "open-task-2", Score: .9, Valid: true}); err != nil {
		t.Fatalf("first verification: %v", err)
	}
	if got := service.Snapshot().Accounts[bidder.OrgID].Balance; got != 0 {
		t.Fatalf("bidder paid before second verifier: %v", got)
	}
	record, err := verifierAgentB.SubmitResult(context.Background(), protocol.Result{TaskID: "open-task-2", Score: .9, Valid: true})
	if err != nil {
		t.Fatalf("second verification: %v", err)
	}
	if record.Metadata["settled"] != "true" {
		t.Fatalf("expected settlement metadata on quorum record, got %+v", record.Metadata)
	}
	snapshot := service.Snapshot()
	if got := snapshot.Accounts[bidder.OrgID].Balance; got != 3 {
		t.Fatalf("bidder balance = %v, want 3", got)
	}
	if snapshot.Reputation[bidder.OrgID].CompletedTasks != 1 {
		t.Fatalf("completion not reflected after verified settlement")
	}
}
