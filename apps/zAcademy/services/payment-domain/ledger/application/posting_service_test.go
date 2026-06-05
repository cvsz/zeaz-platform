package application

import (
	"context"
	"errors"
	"ledger/domain"
	"testing"
	"time"
)

type memoryTxRepo struct {
	accounts map[string]domain.Account
	entries  []domain.Entry
	audit    []AuditEvent
	conflict string
}

func (m *memoryTxRepo) GetAccountForUpdate(_ context.Context, id string) (domain.Account, error) {
	a, ok := m.accounts[id]
	if !ok {
		return domain.Account{}, errors.New("not found")
	}
	return a, nil
}

func (m *memoryTxRepo) UpdateAccountWithVersion(_ context.Context, account domain.Account, expectedVersion int64) (bool, error) {
	if account.ID == m.conflict {
		return false, nil
	}
	current := m.accounts[account.ID]
	if current.Version != expectedVersion {
		return false, nil
	}
	m.accounts[account.ID] = account
	return true, nil
}

func (m *memoryTxRepo) InsertEntry(_ context.Context, e domain.Entry) error {
	m.entries = append(m.entries, e)
	return nil
}

func (m *memoryTxRepo) InsertAuditEvent(_ context.Context, e AuditEvent) error {
	m.audit = append(m.audit, e)
	return nil
}

type memoryRepo struct {
	tx *memoryTxRepo
}

func (m *memoryRepo) WithSerializableTx(ctx context.Context, fn func(context.Context, LedgerTxRepository) error) error {
	backupAccounts := map[string]domain.Account{}
	for k, v := range m.tx.accounts {
		backupAccounts[k] = v
	}
	backupEntries := append([]domain.Entry(nil), m.tx.entries...)
	backupAudit := append([]AuditEvent(nil), m.tx.audit...)
	if err := fn(ctx, m.tx); err != nil {
		m.tx.accounts = backupAccounts
		m.tx.entries = backupEntries
		m.tx.audit = backupAudit
		return err
	}
	return nil
}

func TestPostingService_PostAtomicDoubleEntry(t *testing.T) {
	now := time.Now().UTC()
	a1, _ := domain.NewAccount("debit", "USD", 5000, now)
	a2, _ := domain.NewAccount("credit", "USD", 1000, now)
	tx := &memoryTxRepo{accounts: map[string]domain.Account{"debit": a1, "credit": a2}}
	svc := NewPostingService(&memoryRepo{tx: tx}, nil)
	p, _ := domain.NewPosting("p1", "debit", "credit", 1250, "USD", "capture", now)

	if err := svc.Post(context.Background(), p, "system"); err != nil {
		t.Fatalf("post failed: %v", err)
	}
	if len(tx.entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(tx.entries))
	}
	if tx.accounts["debit"].Balance.Amount != 3750 {
		t.Fatalf("unexpected debit balance: %d", tx.accounts["debit"].Balance.Amount)
	}
	if tx.accounts["credit"].Balance.Amount != 2250 {
		t.Fatalf("unexpected credit balance: %d", tx.accounts["credit"].Balance.Amount)
	}
	if len(tx.audit) != 1 {
		t.Fatalf("expected audit trail entry")
	}
}

func TestPostingService_OptimisticLockRollback(t *testing.T) {
	now := time.Now().UTC()
	a1, _ := domain.NewAccount("debit", "USD", 5000, now)
	a2, _ := domain.NewAccount("credit", "USD", 1000, now)
	tx := &memoryTxRepo{accounts: map[string]domain.Account{"debit": a1, "credit": a2}, conflict: "credit"}
	svc := NewPostingService(&memoryRepo{tx: tx}, nil)
	p, _ := domain.NewPosting("p2", "debit", "credit", 1250, "USD", "capture", now)

	err := svc.Post(context.Background(), p, "system")
	if !errors.Is(err, ErrOptimisticLockConflict) {
		t.Fatalf("expected optimistic lock conflict, got %v", err)
	}
	if len(tx.entries) != 0 || len(tx.audit) != 0 {
		t.Fatalf("expected atomic rollback on conflict")
	}
	if tx.accounts["debit"].Balance.Amount != 5000 || tx.accounts["credit"].Balance.Amount != 1000 {
		t.Fatalf("expected balances unchanged on rollback")
	}
}
