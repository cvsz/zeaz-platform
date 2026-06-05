package domain

import "time"

type AccountSnapshot struct {
	AccountID         string
	Currency          string
	RecordedBalance   int64
	CalculatedBalance int64
	Difference        int64
	Version           int64
}

type ReconciliationSnapshot struct {
	ID         string
	CreatedAt  time.Time
	Accounts   []AccountSnapshot
	TotalDrift int64
}

func NewReconciliationSnapshot(id string, createdAt time.Time, accounts []AccountSnapshot) ReconciliationSnapshot {
	copied := make([]AccountSnapshot, len(accounts))
	copy(copied, accounts)
	total := int64(0)
	for _, a := range copied {
		total += abs64(a.Difference)
	}
	return ReconciliationSnapshot{ID: id, CreatedAt: createdAt.UTC(), Accounts: copied, TotalDrift: total}
}

func abs64(v int64) int64 {
	if v < 0 {
		return -v
	}
	return v
}
