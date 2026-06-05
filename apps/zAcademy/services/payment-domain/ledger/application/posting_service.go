package application

import (
	"context"
	"errors"
	"fmt"
	"ledger/domain"
	"time"
)

var (
	ErrOptimisticLockConflict = errors.New("optimistic lock conflict")
	ErrRepositoryRequired     = errors.New("ledger repository required")
)

type Span interface {
	End()
	RecordError(error)
	SetAttribute(string, string)
}

type Tracer interface {
	Start(context.Context, string) (context.Context, Span)
}

type noopSpan struct{}

func (noopSpan) End()                     {}
func (noopSpan) RecordError(_ error)      {}
func (noopSpan) SetAttribute(_, _ string) {}

type NoopTracer struct{}

func (NoopTracer) Start(ctx context.Context, _ string) (context.Context, Span) {
	return ctx, noopSpan{}
}

type AuditEvent struct {
	EventID    string
	EntityID   string
	Action     string
	OccurredAt time.Time
	Actor      string
	Payload    map[string]string
}

type LedgerTxRepository interface {
	GetAccountForUpdate(context.Context, string) (domain.Account, error)
	UpdateAccountWithVersion(context.Context, domain.Account, int64) (bool, error)
	InsertEntry(context.Context, domain.Entry) error
	InsertAuditEvent(context.Context, AuditEvent) error
}

type LedgerRepository interface {
	WithSerializableTx(context.Context, func(context.Context, LedgerTxRepository) error) error
}

type PostingService struct {
	repo   LedgerRepository
	tracer Tracer
	nowFn  func() time.Time
}

func NewPostingService(repo LedgerRepository, tracer Tracer) *PostingService {
	if tracer == nil {
		tracer = NoopTracer{}
	}
	return &PostingService{repo: repo, tracer: tracer, nowFn: time.Now}
}

func (s *PostingService) Post(ctx context.Context, p domain.Posting, actor string) error {
	if s.repo == nil {
		return ErrRepositoryRequired
	}
	ctx, span := s.tracer.Start(ctx, "ledger.posting_service.post")
	defer span.End()
	if err := p.Validate(); err != nil {
		span.RecordError(err)
		return err
	}
	if actor == "" {
		actor = "system"
	}
	span.SetAttribute("posting.id", p.ID)
	span.SetAttribute("posting.debit_account", p.DebitAccountID)
	span.SetAttribute("posting.credit_account", p.CreditAccountID)
	span.SetAttribute("posting.currency", p.Currency)

	return s.repo.WithSerializableTx(ctx, func(txCtx context.Context, tx LedgerTxRepository) error {
		now := s.nowFn().UTC()
		debitEntry, creditEntry, err := p.ToEntries(now)
		if err != nil {
			return err
		}

		debitAccount, err := tx.GetAccountForUpdate(txCtx, p.DebitAccountID)
		if err != nil {
			return err
		}
		creditAccount, err := tx.GetAccountForUpdate(txCtx, p.CreditAccountID)
		if err != nil {
			return err
		}
		if debitAccount.Balance.Currency != p.Currency || creditAccount.Balance.Currency != p.Currency {
			return fmt.Errorf("currency mismatch")
		}

		updatedDebit, err := debitAccount.ApplyDelta(-p.Amount, now)
		if err != nil {
			return err
		}
		updatedCredit, err := creditAccount.ApplyDelta(p.Amount, now)
		if err != nil {
			return err
		}

		ok, err := tx.UpdateAccountWithVersion(txCtx, updatedDebit, debitAccount.Version)
		if err != nil {
			return err
		}
		if !ok {
			return ErrOptimisticLockConflict
		}
		ok, err = tx.UpdateAccountWithVersion(txCtx, updatedCredit, creditAccount.Version)
		if err != nil {
			return err
		}
		if !ok {
			return ErrOptimisticLockConflict
		}

		if err := tx.InsertEntry(txCtx, debitEntry); err != nil {
			return err
		}
		if err := tx.InsertEntry(txCtx, creditEntry); err != nil {
			return err
		}

		audit := AuditEvent{
			EventID:    p.ID + "-audit",
			EntityID:   p.ID,
			Action:     "ledger.posted",
			OccurredAt: now,
			Actor:      actor,
			Payload: map[string]string{
				"debit_account":  p.DebitAccountID,
				"credit_account": p.CreditAccountID,
				"amount":         fmt.Sprintf("%d", p.Amount),
				"currency":       p.Currency,
			},
		}
		return tx.InsertAuditEvent(txCtx, audit)
	})
}
