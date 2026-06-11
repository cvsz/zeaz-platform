package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"game-catalog-service/internal/zeaz/settlement"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) CreateReceipt(ctx context.Context, r settlement.Receipt) error {
	transfersJSON, err := json.Marshal(r.Transfers)
	if err != nil {
		return fmt.Errorf("marshal transfers: %w", err)
	}

	const query = `
INSERT INTO zeaz_settlement_receipts (id, height, state_root, transfer_root, transfers, settlement_hash, signer_id, signature, settled_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
ON CONFLICT (id) DO NOTHING`
	_, err = s.pool.Exec(ctx, query,
		r.ID, int64(r.Height), r.StateRoot, r.TransferRoot,
		transfersJSON, r.SettlementHash, r.SignerID, r.Signature, r.SettledAt,
	)
	if err != nil {
		return fmt.Errorf("create receipt: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetReceipt(ctx context.Context, id string) (settlement.Receipt, error) {
	const query = `
SELECT id, height, state_root, transfer_root, transfers, settlement_hash, signer_id, signature, settled_at
FROM zeaz_settlement_receipts WHERE id = $1`
	row := s.pool.QueryRow(ctx, query, id)
	r, err := scanReceipt(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return settlement.Receipt{}, ErrNotFound
	}
	if err != nil {
		return settlement.Receipt{}, fmt.Errorf("get receipt: %w", err)
	}
	return r, nil
}

func (s *PostgresStore) GetReceiptsByHeight(ctx context.Context, height uint64) ([]settlement.Receipt, error) {
	const query = `
SELECT id, height, state_root, transfer_root, transfers, settlement_hash, signer_id, signature, settled_at
FROM zeaz_settlement_receipts WHERE height = $1 ORDER BY id`
	rows, err := s.pool.Query(ctx, query, int64(height))
	if err != nil {
		return nil, fmt.Errorf("get receipts by height: %w", err)
	}
	defer rows.Close()

	var receipts []settlement.Receipt
	for rows.Next() {
		r, err := scanReceipt(rows)
		if err != nil {
			return nil, err
		}
		receipts = append(receipts, r)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate receipts: %w", err)
	}
	return receipts, nil
}

type receiptScanner interface {
	Scan(dest ...any) error
}

func scanReceipt(row receiptScanner) (settlement.Receipt, error) {
	var r settlement.Receipt
	var height int64
	var transfersJSON []byte
	err := row.Scan(
		&r.ID, &height, &r.StateRoot, &r.TransferRoot,
		&transfersJSON, &r.SettlementHash, &r.SignerID, &r.Signature, &r.SettledAt,
	)
	if err != nil {
		return settlement.Receipt{}, err
	}
	r.Height = uint64(height)
	if len(transfersJSON) > 0 {
		if err := json.Unmarshal(transfersJSON, &r.Transfers); err != nil {
			return settlement.Receipt{}, fmt.Errorf("unmarshal transfers: %w", err)
		}
	}
	return r, nil
}
