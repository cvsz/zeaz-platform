package transport

import (
	"context"
	"errors"
	"ledger/application"
	"ledger/domain"
	"time"
)

var ErrInvalidRequest = errors.New("invalid request")

type PostRequest struct {
	PostingID       string
	DebitAccountID  string
	CreditAccountID string
	Amount          int64
	Currency        string
	Description     string
	Actor           string
}

type PostResponse struct {
	Accepted bool
}

type ReconcileRequest struct {
	SnapshotID string
}

type ReconcileResponse struct {
	Snapshot domain.ReconciliationSnapshot
}

type LedgerGRPCServer struct {
	posting        *application.PostingService
	reconciliation *application.ReconciliationService
}

func NewLedgerGRPCServer(posting *application.PostingService, reconciliation *application.ReconciliationService) *LedgerGRPCServer {
	return &LedgerGRPCServer{posting: posting, reconciliation: reconciliation}
}

func (s *LedgerGRPCServer) Post(ctx context.Context, req *PostRequest) (*PostResponse, error) {
	if req == nil {
		return nil, ErrInvalidRequest
	}
	posting, err := domain.NewPosting(req.PostingID, req.DebitAccountID, req.CreditAccountID, req.Amount, req.Currency, req.Description, time.Now().UTC())
	if err != nil {
		return nil, err
	}
	if err := s.posting.Post(ctx, posting, req.Actor); err != nil {
		return nil, err
	}
	return &PostResponse{Accepted: true}, nil
}

func (s *LedgerGRPCServer) Reconcile(ctx context.Context, req *ReconcileRequest) (*ReconcileResponse, error) {
	if req == nil {
		return nil, ErrInvalidRequest
	}
	snapshot, err := s.reconciliation.Reconcile(ctx, req.SnapshotID)
	if err != nil {
		return nil, err
	}
	return &ReconcileResponse{Snapshot: snapshot}, nil
}
