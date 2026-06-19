-- ZEAZ Blockchain Persistence Layer Schema

CREATE TABLE IF NOT EXISTS zeaz_orgs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    public_key BYTEA,
    active BOOLEAN NOT NULL DEFAULT true,
    balance DOUBLE PRECISION NOT NULL DEFAULT 0,
    stake DOUBLE PRECISION NOT NULL DEFAULT 0,
    initial_reputation DOUBLE PRECISION NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS zeaz_accounts (
    did TEXT PRIMARY KEY,
    balance DOUBLE PRECISION NOT NULL DEFAULT 0,
    stake DOUBLE PRECISION NOT NULL DEFAULT 0,
    escrow DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS zeaz_policies (
    id SERIAL PRIMARY KEY,
    min_reputation DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    min_stake DOUBLE PRECISION NOT NULL DEFAULT 0,
    task_submission_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
    verification_quorum INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zeaz_tasks (
    id TEXT PRIMARY KEY,
    requester_org_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT '',
    budget DOUBLE PRECISION NOT NULL,
    max_risk DOUBLE PRECISION NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS zeaz_bids (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES zeaz_tasks(id),
    bidder_org_id TEXT NOT NULL,
    cost DOUBLE PRECISION NOT NULL,
    score DOUBLE PRECISION NOT NULL DEFAULT 0,
    risk DOUBLE PRECISION NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_zeaz_bids_task_id ON zeaz_bids(task_id);

CREATE TABLE IF NOT EXISTS zeaz_completions (
    task_id TEXT PRIMARY KEY REFERENCES zeaz_tasks(id),
    bidder_org_id TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    quality_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    result_ref TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS zeaz_results (
    id BIGSERIAL PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES zeaz_tasks(id),
    verifier_org_id TEXT NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    valid BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_zeaz_results_task_id ON zeaz_results(task_id);

CREATE TABLE IF NOT EXISTS zeaz_reputation (
    org_id TEXT PRIMARY KEY,
    score DOUBLE PRECISION NOT NULL DEFAULT 1,
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    failed_tasks INTEGER NOT NULL DEFAULT 0,
    revenue_credits DOUBLE PRECISION NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zeaz_settled_tasks (
    task_id TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS zeaz_records (
    height BIGINT PRIMARY KEY,
    type TEXT NOT NULL,
    envelope_id TEXT NOT NULL,
    envelope_hash TEXT NOT NULL,
    previous_hash TEXT NOT NULL DEFAULT '',
    hash TEXT NOT NULL UNIQUE,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS zeaz_head_state (
    locked BOOLEAN PRIMARY KEY DEFAULT true,
    head_hash TEXT NOT NULL DEFAULT '',
    height BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS zeaz_envelopes (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    version_major INTEGER NOT NULL,
    version_minor INTEGER NOT NULL,
    version_patch INTEGER NOT NULL,
    issuer TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ,
    nonce TEXT NOT NULL,
    payload JSONB NOT NULL,
    signature_algorithm TEXT NOT NULL,
    signature_key_id TEXT NOT NULL,
    signature_value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS zeaz_consensus_validators (
    id TEXT PRIMARY KEY,
    power BIGINT NOT NULL DEFAULT 0,
    public_key BYTEA,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS zeaz_consensus_votes (
    id BIGSERIAL PRIMARY KEY,
    height BIGINT NOT NULL,
    round BIGINT NOT NULL,
    phase TEXT NOT NULL,
    block_hash TEXT NOT NULL,
    validator_id TEXT NOT NULL,
    signature BYTEA,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (height, round, phase, validator_id)
);

CREATE INDEX IF NOT EXISTS idx_zeaz_consensus_votes_lookup ON zeaz_consensus_votes(height, round, phase);

CREATE TABLE IF NOT EXISTS zeaz_commits (
    height BIGINT PRIMARY KEY,
    round BIGINT NOT NULL,
    proposer_id TEXT NOT NULL,
    parent_hash TEXT NOT NULL DEFAULT '',
    payload_hash TEXT NOT NULL DEFAULT '',
    timestamp TIMESTAMPTZ NOT NULL,
    qc_algorithm TEXT NOT NULL,
    qc_height BIGINT NOT NULL,
    qc_round BIGINT NOT NULL,
    qc_phase TEXT NOT NULL,
    qc_block_hash TEXT NOT NULL,
    qc_power BIGINT NOT NULL DEFAULT 0,
    qc_total BIGINT NOT NULL DEFAULT 0,
    qc_voters JSONB DEFAULT '[]'::jsonb,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zeaz_staking_validators (
    id TEXT PRIMARY KEY,
    operator_address TEXT NOT NULL DEFAULT '',
    consensus_key TEXT NOT NULL DEFAULT '',
    stake BIGINT NOT NULL DEFAULT 0,
    delegated_stake BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'unbonded',
    jailed_until TIMESTAMPTZ,
    slash_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS zeaz_staking_events (
    seq BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    validator_id TEXT NOT NULL,
    amount BIGINT NOT NULL DEFAULT 0,
    reason TEXT NOT NULL DEFAULT '',
    at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zeaz_staking_events_seq ON zeaz_staking_events(seq);

CREATE TABLE IF NOT EXISTS zeaz_settlement_receipts (
    id TEXT PRIMARY KEY,
    height BIGINT NOT NULL,
    state_root TEXT NOT NULL,
    transfer_root TEXT NOT NULL,
    transfers JSONB NOT NULL DEFAULT '[]'::jsonb,
    settlement_hash TEXT NOT NULL,
    signer_id TEXT NOT NULL,
    signature BYTEA,
    settled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zeaz_settlement_receipts_height ON zeaz_settlement_receipts(height);

CREATE TABLE IF NOT EXISTS zeaz_wasm_modules (
    id TEXT PRIMARY KEY,
    code_hash TEXT NOT NULL,
    abi TEXT NOT NULL,
    max_fuel BIGINT NOT NULL DEFAULT 10000000,
    permissions JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS zeaz_peers (
    node_id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    public_key TEXT NOT NULL DEFAULT '',
    seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zeaz_peers_seen_at ON zeaz_peers(seen_at);
