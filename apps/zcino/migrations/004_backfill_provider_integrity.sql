CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (char_length(trim(name)) > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO providers (name, is_active)
SELECT DISTINCT provider, TRUE
FROM games
WHERE provider IS NOT NULL AND char_length(trim(provider)) > 0
ON CONFLICT (name) DO NOTHING;

ALTER TABLE games ADD COLUMN IF NOT EXISTS provider_id UUID;

UPDATE games g
SET provider_id = p.id
FROM providers p
WHERE g.provider_id IS NULL AND g.provider = p.name;

ALTER TABLE games ALTER COLUMN provider_id SET NOT NULL;

DO $$ BEGIN
    ALTER TABLE games
        ADD CONSTRAINT games_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES providers(id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_games_provider_id ON games (provider_id);
CREATE INDEX IF NOT EXISTS idx_providers_active_name ON providers (is_active, name);
