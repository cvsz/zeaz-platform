CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
    CREATE TYPE game_volatility AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (char_length(trim(name)) > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id),
    name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
    provider TEXT NOT NULL CHECK (char_length(trim(provider)) > 0),
    category TEXT NOT NULL CHECK (char_length(trim(category)) > 0),
    rtp NUMERIC(5,2) NOT NULL CHECK (rtp >= 0 AND rtp <= 100),
    volatility game_volatility NOT NULL,
    thumbnail_url TEXT NOT NULL CHECK (thumbnail_url ~* '^https?://'),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_active_provider_name ON games (is_active, provider, name);
CREATE INDEX IF NOT EXISTS idx_games_provider_id ON games (provider_id);
CREATE INDEX IF NOT EXISTS idx_games_active_category ON games (is_active, category);
CREATE INDEX IF NOT EXISTS idx_games_active_rtp ON games (is_active, rtp);
CREATE INDEX IF NOT EXISTS idx_providers_active_name ON providers (is_active, name);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_games_updated_at ON games;
CREATE TRIGGER trg_games_updated_at
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_providers_updated_at ON providers;
CREATE TRIGGER trg_providers_updated_at
BEFORE UPDATE ON providers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO providers (id, name, is_active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Acme Gaming', TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'TableWorks', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO games (id, provider_id, name, provider, category, rtp, volatility, thumbnail_url, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Golden Spins', 'Acme Gaming', 'slots', 96.50, 'medium', 'https://cdn.example.com/games/golden-spins.png', TRUE),
('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Roulette Royale', 'TableWorks', 'roulette', 97.30, 'low', 'https://cdn.example.com/games/roulette-royale.png', TRUE),
('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dragon Fortune', 'Acme Gaming', 'slots', 95.10, 'high', 'https://cdn.example.com/games/dragon-fortune.png', TRUE)
ON CONFLICT (id) DO NOTHING;
