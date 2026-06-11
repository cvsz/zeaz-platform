package store

import (
	"context"
	"errors"
	"fmt"

	"game-catalog-service/internal/zeaz/ledger"
	"game-catalog-service/internal/zeaz/protocol"

	"github.com/jackc/pgx/v5"
)

func (s *PostgresStore) CreateOrg(ctx context.Context, org ledger.Org) error {
	const query = `
INSERT INTO zeaz_orgs (id, name, public_key, active, balance, stake, initial_reputation)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (id) DO NOTHING`
	_, err := s.pool.Exec(ctx, query,
		org.ID, org.Name, org.PublicKey, org.Active,
		org.Balance, org.Stake, org.InitialReputation,
	)
	if err != nil {
		return fmt.Errorf("create org: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetOrg(ctx context.Context, id string) (ledger.Org, error) {
	const query = `
SELECT id, name, public_key, active, balance, stake, initial_reputation
FROM zeaz_orgs WHERE id = $1`
	row := s.pool.QueryRow(ctx, query, id)
	var org ledger.Org
	err := row.Scan(
		&org.ID, &org.Name, &org.PublicKey, &org.Active,
		&org.Balance, &org.Stake, &org.InitialReputation,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return ledger.Org{}, ErrNotFound
	}
	if err != nil {
		return ledger.Org{}, fmt.Errorf("get org: %w", err)
	}
	return org, nil
}

func (s *PostgresStore) ListOrgs(ctx context.Context) ([]ledger.Org, error) {
	const query = `
SELECT id, name, public_key, active, balance, stake, initial_reputation
FROM zeaz_orgs ORDER BY id`
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list orgs: %w", err)
	}
	defer rows.Close()

	var orgs []ledger.Org
	for rows.Next() {
		var org ledger.Org
		if err := rows.Scan(
			&org.ID, &org.Name, &org.PublicKey, &org.Active,
			&org.Balance, &org.Stake, &org.InitialReputation,
		); err != nil {
			return nil, fmt.Errorf("scan org: %w", err)
		}
		orgs = append(orgs, org)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate orgs: %w", err)
	}
	return orgs, nil
}

func (s *PostgresStore) UpdateOrg(ctx context.Context, org ledger.Org) error {
	const query = `
UPDATE zeaz_orgs SET name = $2, public_key = $3, active = $4, balance = $5, stake = $6, initial_reputation = $7
WHERE id = $1`
	tag, err := s.pool.Exec(ctx, query,
		org.ID, org.Name, org.PublicKey, org.Active,
		org.Balance, org.Stake, org.InitialReputation,
	)
	if err != nil {
		return fmt.Errorf("update org: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *PostgresStore) UpsertAccount(ctx context.Context, acct ledger.Account) error {
	const query = `
INSERT INTO zeaz_accounts (did, balance, stake, escrow)
VALUES ($1, $2, $3, $4)
ON CONFLICT (did) DO UPDATE SET balance = $2, stake = $3, escrow = $4`
	_, err := s.pool.Exec(ctx, query, acct.DID, acct.Balance, acct.Stake, acct.Escrow)
	if err != nil {
		return fmt.Errorf("upsert account: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetAccount(ctx context.Context, did string) (ledger.Account, error) {
	const query = `SELECT did, balance, stake, escrow FROM zeaz_accounts WHERE did = $1`
	row := s.pool.QueryRow(ctx, query, did)
	var acct ledger.Account
	err := row.Scan(&acct.DID, &acct.Balance, &acct.Stake, &acct.Escrow)
	if errors.Is(err, pgx.ErrNoRows) {
		return ledger.Account{}, ErrNotFound
	}
	if err != nil {
		return ledger.Account{}, fmt.Errorf("get account: %w", err)
	}
	return acct, nil
}

func (s *PostgresStore) ListAccounts(ctx context.Context) ([]ledger.Account, error) {
	const query = `SELECT did, balance, stake, escrow FROM zeaz_accounts ORDER BY did`
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list accounts: %w", err)
	}
	defer rows.Close()

	var accounts []ledger.Account
	for rows.Next() {
		var acct ledger.Account
		if err := rows.Scan(&acct.DID, &acct.Balance, &acct.Stake, &acct.Escrow); err != nil {
			return nil, fmt.Errorf("scan account: %w", err)
		}
		accounts = append(accounts, acct)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate accounts: %w", err)
	}
	return accounts, nil
}

func (s *PostgresStore) GetActivePolicy(ctx context.Context) (ledger.Policy, error) {
	const query = `
SELECT min_reputation, min_stake, task_submission_fee, verification_quorum
FROM zeaz_policies WHERE active = true ORDER BY id DESC LIMIT 1`
	row := s.pool.QueryRow(ctx, query)
	var p ledger.Policy
	err := row.Scan(&p.MinReputation, &p.MinStake, &p.TaskSubmissionFee, &p.VerificationQuorum)
	if errors.Is(err, pgx.ErrNoRows) {
		return ledger.DefaultPolicy(), nil
	}
	if err != nil {
		return ledger.Policy{}, fmt.Errorf("get active policy: %w", err)
	}
	return p, nil
}

func (s *PostgresStore) SetActivePolicy(ctx context.Context, p ledger.Policy) error {
	const query = `
INSERT INTO zeaz_policies (min_reputation, min_stake, task_submission_fee, verification_quorum, active)
VALUES ($1, $2, $3, $4, true)`
	_, err := s.pool.Exec(ctx, query, p.MinReputation, p.MinStake, p.TaskSubmissionFee, p.VerificationQuorum)
	if err != nil {
		return fmt.Errorf("set active policy: %w", err)
	}
	return nil
}

func (s *PostgresStore) CreateTask(ctx context.Context, task protocol.Task) error {
	const query = `
INSERT INTO zeaz_tasks (id, requester_org_id, type, budget, max_risk, metadata)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (id) DO NOTHING`
	_, err := s.pool.Exec(ctx, query,
		task.ID, task.RequesterOrgID, task.Type,
		task.Budget, task.MaxRisk, task.Metadata,
	)
	if err != nil {
		return fmt.Errorf("create task: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetTask(ctx context.Context, id string) (protocol.Task, error) {
	const query = `
SELECT id, requester_org_id, type, budget, max_risk, metadata
FROM zeaz_tasks WHERE id = $1`
	row := s.pool.QueryRow(ctx, query, id)
	var task protocol.Task
	err := row.Scan(&task.ID, &task.RequesterOrgID, &task.Type, &task.Budget, &task.MaxRisk, &task.Metadata)
	if errors.Is(err, pgx.ErrNoRows) {
		return protocol.Task{}, ErrNotFound
	}
	if err != nil {
		return protocol.Task{}, fmt.Errorf("get task: %w", err)
	}
	return task, nil
}

func (s *PostgresStore) ListTasks(ctx context.Context) ([]protocol.Task, error) {
	const query = `
SELECT id, requester_org_id, type, budget, max_risk, metadata
FROM zeaz_tasks ORDER BY id`
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list tasks: %w", err)
	}
	defer rows.Close()

	var tasks []protocol.Task
	for rows.Next() {
		var task protocol.Task
		if err := rows.Scan(&task.ID, &task.RequesterOrgID, &task.Type, &task.Budget, &task.MaxRisk, &task.Metadata); err != nil {
			return nil, fmt.Errorf("scan task: %w", err)
		}
		tasks = append(tasks, task)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate tasks: %w", err)
	}
	return tasks, nil
}

func (s *PostgresStore) CreateBid(ctx context.Context, bid protocol.Bid) error {
	const query = `
INSERT INTO zeaz_bids (id, task_id, bidder_org_id, cost, score, risk, metadata)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (id) DO NOTHING`
	_, err := s.pool.Exec(ctx, query,
		bid.ID, bid.TaskID, bid.BidderOrgID,
		bid.Cost, bid.Score, bid.Risk, bid.Metadata,
	)
	if err != nil {
		return fmt.Errorf("create bid: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetBidsForTask(ctx context.Context, taskID string) ([]protocol.Bid, error) {
	const query = `
SELECT id, task_id, bidder_org_id, cost, score, risk, metadata
FROM zeaz_bids WHERE task_id = $1 ORDER BY id`
	rows, err := s.pool.Query(ctx, query, taskID)
	if err != nil {
		return nil, fmt.Errorf("get bids for task: %w", err)
	}
	defer rows.Close()

	var bids []protocol.Bid
	for rows.Next() {
		var bid protocol.Bid
		if err := rows.Scan(&bid.ID, &bid.TaskID, &bid.BidderOrgID, &bid.Cost, &bid.Score, &bid.Risk, &bid.Metadata); err != nil {
			return nil, fmt.Errorf("scan bid: %w", err)
		}
		bids = append(bids, bid)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate bids: %w", err)
	}
	return bids, nil
}

func (s *PostgresStore) UpsertCompletion(ctx context.Context, c protocol.Completion) error {
	const query = `
INSERT INTO zeaz_completions (task_id, bidder_org_id, success, quality_score, result_ref)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (task_id) DO UPDATE SET bidder_org_id = $2, success = $3, quality_score = $4, result_ref = $5`
	_, err := s.pool.Exec(ctx, query, c.TaskID, c.BidderOrgID, c.Success, c.QualityScore, c.ResultRef)
	if err != nil {
		return fmt.Errorf("upsert completion: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetCompletion(ctx context.Context, taskID string) (protocol.Completion, error) {
	const query = `
SELECT task_id, bidder_org_id, success, quality_score, result_ref
FROM zeaz_completions WHERE task_id = $1`
	row := s.pool.QueryRow(ctx, query, taskID)
	var c protocol.Completion
	err := row.Scan(&c.TaskID, &c.BidderOrgID, &c.Success, &c.QualityScore, &c.ResultRef)
	if errors.Is(err, pgx.ErrNoRows) {
		return protocol.Completion{}, ErrNotFound
	}
	if err != nil {
		return protocol.Completion{}, fmt.Errorf("get completion: %w", err)
	}
	return c, nil
}

func (s *PostgresStore) CreateResult(ctx context.Context, result protocol.Result) error {
	const query = `
INSERT INTO zeaz_results (task_id, verifier_org_id, score, valid)
VALUES ($1, $2, $3, $4)`
	_, err := s.pool.Exec(ctx, query, result.TaskID, result.VerifierOrgID, result.Score, result.Valid)
	if err != nil {
		return fmt.Errorf("create result: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetResultsForTask(ctx context.Context, taskID string) ([]protocol.Result, error) {
	const query = `
SELECT task_id, verifier_org_id, score, valid
FROM zeaz_results WHERE task_id = $1 ORDER BY verifier_org_id`
	rows, err := s.pool.Query(ctx, query, taskID)
	if err != nil {
		return nil, fmt.Errorf("get results for task: %w", err)
	}
	defer rows.Close()

	var results []protocol.Result
	for rows.Next() {
		var r protocol.Result
		if err := rows.Scan(&r.TaskID, &r.VerifierOrgID, &r.Score, &r.Valid); err != nil {
			return nil, fmt.Errorf("scan result: %w", err)
		}
		results = append(results, r)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate results: %w", err)
	}
	return results, nil
}

func (s *PostgresStore) UpsertReputation(ctx context.Context, rep ledger.Reputation) error {
	const query = `
INSERT INTO zeaz_reputation (org_id, score, completed_tasks, failed_tasks, revenue_credits, updated_at)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (org_id) DO UPDATE SET
	score = $2, completed_tasks = $3, failed_tasks = $4, revenue_credits = $5, updated_at = $6`
	_, err := s.pool.Exec(ctx, query,
		rep.OrgID, rep.Score, rep.CompletedTasks,
		rep.FailedTasks, rep.RevenueCredits, rep.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("upsert reputation: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetReputation(ctx context.Context, orgID string) (ledger.Reputation, error) {
	const query = `
SELECT org_id, score, completed_tasks, failed_tasks, revenue_credits, updated_at
FROM zeaz_reputation WHERE org_id = $1`
	row := s.pool.QueryRow(ctx, query, orgID)
	var rep ledger.Reputation
	err := row.Scan(&rep.OrgID, &rep.Score, &rep.CompletedTasks, &rep.FailedTasks, &rep.RevenueCredits, &rep.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return ledger.Reputation{}, ErrNotFound
	}
	if err != nil {
		return ledger.Reputation{}, fmt.Errorf("get reputation: %w", err)
	}
	return rep, nil
}

func (s *PostgresStore) ListReputations(ctx context.Context) (map[string]ledger.Reputation, error) {
	const query = `
SELECT org_id, score, completed_tasks, failed_tasks, revenue_credits, updated_at
FROM zeaz_reputation ORDER BY org_id`
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list reputations: %w", err)
	}
	defer rows.Close()

	reps := make(map[string]ledger.Reputation)
	for rows.Next() {
		var rep ledger.Reputation
		if err := rows.Scan(&rep.OrgID, &rep.Score, &rep.CompletedTasks, &rep.FailedTasks, &rep.RevenueCredits, &rep.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan reputation: %w", err)
		}
		reps[rep.OrgID] = rep
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate reputations: %w", err)
	}
	return reps, nil
}

func (s *PostgresStore) IsSettled(ctx context.Context, taskID string) (bool, error) {
	const query = `SELECT EXISTS(SELECT 1 FROM zeaz_settled_tasks WHERE task_id = $1)`
	var settled bool
	err := s.pool.QueryRow(ctx, query, taskID).Scan(&settled)
	if err != nil {
		return false, fmt.Errorf("is settled: %w", err)
	}
	return settled, nil
}

func (s *PostgresStore) MarkSettled(ctx context.Context, taskID string) error {
	const query = `INSERT INTO zeaz_settled_tasks (task_id) VALUES ($1) ON CONFLICT DO NOTHING`
	_, err := s.pool.Exec(ctx, query, taskID)
	if err != nil {
		return fmt.Errorf("mark settled: %w", err)
	}
	return nil
}

func (s *PostgresStore) AppendRecord(ctx context.Context, rec ledger.Record) error {
	const query = `
INSERT INTO zeaz_records (height, type, envelope_id, envelope_hash, previous_hash, hash, at, metadata)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (height) DO NOTHING`
	_, err := s.pool.Exec(ctx, query,
		int64(rec.Height), rec.Type, rec.EnvelopeID,
		rec.EnvelopeHash, rec.PreviousHash, rec.Hash,
		rec.At, rec.Metadata,
	)
	if err != nil {
		return fmt.Errorf("append record: %w", err)
	}
	return nil
}

func (s *PostgresStore) GetRecords(ctx context.Context) ([]ledger.Record, error) {
	const query = `
SELECT height, type, envelope_id, envelope_hash, previous_hash, hash, at, metadata
FROM zeaz_records ORDER BY height ASC`
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("get records: %w", err)
	}
	defer rows.Close()

	var records []ledger.Record
	for rows.Next() {
		var rec ledger.Record
		var height int64
		if err := rows.Scan(
			&height, &rec.Type, &rec.EnvelopeID,
			&rec.EnvelopeHash, &rec.PreviousHash, &rec.Hash,
			&rec.At, &rec.Metadata,
		); err != nil {
			return nil, fmt.Errorf("scan record: %w", err)
		}
		rec.Height = uint64(height)
		records = append(records, rec)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate records: %w", err)
	}
	return records, nil
}

func (s *PostgresStore) GetRecordByHeight(ctx context.Context, height uint64) (ledger.Record, error) {
	const query = `
SELECT height, type, envelope_id, envelope_hash, previous_hash, hash, at, metadata
FROM zeaz_records WHERE height = $1`
	var rec ledger.Record
	var h int64
	err := s.pool.QueryRow(ctx, query, int64(height)).Scan(
		&h, &rec.Type, &rec.EnvelopeID,
		&rec.EnvelopeHash, &rec.PreviousHash, &rec.Hash,
		&rec.At, &rec.Metadata,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return ledger.Record{}, ErrNotFound
	}
	if err != nil {
		return ledger.Record{}, fmt.Errorf("get record by height: %w", err)
	}
	rec.Height = uint64(h)
	return rec, nil
}

func (s *PostgresStore) GetHeadHash(ctx context.Context) (string, error) {
	const query = `SELECT head_hash, height FROM zeaz_head_state LIMIT 1`
	var hash string
	var height int64
	err := s.pool.QueryRow(ctx, query).Scan(&hash, &height)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", nil
	}
	if err != nil {
		return "", fmt.Errorf("get head hash: %w", err)
	}
	return hash, nil
}

func (s *PostgresStore) SetHeadHash(ctx context.Context, hash string, height uint64) error {
	const query = `
INSERT INTO zeaz_head_state (locked, head_hash, height) VALUES (true, $1, $2)
ON CONFLICT (locked) DO UPDATE SET head_hash = $1, height = $2`
	_, err := s.pool.Exec(ctx, query, hash, int64(height))
	if err != nil {
		return fmt.Errorf("set head hash: %w", err)
	}
	return nil
}
