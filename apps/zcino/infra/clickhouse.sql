CREATE DATABASE IF NOT EXISTS zeaz;

CREATE TABLE IF NOT EXISTS zeaz.tracking_events
(
    event_id UUID,
    event_type LowCardinality(String),
    tenant_id String,
    session_id String,
    user_id String,
    game_id UUID,
    provider LowCardinality(String),
    placement LowCardinality(String),
    country FixedString(2),
    affiliate_id String,
    campaign_id String,
    metadata String,
    occurred_at DateTime64(3, 'UTC'),
    received_at DateTime64(3, 'UTC') DEFAULT now64(3)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(occurred_at)
ORDER BY (tenant_id, event_type, occurred_at, game_id)
TTL occurred_at + INTERVAL 730 DAY DELETE
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS zeaz.provider_snapshots
(
    snapshot_id UUID,
    tenant_id String,
    provider LowCardinality(String),
    external_id String,
    game_id UUID,
    name String,
    category LowCardinality(String),
    rtp Float64,
    volatility LowCardinality(String),
    active UInt8,
    integrity_hash String,
    fetched_at DateTime64(3, 'UTC')
)
ENGINE = ReplacingMergeTree(fetched_at)
PARTITION BY toYYYYMM(fetched_at)
ORDER BY (tenant_id, provider, external_id);

CREATE TABLE IF NOT EXISTS zeaz.protocol_envelopes
(
    envelope_id String,
    tenant_id String,
    issuer String,
    kind LowCardinality(String),
    height UInt64,
    hash String,
    previous_hash String,
    payload_size UInt32,
    accepted UInt8,
    reason String,
    observed_at DateTime64(3, 'UTC') DEFAULT now64(3)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(observed_at)
ORDER BY (tenant_id, height, kind, observed_at);

CREATE TABLE IF NOT EXISTS zeaz.node_metrics
(
    node_id String,
    region LowCardinality(String),
    peers UInt32,
    mempool_depth UInt64,
    nats_pending UInt64,
    cpu_utilization Float64,
    memory_utilization Float64,
    observed_at DateTime64(3, 'UTC') DEFAULT now64(3)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(observed_at)
ORDER BY (node_id, observed_at)
TTL observed_at + INTERVAL 180 DAY DELETE;

CREATE MATERIALIZED VIEW IF NOT EXISTS zeaz.tracking_events_hourly
ENGINE = SummingMergeTree
PARTITION BY toYYYYMM(bucket)
ORDER BY (tenant_id, event_type, provider, bucket)
AS
SELECT
    tenant_id,
    event_type,
    provider,
    toStartOfHour(occurred_at) AS bucket,
    count() AS events
FROM zeaz.tracking_events
GROUP BY tenant_id, event_type, provider, bucket;
