CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID PRIMARY KEY,
    tenant_id TEXT NOT NULL DEFAULT 'public' CHECK (length(tenant_id) <= 100),
    event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
    game_id UUID NOT NULL REFERENCES games(id),
    session_id TEXT NOT NULL CHECK (length(session_id) <= 128),
    user_id TEXT CHECK (user_id IS NULL OR length(user_id) <= 128),
    provider TEXT CHECK (provider IS NULL OR length(provider) <= 100),
    country TEXT CHECK (country IS NULL OR length(country) = 2),
    placement TEXT CHECK (placement IS NULL OR length(placement) <= 100),
    click_target TEXT CHECK (click_target IS NULL OR length(click_target) <= 100),
    session_duration_ms BIGINT CHECK (session_duration_ms IS NULL OR session_duration_ms >= 0),
    occurred_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (event_type = 'click' OR click_target IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_tenant_occurred_at ON tracking_events (tenant_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_events_type_occurred_at ON tracking_events (event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_events_game_occurred_at ON tracking_events (game_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_events_session_occurred_at ON tracking_events (session_id, occurred_at DESC);
