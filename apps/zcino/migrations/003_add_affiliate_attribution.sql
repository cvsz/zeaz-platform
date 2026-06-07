ALTER TABLE tracking_events
    ADD COLUMN IF NOT EXISTS affiliate_id TEXT CHECK (affiliate_id IS NULL OR length(affiliate_id) <= 128),
    ADD COLUMN IF NOT EXISTS campaign_id TEXT CHECK (campaign_id IS NULL OR length(campaign_id) <= 128),
    ADD COLUMN IF NOT EXISTS country CHAR(2) CHECK (country IS NULL OR country ~ '^[A-Z]{2}$'),
    ADD COLUMN IF NOT EXISTS referrer_url TEXT CHECK (referrer_url IS NULL OR length(referrer_url) <= 2048);

CREATE INDEX IF NOT EXISTS idx_tracking_events_affiliate_occurred_at ON tracking_events (affiliate_id, occurred_at DESC) WHERE affiliate_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tracking_events_campaign_occurred_at ON tracking_events (campaign_id, occurred_at DESC) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tracking_events_country_occurred_at ON tracking_events (country, occurred_at DESC) WHERE country IS NOT NULL;

CREATE OR REPLACE VIEW affiliate_clicks AS
SELECT
    id,
    game_id,
    user_id,
    affiliate_id,
    campaign_id,
    country,
    referrer_url,
    occurred_at,
    received_at,
    metadata
FROM tracking_events
WHERE event_type = 'click';
