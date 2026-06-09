# Docker Compose Refactor Report

Generated: 2026-06-09 UTC

## Completed

- Updated root `docker-compose.yml` to retain existing infra includes while adding canonical `postgres` and `redis` services.
- Added named volumes `postgres_data` and `redis_data`.
- Added healthchecks for both services.
- Exposed Postgres and Redis on loopback only.
- Kept destructive volume operations out of all scripts.

## Validation

Run:

```bash
docker compose --env-file <(scripts/env/generate-local-env.sh --file /tmp/zeaz.env >/dev/null; cat /tmp/zeaz.env) config
```

or create a local `.env` with `scripts/env/generate-local-env.sh` and run:

```bash
docker compose config
```
