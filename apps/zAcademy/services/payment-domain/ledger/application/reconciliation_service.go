package application

import (
	"context"
	"fmt"
	"ledger/domain"
	"time"
)

type ReconciliationReadRepository interface {
	ListAccounts(context.Context) ([]domain.Account, error)
	SumEntriesByAccount(context.Context, string) (int64, error)
	InsertReconciliationSnapshot(context.Context, domain.ReconciliationSnapshot) error
}

type ReconciliationService struct {
	repo   ReconciliationReadRepository
	tracer Tracer
	nowFn  func() time.Time
}

func NewReconciliationService(repo ReconciliationReadRepository, tracer Tracer) *ReconciliationService {
	if tracer == nil {
		tracer = NoopTracer{}
	}
	return &ReconciliationService{repo: repo, tracer: tracer, nowFn: time.Now}
}

func (s *ReconciliationService) Reconcile(ctx context.Context, snapshotID string) (domain.ReconciliationSnapshot, error) {
	ctx, span := s.tracer.Start(ctx, "ledger.reconciliation_service.reconcile")
	defer span.End()

	accounts, err := s.repo.ListAccounts(ctx)
	if err != nil {
		span.RecordError(err)
		return domain.ReconciliationSnapshot{}, err
	}
	rows := make([]domain.AccountSnapshot, 0, len(accounts))
	for _, a := range accounts {
		calc, err := s.repo.SumEntriesByAccount(ctx, a.ID)
		if err != nil {
			span.RecordError(err)
			return domain.ReconciliationSnapshot{}, err
		}
		rows = append(rows, domain.AccountSnapshot{
			AccountID:         a.ID,
			Currency:          a.Balance.Currency,
			RecordedBalance:   a.Balance.Amount,
			CalculatedBalance: calc,
			Difference:        a.Balance.Amount - calc,
			Version:           a.Version,
		})
	}

	at := s.nowFn().UTC()
	if snapshotID == "" {
		snapshotID = fmt.Sprintf("recon-%d", at.UnixNano())
	}
	snapshot := domain.NewReconciliationSnapshot(snapshotID, at, rows)
	if err := s.repo.InsertReconciliationSnapshot(ctx, snapshot); err != nil {
		span.RecordError(err)
		return domain.ReconciliationSnapshot{}, err
	}
	span.SetAttribute("snapshot.id", snapshot.ID)
	return snapshot, nil
}
