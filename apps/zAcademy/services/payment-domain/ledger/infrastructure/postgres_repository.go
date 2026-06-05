package infrastructure

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"ledger/application"
	"ledger/domain"
)

type PostgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) *PostgresRepository {
	return &PostgresRepository{db: db}
}

type txRepo struct {
	tx *sql.Tx
}

func (r *PostgresRepository) WithSerializableTx(ctx context.Context, fn func(context.Context, application.LedgerTxRepository) error) error {
	if r == nil || r.db == nil {
		return errors.New("nil postgres repository")
	}
	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		return err
	}
	txr := &txRepo{tx: tx}
	if err := fn(ctx, txr); err != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			return errors.Join(err, rbErr)
		}
		return err
	}
	return tx.Commit()
}

func (t *txRepo) GetAccountForUpdate(ctx context.Context, accountID string) (domain.Account, error) {
	row := t.tx.QueryRowContext(ctx, `
SELECT id, currency, balance_amount, version, created_at, updated_at
FROM ledger_accounts
WHERE id = $1
FOR UPDATE`, accountID)
	var id, currency string
	var amount, version int64
	var createdAt, updatedAt sql.NullTime
	if err := row.Scan(&id, &currency, &amount, &version, &createdAt, &updatedAt); err != nil {
		return domain.Account{}, err
	}
	balance, err := domain.NewBalance(currency, amount)
	if err != nil {
		return domain.Account{}, err
	}
	return domain.Account{ID: id, Balance: balance, Version: version, CreatedAt: createdAt.Time, UpdatedAt: updatedAt.Time}, nil
}

func (t *txRepo) UpdateAccountWithVersion(ctx context.Context, account domain.Account, expectedVersion int64) (bool, error) {
	res, err := t.tx.ExecContext(ctx, `
UPDATE ledger_accounts
SET balance_amount = $1, version = $2, updated_at = $3
WHERE id = $4 AND version = $5`,
		account.Balance.Amount, account.Version, account.UpdatedAt, account.ID, expectedVersion,
	)
	if err != nil {
		return false, err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return n == 1, nil
}

func (t *txRepo) InsertEntry(ctx context.Context, entry domain.Entry) error {
	_, err := t.tx.ExecContext(ctx, `
INSERT INTO ledger_entries (id, posting_id, account_id, direction, amount, currency, description, created_at)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		entry.ID(), entry.PostingID(), entry.AccountID(), string(entry.Direction()), entry.Amount(), entry.Currency(), entry.Description(), entry.CreatedAt(),
	)
	return err
}

func (t *txRepo) InsertAuditEvent(ctx context.Context, evt application.AuditEvent) error {
	payload, err := json.Marshal(evt.Payload)
	if err != nil {
		return err
	}
	_, err = t.tx.ExecContext(ctx, `
INSERT INTO ledger_audit_trail (event_id, entity_id, action, occurred_at, actor, payload)
VALUES ($1,$2,$3,$4,$5,$6)`,
		evt.EventID, evt.EntityID, evt.Action, evt.OccurredAt, evt.Actor, payload,
	)
	return err
}

func (r *PostgresRepository) ListAccounts(ctx context.Context) ([]domain.Account, error) {
	if r == nil || r.db == nil {
		return nil, errors.New("nil postgres repository")
	}
	rows, err := r.db.QueryContext(ctx, `
SELECT id, currency, balance_amount, version, created_at, updated_at
FROM ledger_accounts`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	accounts := []domain.Account{}
	for rows.Next() {
		var id, currency string
		var amount, version int64
		var createdAt, updatedAt sql.NullTime
		if err := rows.Scan(&id, &currency, &amount, &version, &createdAt, &updatedAt); err != nil {
			return nil, err
		}
		balance, err := domain.NewBalance(currency, amount)
		if err != nil {
			return nil, err
		}
		accounts = append(accounts, domain.Account{ID: id, Balance: balance, Version: version, CreatedAt: createdAt.Time, UpdatedAt: updatedAt.Time})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return accounts, nil
}

func (r *PostgresRepository) SumEntriesByAccount(ctx context.Context, accountID string) (int64, error) {
	if r == nil || r.db == nil {
		return 0, errors.New("nil postgres repository")
	}
	row := r.db.QueryRowContext(ctx, `
SELECT COALESCE(SUM(CASE WHEN direction='credit' THEN amount ELSE -amount END), 0)
FROM ledger_entries
WHERE account_id = $1`, accountID)
	var sum int64
	if err := row.Scan(&sum); err != nil {
		return 0, err
	}
	return sum, nil
}

func (r *PostgresRepository) InsertReconciliationSnapshot(ctx context.Context, snapshot domain.ReconciliationSnapshot) error {
	if r == nil || r.db == nil {
		return errors.New("nil postgres repository")
	}
	blob, err := json.Marshal(snapshot)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx, `
INSERT INTO ledger_reconciliation_snapshots (id, created_at, total_drift, payload)
VALUES ($1,$2,$3,$4)`, snapshot.ID, snapshot.CreatedAt, snapshot.TotalDrift, blob)
	if err != nil {
		return fmt.Errorf("insert reconciliation snapshot: %w", err)
	}
	return nil
}
