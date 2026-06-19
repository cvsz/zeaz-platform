package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"game-catalog-service/internal/zeaz/consensus"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) UpsertConsensusValidator(ctx context.Context, v consensus.Validator) error {
	const query = `
INSERT INTO zeaz_consensus_validators (id, power, public_key, metadata)
VALUES ($1, $2, $3, $4)
ON CONFLICT (id) DO UPDATE SET power = $2, public_key = $3, metadata = $4`
	_, err := s.pool.Exec(ctx, query, v.ID, int64(v.Power), v.PublicKey, v.Metadata)
	if err != nil {
		return fmt.Errorf("upsert consensus validator: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetConsensusValidator(ctx context.Context, id string) (consensus.Validator, error) {
	const query = `SELECT id, power, public_key, metadata FROM zeaz_consensus_validators WHERE id = $1`
	row := s.pool.QueryRow(ctx, query, id)
	var v consensus.Validator
	var power int64
	err := row.Scan(&v.ID, &power, &v.PublicKey, &v.Metadata)
	if errors.Is(err, pgx.ErrNoRows) {
		return consensus.Validator{}, ErrNotFound
	}
	if err != nil {
		return consensus.Validator{}, fmt.Errorf("get consensus validator: %w", err)
	}
	v.Power = uint64(power)
	return v, nil
}

func (s *PostgresStore) ListConsensusValidators(ctx context.Context) (map[string]consensus.Validator, error) {
	const query = `SELECT id, power, public_key, metadata FROM zeaz_consensus_validators ORDER BY id`
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list consensus validators: %w", err)
	}
	defer rows.Close()

	validators := make(map[string]consensus.Validator)
	for rows.Next() {
		var v consensus.Validator
		var power int64
		if err := rows.Scan(&v.ID, &power, &v.PublicKey, &v.Metadata); err != nil {
			return nil, fmt.Errorf("scan consensus validator: %w", err)
		}
		v.Power = uint64(power)
		validators[v.ID] = v
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate consensus validators: %w", err)
	}
	return validators, nil
}

func (s *PostgresStore) GetTotalConsensusPower(ctx context.Context) (uint64, error) {
	const query = `SELECT COALESCE(SUM(power), 0) FROM zeaz_consensus_validators`
	var total int64
	err := s.pool.QueryRow(ctx, query).Scan(&total)
	if err != nil {
		return 0, fmt.Errorf("get total consensus power: %w", err)
	}
	return uint64(total), nil
}

func (s *PostgresStore) CreateVote(ctx context.Context, v consensus.Vote) error {
	const query = `
INSERT INTO zeaz_consensus_votes (height, round, phase, block_hash, validator_id, signature, at)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (height, round, phase, validator_id) DO NOTHING`
	_, err := s.pool.Exec(ctx, query,
		int64(v.Height), int64(v.Round), string(v.Phase),
		v.BlockHash, v.ValidatorID, v.Signature, v.At,
	)
	if err != nil {
		return fmt.Errorf("create vote: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetVotesAtHeightRoundPhase(ctx context.Context, height, round uint64, phase string) ([]consensus.Vote, error) {
	const query = `
SELECT height, round, phase, block_hash, validator_id, signature, at
FROM zeaz_consensus_votes
WHERE height = $1 AND round = $2 AND phase = $3
ORDER BY validator_id`
	rows, err := s.pool.Query(ctx, query, int64(height), int64(round), phase)
	if err != nil {
		return nil, fmt.Errorf("get votes at height/round/phase: %w", err)
	}
	defer rows.Close()

	var votes []consensus.Vote
	for rows.Next() {
		var v consensus.Vote
		var h, r int64
		var phaseStr string
		if err := rows.Scan(&h, &r, &phaseStr, &v.BlockHash, &v.ValidatorID, &v.Signature, &v.At); err != nil {
			return nil, fmt.Errorf("scan vote: %w", err)
		}
		v.Height = uint64(h)
		v.Round = uint64(r)
		v.Phase = consensus.Phase(phaseStr)
		votes = append(votes, v)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate votes: %w", err)
	}
	return votes, nil
}

func (s *PostgresStore) CreateCommit(ctx context.Context, c consensus.Commit) error {
	votersJSON, err := json.Marshal(c.QC.Voters)
	if err != nil {
		return fmt.Errorf("marshal qc voters: %w", err)
	}

	const query = `
INSERT INTO zeaz_commits (
	height, round, proposer_id, parent_hash, payload_hash, timestamp,
	qc_algorithm, qc_height, qc_round, qc_phase, qc_block_hash, qc_power, qc_total, qc_voters,
	at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
ON CONFLICT (height) DO NOTHING`
	_, err = s.pool.Exec(ctx, query,
		int64(c.Proposal.Height), int64(c.Proposal.Round),
		c.Proposal.ProposerID, c.Proposal.ParentHash, c.Proposal.PayloadHash,
		c.Proposal.Timestamp,
		string(c.QC.Algorithm), int64(c.QC.Height), int64(c.QC.Round),
		string(c.QC.Phase), c.QC.BlockHash, int64(c.QC.Power), int64(c.QC.Total),
		votersJSON, c.At,
	)
	if err != nil {
		return fmt.Errorf("create commit: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetCommits(ctx context.Context) ([]consensus.Commit, error) {
	const query = `
SELECT height, round, proposer_id, parent_hash, payload_hash, timestamp,
	qc_algorithm, qc_height, qc_round, qc_phase, qc_block_hash, qc_power, qc_total, qc_voters,
	at
FROM zeaz_commits ORDER BY height ASC`
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("get commits: %w", err)
	}
	defer rows.Close()

	var commits []consensus.Commit
	for rows.Next() {
		c, err := scanCommit(rows)
		if err != nil {
			return nil, err
		}
		commits = append(commits, c)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate commits: %w", err)
	}
	return commits, nil
}

func (s *PostgresStore) GetCommitAtHeight(ctx context.Context, height uint64) (consensus.Commit, error) {
	const query = `
SELECT height, round, proposer_id, parent_hash, payload_hash, timestamp,
	qc_algorithm, qc_height, qc_round, qc_phase, qc_block_hash, qc_power, qc_total, qc_voters,
	at
FROM zeaz_commits WHERE height = $1`
	c, err := scanCommit(s.pool.QueryRow(ctx, query, int64(height)))
	if errors.Is(err, pgx.ErrNoRows) {
		return consensus.Commit{}, ErrNotFound
	}
	if err != nil {
		return consensus.Commit{}, fmt.Errorf("get commit at height: %w", err)
	}
	return c, nil
}

func (s *PostgresStore) LatestCommitHeight(ctx context.Context) (uint64, error) {
	const query = `SELECT COALESCE(MAX(height), 0) FROM zeaz_commits`
	var height int64
	err := s.pool.QueryRow(ctx, query).Scan(&height)
	if err != nil {
		return 0, fmt.Errorf("latest commit height: %w", err)
	}
	return uint64(height), nil
}

type commitScanner interface {
	Scan(dest ...any) error
}

func scanCommit(row commitScanner) (consensus.Commit, error) {
	var c consensus.Commit
	var propHeight, propRound, qcHeight, qcRound, qcPower, qcTotal int64
	var qcAlgo, qcPhase string
	var votersJSON []byte

	err := row.Scan(
		&propHeight, &propRound, &c.Proposal.ProposerID,
		&c.Proposal.ParentHash, &c.Proposal.PayloadHash, &c.Proposal.Timestamp,
		&qcAlgo, &qcHeight, &qcRound, &qcPhase,
		&c.QC.BlockHash, &qcPower, &qcTotal, &votersJSON,
		&c.At,
	)
	if err != nil {
		return consensus.Commit{}, err
	}
	c.Proposal.Height = uint64(propHeight)
	c.Proposal.Round = uint64(propRound)
	c.QC.Algorithm = consensus.Algorithm(qcAlgo)
	c.QC.Height = uint64(qcHeight)
	c.QC.Round = uint64(qcRound)
	c.QC.Phase = consensus.Phase(qcPhase)
	c.QC.Power = uint64(qcPower)
	c.QC.Total = uint64(qcTotal)
	if len(votersJSON) > 0 {
		if err := json.Unmarshal(votersJSON, &c.QC.Voters); err != nil {
			return consensus.Commit{}, fmt.Errorf("unmarshal qc voters: %w", err)
		}
	}
	return c, nil
}
