# PostgreSQL Refactor Report

Generated: 2026-06-09 UTC

## Completed

- Standardized root environment template around `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`, and `REDIS_URL`.
- Added root `postgres` service with healthcheck and named `postgres_data` volume in `docker-compose.yml`.
- Added root `redis` service with healthcheck and named `redis_data` volume in `docker-compose.yml`.
- Added `scripts/db/generate-secure-db-password.sh` for cryptographically random local password generation.
- Added `scripts/db/check-postgres.sh` for local/offline Postgres health checks.
- Added `scripts/db/migrate-all.sh` for conservative migration discovery. It defaults to dry-run unless `CONFIRM_MIGRATE=yes` is set.
- Added `scripts/env/generate-local-env.sh` to create or complete a gitignored `.env` while preserving existing values and never printing secrets.

## Persistence Findings

- Existing signals include Prisma in `apps/ABTPi18n`, PostgreSQL/Kubernetes manifests in `apps/zdash` and `apps/zwallet`, legacy MySQL/PHP in `apps/zcino`, MySQL dev defaults in `apps/openwork`, and Python backends in `apps/api`, `apps/zoffice`, `apps/ztrader`, and `apps/zsticker`.
- Durable application migration should be app-by-app because several apps are imported upstream projects with their own storage assumptions.

## Security Notes

- No database password was committed.
- The tracked `.env.example` uses non-production example placeholders only.
- Generated local `.env` files are already ignored by `.gitignore`.
