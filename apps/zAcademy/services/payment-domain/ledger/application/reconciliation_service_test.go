package application

import (
	"context"
	"ledger/domain"
	"testing"
	"time"
)

type reconRepo struct {
	accounts  []domain.Account
	sums      map[string]int64
	snapshots []domain.ReconciliationSnapshot
}

func (r *reconRepo) ListAccounts(context.Context) ([]domain.Account, error) {
	return r.accounts, nil
}

func (r *reconRepo) SumEntriesByAccount(_ context.Context, accountID string) (int64, error) {
	return r.sums[accountID], nil
}

func (r *reconRepo) InsertReconciliationSnapshot(_ context.Context, s domain.ReconciliationSnapshot) error {
	r.snapshots = append(r.snapshots, s)
	return nil
}

func TestReconciliationService_Reconcile(t *testing.T) {
	now := time.Now().UTC()
	a1, _ := domain.NewAccount("a1", "USD", 1000, now)
	a2, _ := domain.NewAccount("a2", "USD", 2000, now)
	r := &reconRepo{
		accounts: []domain.Account{a1, a2},
		sums:     map[string]int64{"a1": 1000, "a2": 1900},
	}
	svc := NewReconciliationService(r, nil)
	snap, err := svc.Reconcile(context.Background(), "snap-1")
	if err != nil {
		t.Fatalf("reconcile failed: %v", err)
	}
	if snap.ID != "snap-1" {
		t.Fatalf("unexpected snapshot id: %s", snap.ID)
	}
	if len(snap.Accounts) != 2 {
		t.Fatalf("expected 2 accounts")
	}
	if snap.TotalDrift != 100 {
		t.Fatalf("expected drift 100, got %d", snap.TotalDrift)
	}
	if len(r.snapshots) != 1 {
		t.Fatalf("expected snapshot persisted")
	}
}
