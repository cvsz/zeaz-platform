# Cloudflare Control Panel — FREE NO COST Edition

This document expands `zeaz-platform` with a zero-cost Cloudflare control-panel architecture for `zeaz.dev`.

The design intentionally avoids paid Cloudflare add-ons, paid SaaS dependencies, managed databases, and billing-triggering automation. It is intended for one self-hosted Ubuntu VM, Docker Compose, SQLite or local Postgres, and Cloudflare Free-compatible DNS, Tunnel, and Zero Trust Access workflows.

## Hard rule

```bash
COST_LOCK=true
ALLOW_PAID_CLOUDFLARE_FEATURES=false
```

When `COST_LOCK=true`, the platform must block paid-capable automation by default. Operators may still document paid features, but code must not enable or provision them unless the repository owner explicitly disables the lock and approves the change.

## Free scope

Included modules:

- Dashboard: zone status, DNS health, tunnel health, token verification, cloudflared connector status, Docker/VM health, and audit summary.
- DNS Manager: list/create/update/delete DNS records, proxied toggle, diff desired state, export backup, import dry-run.
- Tunnel Manager: list/create tunnels, fetch tunnel token, route DNS, render `cloudflared` config, render systemd service, run local diagnostics.
- Free Zero Trust Access Manager: protect `panel.zeaz.dev`, `api.zeaz.dev`, and selected internal apps using free-compatible Access policies.
- Local Service Router: map `*.zeaz.dev` hostnames to local Docker services behind Cloudflare Tunnel.
- Token Vault: encrypted token storage, permission verification, fingerprinting, no frontend token reveal.
- Backup: local JSON/YAML export of DNS, tunnel config, ingress routes, and Access metadata.
- Audit: all writes generate actor, action, resource, before/after, IP, request ID, and timestamp.
- RBAC: `owner`, `admin`, `devops`, `security`, and `viewer`.

Excluded by default:

- Cloudflare Load Balancing
- Argo Smart Routing
- advanced paid WAF modules
- paid Bot Management
- paid Logpush destinations
- Stream
- Images paid workflows
- R2 write-heavy or overage-prone workflows
- Workers paid/subrequest-heavy workflows
- Spectrum
- Waiting Room
- Page Shield paid features
- Enterprise-only APIs

## Recommended free stack

Backend:

- Python 3.12
- FastAPI
- SQLite default
- SQLAlchemy
- Alembic
- httpx
- cryptography
- PyJWT
- structlog

Frontend:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Recharts
- Lucide icons

Runtime:

- Ubuntu 24.04
- Docker CE
- Docker Compose
- cloudflared
- systemd

Optional free/local services:

- PostgreSQL container
- Redis container
- Grafana OSS
- Prometheus OSS

## Target hostnames

| Hostname | Local service | Notes |
|---|---|---|
| `panel.zeaz.dev` | `http://zcf-web:3000` | main dashboard |
| `api.zeaz.dev` | `http://zcf-api:8000` | FastAPI backend |
| `ssh.zeaz.dev` | `ssh://localhost:22022` | private SSH through tunnel |
| `grafana.zeaz.dev` | `http://grafana:3000` | optional local observability |
| `n8n.zeaz.dev` | `http://n8n:5678` | optional local automation |
| `*.zeaz.dev` | `http://zcf-web:3000` | fallback route |

## Cost lock behavior

The application must include a central policy guard before every Cloudflare write call.

Blocked when `COST_LOCK=true`:

- create/update Load Balancer resources
- enable Argo features
- configure paid Bot Management features
- enable paid Logpush sinks
- write to R2 unless `ALLOW_R2_WRITE=true`
- deploy Workers unless `ALLOW_WORKERS_DEPLOY=true`
- enable advanced WAF templates unless `ALLOW_ADVANCED_WAF=true`
- configure paid analytics/export products

Allowed when `COST_LOCK=true`:

- read accounts/zones
- read/list DNS
- create/update/delete standard DNS records with confirmation
- create/list/delete tunnels with confirmation
- route DNS to tunnels
- render local config files
- manage free-compatible Access apps/policies
- export local backups

## API endpoints

```text
GET    /health
POST   /api/auth/login
GET    /api/auth/me
GET    /api/dashboard/summary
GET    /api/settings/cost-lock
PATCH  /api/settings/cost-lock
POST   /api/tokens
GET    /api/tokens
POST   /api/tokens/{id}/verify
GET    /api/cloudflare/accounts
GET    /api/cloudflare/zones
GET    /api/dns/records
POST   /api/dns/records
PATCH  /api/dns/records/{record_id}
DELETE /api/dns/records/{record_id}
POST   /api/dns/diff
POST   /api/dns/export
POST   /api/dns/import-dry-run
GET    /api/tunnels
POST   /api/tunnels
POST   /api/tunnels/{tunnel_id}/token
POST   /api/tunnels/{tunnel_id}/route-dns
POST   /api/tunnels/{tunnel_id}/generate-config
POST   /api/access/apps
GET    /api/access/apps
POST   /api/backups/export
GET    /api/audit/logs
```

## UI pages

- Dashboard
- DNS
- Tunnels
- Access
- Tokens
- Backups
- Audit
- Settings

## Environment defaults

```bash
APP_NAME=zcf-control-free
APP_ENV=production
APP_URL=https://panel.zeaz.dev
API_URL=https://api.zeaz.dev

COST_LOCK=true
ALLOW_PAID_CLOUDFLARE_FEATURES=false
ALLOW_R2_WRITE=false
ALLOW_WORKERS_DEPLOY=false
ALLOW_LOAD_BALANCING=false
ALLOW_ADVANCED_WAF=false
ALLOW_LOGPUSH=false

DATABASE_URL=sqlite:////data/zcf-control.db
JWT_SECRET=change_me_long_random
TOKEN_ENCRYPTION_KEY=change_me_long_random

CLOUDFLARE_DEFAULT_ZONE_NAME=zeaz.dev
CLOUDFLARE_DEFAULT_ACCOUNT_ID=
CLOUDFLARE_DEFAULT_ZONE_ID=

CLOUDFLARED_METRICS=127.0.0.1:20241
LOG_LEVEL=info
```

## Build phases

| Phase | Goal | Output |
|---|---|---|
| FREE-01 | Repo skeleton | FastAPI, Vite, Docker Compose, SQLite, healthcheck |
| FREE-02 | Auth/RBAC/audit | JWT auth, roles, audit middleware |
| FREE-03 | Cost lock | central policy gate + tests |
| FREE-04 | Token vault | encrypted tokens + verify flow |
| FREE-05 | DNS manager | CRUD, diff, backup, dry-run restore |
| FREE-06 | Tunnel manager | list/create/token/config generator |
| FREE-07 | Ingress router | `*.zeaz.dev` service mapping |
| FREE-08 | Free Access manager | Access apps/policies with plan guard |
| FREE-09 | UI finish | dashboard pages + status cards |
| FREE-10 | Release | install script, docs, tests, CI |

## Acceptance criteria

- Runs locally with Docker Compose.
- Does not require paid Cloudflare products.
- Does not require paid SaaS.
- Does not require managed database.
- Does not log secrets.
- Does not return token values to frontend after save.
- All writes are RBAC-protected.
- All destructive actions require dry-run and typed confirmation.
- All write actions create audit log rows.
- `COST_LOCK=true` blocks paid-capable workflows.
