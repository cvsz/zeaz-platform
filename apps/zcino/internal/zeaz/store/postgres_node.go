package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"game-catalog-service/internal/zeaz/protocol"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) UpsertPeer(ctx context.Context, p protocol.Peer) error {
	const query = `
INSERT INTO zeaz_peers (node_id, org_id, address, public_key, seen_at)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (node_id) DO UPDATE SET
	org_id = $2, address = $3, public_key = $4, seen_at = $5`
	_, err := s.pool.Exec(ctx, query, p.NodeID, p.OrgID, p.Address, p.PublicKey, p.SeenAt)
	if err != nil {
		return fmt.Errorf("upsert peer: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetPeer(ctx context.Context, nodeID string) (protocol.Peer, error) {
	const query = `SELECT node_id, org_id, address, public_key, seen_at FROM zeaz_peers WHERE node_id = $1`
	row := s.pool.QueryRow(ctx, query, nodeID)
	var p protocol.Peer
	err := row.Scan(&p.NodeID, &p.OrgID, &p.Address, &p.PublicKey, &p.SeenAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return protocol.Peer{}, ErrNotFound
	}
	if err != nil {
		return protocol.Peer{}, fmt.Errorf("get peer: %w", err)
	}
	return p, nil
}

func (s *PostgresStore) GetActivePeers(ctx context.Context, ttl time.Duration, now time.Time) ([]protocol.Peer, error) {
	const query = `
SELECT node_id, org_id, address, public_key, seen_at
FROM zeaz_peers
WHERE seen_at >= $1
ORDER BY node_id ASC`
	minSeenAt := now.Add(-ttl)
	rows, err := s.pool.Query(ctx, query, minSeenAt)
	if err != nil {
		return nil, fmt.Errorf("get active peers: %w", err)
	}
	defer rows.Close()

	var peers []protocol.Peer
	for rows.Next() {
		var p protocol.Peer
		if err := rows.Scan(&p.NodeID, &p.OrgID, &p.Address, &p.PublicKey, &p.SeenAt); err != nil {
			return nil, fmt.Errorf("scan peer: %w", err)
		}
		peers = append(peers, p)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate peers: %w", err)
	}
	return peers, nil
}

func (s *PostgresStore) StoreEnvelope(ctx context.Context, env protocol.Envelope) error {
	const query = `
INSERT INTO zeaz_envelopes (id, kind, version_major, version_minor, version_patch, issuer, issued_at, expires_at, nonce, payload, signature_algorithm, signature_key_id, signature_value)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
ON CONFLICT (id) DO NOTHING`
	_, err := s.pool.Exec(ctx, query,
		env.ID, env.Kind,
		env.Version.Major, env.Version.Minor, env.Version.Patch,
		env.Issuer, env.IssuedAt, env.ExpiresAt,
		env.Nonce, []byte(env.Payload),
		env.Signature.Algorithm, env.Signature.KeyID, env.Signature.Value,
	)
	if err != nil {
		return fmt.Errorf("store envelope: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetEnvelopes(ctx context.Context, offset, limit int) ([]protocol.Envelope, error) {
	const query = `
SELECT id, kind, version_major, version_minor, version_patch, issuer, issued_at, expires_at, nonce, payload, signature_algorithm, signature_key_id, signature_value
FROM zeaz_envelopes ORDER BY issued_at DESC LIMIT $1 OFFSET $2`
	rows, err := s.pool.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("get envelopes: %w", err)
	}
	defer rows.Close()

	var envelopes []protocol.Envelope
	for rows.Next() {
		env, err := scanEnvelope(rows)
		if err != nil {
			return nil, err
		}
		envelopes = append(envelopes, env)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate envelopes: %w", err)
	}
	return envelopes, nil
}

func (s *PostgresStore) CountEnvelopes(ctx context.Context) (int, error) {
	const query = `SELECT COUNT(*) FROM zeaz_envelopes`
	var count int
	err := s.pool.QueryRow(ctx, query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("count envelopes: %w", err)
	}
	return count, nil
}

type envelopeScanner interface {
	Scan(dest ...any) error
}

func scanEnvelope(row envelopeScanner) (protocol.Envelope, error) {
	var env protocol.Envelope
	var major, minor, patch int32
	var payloadBytes []byte
	err := row.Scan(
		&env.ID, &env.Kind,
		&major, &minor, &patch,
		&env.Issuer, &env.IssuedAt, &env.ExpiresAt,
		&env.Nonce, &payloadBytes,
		&env.Signature.Algorithm, &env.Signature.KeyID, &env.Signature.Value,
	)
	if err != nil {
		return protocol.Envelope{}, err
	}
	env.Version.Major = uint32(major)
	env.Version.Minor = uint32(minor)
	env.Version.Patch = uint32(patch)
	env.Payload = payloadBytes
	return env, nil
}
