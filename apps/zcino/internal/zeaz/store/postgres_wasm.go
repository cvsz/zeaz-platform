package store

import (
	"context"
	"errors"
	"fmt"

	"game-catalog-service/internal/zeaz/wasm"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) RegisterWasmModule(ctx context.Context, m wasm.Module) error {
	const query = `
INSERT INTO zeaz_wasm_modules (id, code_hash, abi, max_fuel, permissions, metadata)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (id) DO UPDATE SET
	code_hash = $2, abi = $3, max_fuel = $4, permissions = $5, metadata = $6`
	_, err := s.pool.Exec(ctx, query,
		m.ID, m.CodeHash, m.ABI, int64(m.MaxFuel), m.Permissions, m.Metadata,
	)
	if err != nil {
		return fmt.Errorf("register wasm module: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetWasmModule(ctx context.Context, id string) (wasm.Module, error) {
	const query = `
SELECT id, code_hash, abi, max_fuel, permissions, metadata
FROM zeaz_wasm_modules WHERE id = $1`
	row := s.pool.QueryRow(ctx, query, id)
	var m wasm.Module
	var maxFuel int64
	err := row.Scan(&m.ID, &m.CodeHash, &m.ABI, &maxFuel, &m.Permissions, &m.Metadata)
	if errors.Is(err, pgx.ErrNoRows) {
		return wasm.Module{}, ErrNotFound
	}
	if err != nil {
		return wasm.Module{}, fmt.Errorf("get wasm module: %w", err)
	}
	m.MaxFuel = uint64(maxFuel)
	return m, nil
}

func (s *PostgresStore) ListWasmModules(ctx context.Context) (map[string]wasm.Module, error) {
	const query = `
SELECT id, code_hash, abi, max_fuel, permissions, metadata
FROM zeaz_wasm_modules ORDER BY id`
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list wasm modules: %w", err)
	}
	defer rows.Close()

	modules := make(map[string]wasm.Module)
	for rows.Next() {
		var m wasm.Module
		var maxFuel int64
		if err := rows.Scan(&m.ID, &m.CodeHash, &m.ABI, &maxFuel, &m.Permissions, &m.Metadata); err != nil {
			return nil, fmt.Errorf("scan wasm module: %w", err)
		}
		m.MaxFuel = uint64(maxFuel)
		modules[m.ID] = m
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate wasm modules: %w", err)
	}
	return modules, nil
}
