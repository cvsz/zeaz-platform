# Environment Standardization Report

Generated: 2026-06-09 UTC

## Completed

- Rebuilt root `.env.example` around canonical app, PostgreSQL, Redis, Cloudflare, identity, safety, and LINE bot variables.
- Added `apps/zLinebot/.env.example`.
- Added `scripts/env/generate-local-env.sh` to generate missing local values without overwriting or printing existing secrets.

## Secret Handling

- Real values belong in `.env`, app-local `.env`, GitHub secrets, or another approved secret store.
- Tracked templates intentionally contain blank values or clearly marked non-production examples.
