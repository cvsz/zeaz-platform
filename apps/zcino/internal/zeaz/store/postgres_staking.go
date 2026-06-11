package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"game-catalog-service/internal/zeaz/staking"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) UpsertStakingValidator(ctx context.Context, v staking.Validator) error {
	const query = `
INSERT INTO zeaz_staking_validators (id, operator_address, consensus_key, stake, delegated_stake, status, jailed_until, slash_count)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (id) DO UPDATE SET
	operator_address = $2, consensus_key = $3, stake = $4, delegated_stake = $5,
	status = $6, jailed_until = $7, slash_count = $8`
	_, err := s.pool.Exec(ctx, query,
		v.ID, v.OperatorAddress, v.ConsensusKey,
		int64(v.Stake), int64(v.DelegatedStake),
		string(v.Status), v.JailedUntil, v.SlashCount,
	)
	if err != nil {
		return fmt.Errorf("upsert staking validator: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetStakingValidator(ctx context.Context, id string) (staking.Validator, error) {
	const query = `
SELECT id, operator_address, consensus_key, stake, delegated_stake, status, jailed_until, slash_count
FROM zeaz_staking_validators WHERE id = $1`
	row := s.pool.QueryRow(ctx, query, id)
	var v staking.Validator
	var status string
	var stake, delegatedStake int64
	err := row.Scan(
		&v.ID, &v.OperatorAddress, &v.ConsensusKey,
		&stake, &delegatedStake, &status, &v.JailedUntil, &v.SlashCount,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return staking.Validator{}, ErrNotFound
	}
	if err != nil {
		return staking.Validator{}, fmt.Errorf("get staking validator: %w", err)
	}
	v.Stake = uint64(stake)
	v.DelegatedStake = uint64(delegatedStake)
	v.Status = staking.ValidatorStatus(status)
	return v, nil
}

func (s *PostgresStore) ListStakingValidators(ctx context.Context) (map[string]staking.Validator, error) {
	const query = `
SELECT id, operator_address, consensus_key, stake, delegated_stake, status, jailed_until, slash_count
FROM zeaz_staking_validators ORDER BY id`
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list staking validators: %w", err)
	}
	defer rows.Close()

	validators := make(map[string]staking.Validator)
	for rows.Next() {
		var v staking.Validator
		var status string
		var stake, delegatedStake int64
		if err := rows.Scan(
			&v.ID, &v.OperatorAddress, &v.ConsensusKey,
			&stake, &delegatedStake, &status, &v.JailedUntil, &v.SlashCount,
		); err != nil {
			return nil, fmt.Errorf("scan staking validator: %w", err)
		}
		v.Stake = uint64(stake)
		v.DelegatedStake = uint64(delegatedStake)
		v.Status = staking.ValidatorStatus(status)
		validators[v.ID] = v
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate staking validators: %w", err)
	}
	return validators, nil
}

func (s *PostgresStore) GetActiveStakingValidators(ctx context.Context, now time.Time) ([]staking.Validator, error) {
	const query = `
SELECT id, operator_address, consensus_key, stake, delegated_stake, status, jailed_until, slash_count
FROM zeaz_staking_validators
WHERE (status = 'bonded')
   OR (status = 'jailed' AND jailed_until IS NOT NULL AND jailed_until <= $1)
ORDER BY (stake + delegated_stake) DESC, id ASC`
	rows, err := s.pool.Query(ctx, query, now)
	if err != nil {
		return nil, fmt.Errorf("get active staking validators: %w", err)
	}
	defer rows.Close()

	var validators []staking.Validator
	for rows.Next() {
		var v staking.Validator
		var status string
		var stake, delegatedStake int64
		if err := rows.Scan(
			&v.ID, &v.OperatorAddress, &v.ConsensusKey,
			&stake, &delegatedStake, &status, &v.JailedUntil, &v.SlashCount,
		); err != nil {
			return nil, fmt.Errorf("scan staking validator: %w", err)
		}
		v.Stake = uint64(stake)
		v.DelegatedStake = uint64(delegatedStake)
		v.Status = staking.ValidatorStatus(status)
		if v.Status == staking.StatusJailed && !v.JailedUntil.IsZero() && now.After(v.JailedUntil) {
			v.Status = staking.StatusBonded
		}
		validators = append(validators, v)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate staking validators: %w", err)
	}
	return validators, nil
}

func (s *PostgresStore) AppendStakingEvent(ctx context.Context, e staking.Event) error {
	const query = `
INSERT INTO zeaz_staking_events (event_type, validator_id, amount, reason, at)
VALUES ($1, $2, $3, $4, $5)`
	_, err := s.pool.Exec(ctx, query, e.Type, e.ValidatorID, int64(e.Amount), e.Reason, e.At)
	if err != nil {
		return fmt.Errorf("append staking event: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetStakingEvents(ctx context.Context, afterSeq int64) ([]staking.Event, error) {
	const query = `
SELECT seq, event_type, validator_id, amount, reason, at
FROM zeaz_staking_events WHERE seq > $1 ORDER BY seq ASC`
	rows, err := s.pool.Query(ctx, query, afterSeq)
	if err != nil {
		return nil, fmt.Errorf("get staking events: %w", err)
	}
	defer rows.Close()

	var events []staking.Event
	for rows.Next() {
		var e staking.Event
		var amount int64
		var seq int64
		if err := rows.Scan(&seq, &e.Type, &e.ValidatorID, &amount, &e.Reason, &e.At); err != nil {
			return nil, fmt.Errorf("scan staking event: %w", err)
		}
		e.Amount = uint64(amount)
		events = append(events, e)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate staking events: %w", err)
	}
	return events, nil
}
