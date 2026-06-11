# ZEAZ Platform Deep Dive Report

Generated: 2026-06-09 UTC

## Scope

Read-only audit of `/home/zeazdev/zeaz-platform` before platform refactor mutations. The audit inspected top-level repository files, `apps/`, Docker Compose files, Cloudflare tunnel/Wrangler configs, `.env.example` templates, README files, package manifests, and framework hints.

## Repository Inventory

- Root Compose entrypoint: `docker-compose.yml` includes `infra/traefik`, `infra/cloudflare`, `infra/authentik`, `infra/observability`, `infra/ai-runtime`, and `infra/security` compose fragments.
- Existing Cloudflare configs: `infra/cloudflare/config.yml`, `tunnels/config/config.yml`, `tunnels/config.yaml`, and root `wrangler.toml`.
- Existing validation/security scripts: `scripts/validate.sh`, `scripts/validate-yaml.py`, `scripts/validate-env-files.py`, `scripts/secret-scan-tracked.sh`, `scripts/security-scan.sh`, and others.
- Existing app directories under `apps/`: `ABTPi18n`, `api`, `openwork`, `web`, `zAcademy`, `zLinebot`, `zcino`, `zcino-modern`, `zdash`, `zkbtrader`, `zlms`, `zoffice`, `zsp-aitool`, `zsticker`, `ztrader`, `zveo`, and `zwallet`.

## Canonical App Inventory

| App | Path | Framework / Runtime Detected | Start Command | Build Command | Canonical Port | Domain | Env Template | DB Usage Signals | Docker Service Signals | Health Endpoint |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| openwork | `apps/openwork` | pnpm monorepo, Electron/Next-like web workspaces | `pnpm dev` / filtered scripts | `pnpm build` | 4101 | `zow.zeaz.dev` | not found at app root | MySQL defaults in dev scripts; needs DATABASE_URL review before PostgreSQL cutover | packaging compose files | `/` fallback |
| api | `apps/api` | Python FastAPI-style (`main.py`, requirements) | `uvicorn main:app --host 0.0.0.0 --port ${PORT}` | none detected | 4102 | `api-zcfdash.zeaz.dev` | not found | Python app requires inspection; PostgreSQL env to be standardized | no root service found | `/health` expected |
| web | `apps/web` | Next.js | `npm run dev -- --port ${PORT}` or `next start -p ${PORT}` | `npm run build` | 4103 | `zcfdash.zeaz.dev` | not found | frontend only; API-backed | no root service found | `/` fallback |
| zoffice | `apps/zoffice` | Python app plus website Dockerfile | app server via Python/Docker | Docker build | 4104 | `zoffice.zeaz.dev` | `apps/zoffice/.env.example` | likely app persistence via external services | `apps/zoffice/docker-compose.yml` | `/health` expected |
| zwallet | `apps/zwallet` | pnpm/TypeScript monorepo plus Python API | app-specific scripts | typecheck/lint | 4105 | `app.zeaz.dev` | `apps/zwallet/.env.example` | PostgreSQL/Kubernetes manifests detected | `apps/zwallet/docker-compose.yml` | `/health` expected |
| ztrader | `apps/ztrader` | Next.js frontend + Python backend | compose/app-specific | frontend build | 4106 | `ztrader.zeaz.dev` | `apps/ztrader/.env.example` | backend persistence signals need migration validation | `apps/ztrader/docker-compose.yml` | `/health` expected |
| zdash | `apps/zdash` | Vite frontend + Python backend | compose/app-specific | frontend build | 4107 | `dash.zeaz.dev` | `apps/zdash/.env.example` | PostgreSQL/K8s manifests and DATABASE_URL signals | `apps/zdash/docker-compose.yml` | `/health` expected |
| zsp-aitool | `apps/zsp-aitool` | no package/config detected in shallow scan | not detected | not detected | 4108 | `zaiz.zeaz.dev` | not found | unknown | none detected | `/` fallback |
| zveo | `apps/zveo` | no package/config detected in shallow scan | not detected | not detected | 4109 | `zveo.zeaz.dev` | not found | unknown | none detected | `/` fallback |
| zsticker | `apps/zsticker` | Python app (`main.py`) | `python3 main.py` with `PORT` | none detected | 4110 | `zsticker.zeaz.dev` | `apps/zsticker/.env.example` | app-specific persistence review required | `apps/zsticker/docker-compose.yml` | `/health` expected |
| zcino | `apps/zcino` | PHP legacy app + Go service + Next.js frontend | Docker/Next/PHP-specific | frontend `npm run build` | 4111 | `zcino.zeaz.dev` | not found | MySQL/PHP legacy SQL; modern migrations present | `apps/zcino/infra/docker-compose.yml` | `/health` expected |
| zlms | `apps/zlms` | Next.js/TypeScript migration tooling | app-specific | typecheck/migration scripts | 4112 | `zlms.zeaz.dev` | not found | frontend/runtime migration only in shallow scan | no root service found | `/` fallback |
| zLinebot | `apps/zLinebot` | empty canonical directory detected | to be created | to be created | 4113 | internal bot service | not found | LINE webhook persistence to standardize | none detected | `/health` required |

## Non-Canonical / Adjacent App Inventory

| App | Path | Notes |
| --- | --- | --- |
| zcino-modern | `apps/zcino-modern` | Source for consolidation into canonical `apps/zcino`; structure closely mirrors modern files already present in `apps/zcino`. |
| ABTPi18n | `apps/ABTPi18n` | pnpm/Python/Prisma monorepo not in canonical map. |
| zAcademy | `apps/zAcademy` | Minimal package manifest; not in canonical map. |
| zkbtrader | `apps/zkbtrader` | Security/trading app with Docker/pyproject; not in supplied canonical map. |

## Framework and Tooling Signals

- Next.js: `apps/web`, `apps/ztrader/frontend`, `apps/zcino/frontend`, `apps/zcino-modern/frontend`, `apps/zlms`.
- Vite: `apps/zdash/frontend`.
- Python/FastAPI-style: `apps/api`, `apps/zoffice/app`, `apps/zsticker`, `apps/zdash/backend`, `apps/ztrader/backend`, `apps/zwallet/api`.
- Go: `apps/zcino`, `apps/zcino-modern`.
- PHP legacy: `apps/zcino`.
- Docker Compose: root and multiple app/infra compose files.
- Cloudflare tunnel/Wrangler: root tunnel configs and Worker configs present.

## Initial Risk Findings

1. Root `.env.example` contains legacy placeholder names (`DB_PASS`, `PG_PASS`, etc.) that should be standardized to `POSTGRES_*` and `DATABASE_URL` placeholders.
2. Existing Cloudflare tunnel configs include wildcard and internal-origin patterns that conflict with the requested canonical localhost-port routing; changes must remain token-free and manually applied.
3. Existing root compose delegates to several infra fragments; canonical Postgres/Redis app support should avoid destroying existing volumes.
4. `apps/zLinebot` exists but no source files were detected in the initial shallow scan, and the named source bot directories were not found. Consolidation should create a safe canonical scaffold and document missing sources rather than inventing bot secrets or behavior.
5. `apps/zcino` already appears to include many files also present under `apps/zcino-modern`; merge should be conservative and source-preserving.

## First Commit Plan

1. Create a safety checkpoint and backup selected config files under `.backups/<timestamp>/`.
2. Add idempotent operational scripts for secure local env generation, Postgres checks, port inventory/conflict checks, Docker cleanup, Cloudflare config checks, app lifecycle helpers, proxy validation, and verification.
3. Normalize root `.env.example`, root `docker-compose.yml`, Cloudflare tunnel config, and reverse proxy config without committing secrets.
4. Add reports documenting each requested phase, limitations, and manual actions.
5. Run offline validation and commit changes on the current branch.
