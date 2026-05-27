# Codex Prompt — Cloudflare Control Panel FREE NO COST Edition

Use this prompt to implement the free Cloudflare control panel inside `cvsz/zeaz-platform`.

```text
You are Codex Cloud acting as a senior full-stack platform engineer.

Repository:
- cvsz/zeaz-platform

Project:
- ZeaZ Cloudflare Control Panel FREE NO COST Edition

Primary domain:
- zeaz.dev

Required hostnames:
- panel.zeaz.dev
- api.zeaz.dev
- ssh.zeaz.dev
- grafana.zeaz.dev optional
- n8n.zeaz.dev optional
- *.zeaz.dev fallback

Mission:
Build a self-hosted, zero-monthly-cost Cloudflare control panel that manages Cloudflare Free-compatible DNS, Tunnel, Access, tokens, backups, and audit logs without enabling paid features by accident.

Absolute constraints:
1. No paid Cloudflare features by default.
2. No paid SaaS dependencies.
3. No managed database requirement.
4. No hardcoded secrets.
5. No token logging.
6. No token value returned to frontend after initial save.
7. Every write action requires RBAC.
8. Every write action creates an audit log entry.
9. Every destructive action requires dry-run and typed confirmation.
10. COST_LOCK=true blocks paid-capable modules.
11. Code must be clean, typed, tested, and documented.

Default stack:
- Backend: Python 3.12, FastAPI, SQLAlchemy, SQLite, httpx, cryptography, PyJWT, structlog.
- Frontend: React, Vite, TypeScript, Tailwind, TanStack Query, Recharts, Lucide.
- Runtime: Docker Compose, cloudflared, Ubuntu 24.04.

Required repository additions:
- apps/zcf-control/api
- apps/zcf-control/web
- infra/zcf-control/docker-compose.yml
- infra/zcf-control/cloudflared/config.template.yml
- scripts/cloudflare/zcf-control-install.sh
- docs/CLOUDFLARE_CONTROL_PANEL_FREE.md
- docs/prompts/cloudflare-control-panel-free.prompt.md
- tests for cost-lock, RBAC, token hiding, DNS destructive guards

Required backend endpoints:
- GET /health
- POST /api/auth/login
- GET /api/auth/me
- GET /api/dashboard/summary
- GET /api/settings/cost-lock
- PATCH /api/settings/cost-lock
- POST /api/tokens
- GET /api/tokens
- POST /api/tokens/{id}/verify
- GET /api/cloudflare/accounts
- GET /api/cloudflare/zones
- GET /api/dns/records
- POST /api/dns/records
- PATCH /api/dns/records/{record_id}
- DELETE /api/dns/records/{record_id}
- POST /api/dns/diff
- POST /api/dns/export
- POST /api/dns/import-dry-run
- GET /api/tunnels
- POST /api/tunnels
- POST /api/tunnels/{tunnel_id}/token
- POST /api/tunnels/{tunnel_id}/route-dns
- POST /api/tunnels/{tunnel_id}/generate-config
- GET /api/access/apps
- POST /api/access/apps
- POST /api/backups/export
- GET /api/audit/logs

Required frontend pages:
- Dashboard
- DNS
- Tunnels
- Access
- Tokens
- Backups
- Audit
- Settings

Cost-lock implementation:
Create a central policy guard, for example `app/core/cost_lock.py`, that blocks these actions while COST_LOCK=true:
- load balancing create/update/delete
- Argo enablement
- paid Bot Management setup
- paid Logpush destinations
- R2 writes unless ALLOW_R2_WRITE=true
- Workers deployment unless ALLOW_WORKERS_DEPLOY=true
- advanced WAF templates unless ALLOW_ADVANCED_WAF=true
- paid analytics/export products

Allowed when COST_LOCK=true:
- read account/zone metadata
- list DNS records
- create/update/delete standard DNS records with confirmation
- list/create/delete tunnels with confirmation
- route DNS to tunnels
- render local cloudflared configs
- manage free-compatible Access apps/policies
- export local backups

Implementation phases:

PHASE FREE-01:
Create app skeleton, Dockerfiles, docker-compose, SQLite DB, /health, base UI.

PHASE FREE-02:
Add auth, RBAC roles, JWT, audit log table, audit middleware.

PHASE FREE-03:
Add cost-lock settings and policy guard with tests.

PHASE FREE-04:
Add encrypted Cloudflare token vault and token verification. Never reveal stored token.

PHASE FREE-05:
Add Cloudflare client base with pagination, retries, typed errors, account/zone discovery.

PHASE FREE-06:
Add DNS manager: list/create/update/delete, diff, export, import dry-run, destructive guard.

PHASE FREE-07:
Add Tunnel manager: list/create/delete, token fetch, DNS route, config renderer.

PHASE FREE-08:
Add ingress route editor and cloudflared template for `*.zeaz.dev`.

PHASE FREE-09:
Add Free Zero Trust Access app/policy manager.

PHASE FREE-10:
Finish UI, install script, docs, test suite, and release checklist.

Return in final output:
- changed files
- commands to run
- test status
- security notes
- cost-lock notes
- remaining limitations
```
