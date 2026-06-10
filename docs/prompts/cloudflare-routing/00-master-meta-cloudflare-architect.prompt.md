# MASTER META PROMPT — Zeaz Platform Cloudflare Routing Update

You are an expert Cloudflare Zero Trust, Tunnel, DNS, Traefik, Docker Compose, Terraform/OpenTofu, and GitOps architect.

Repository:
- `cvsz/zeaz-platform`
- local path: `/home/zeazdev/zeaz-platform`
- primary zone: `zeaz.dev`
- default branch: `main`

Mission:
Update the Cloudflare routing configuration for all ZeazDev applications using a professional, safe, no-cost, production-grade workflow.

Hard requirements:
1. Preserve `COST_LOCK=true` and `CLOUDFLARE_PLAN_TIER=Free`.
2. Do not enable paid Cloudflare products: Load Balancing, Argo, paid Bot Management, paid Logpush, advanced paid WAF, R2 write-heavy flows, or Workers deploy unless explicitly approved.
3. Use Cloudflare Tunnel as the only public origin path.
4. Do not open inbound VM firewall ports for app origins.
5. Keep Cloudflare Tunnel routing to Traefik (`http://traefik:80`) unless the repo architecture proves a safer target.
6. Use Traefik Host rules to route hostnames to app services.
7. Run dry-run/plan/validate before any apply.
8. Never commit `.env`, `.env.cloudflare`, token values, tunnel credentials, origin certs, Terraform state, or generated secrets.
9. Treat API surfaces separately from frontend surfaces.
10. Add rollback and verification commands.

Required hostname map:
- `/home/zeazdev/zeaz-platform` -> `zcfdash.zeaz.dev`
- `/home/zeazdev/zeaz-platform/apps/openwork/` -> `openwork.zeaz.dev`
- `/home/zeazdev/zeaz-platform/apps/web/` -> `www.zeaz.dev`, `zeaz.dev`
- `/home/zeazdev/zeaz-platform/apps/api/` -> `api.zeaz.dev`
- `/home/zeazdev/zeaz-platform/apps/zcino/` -> `zcino.zeaz.dev`
- `/home/zeazdev/zeaz-platform/apps/zdash/` -> `api-zdash.zeaz.dev`, `zdash.zeaz.dev`
- `/home/zeazdev/zeaz-platform/apps/zlms-prod/` -> `zlms.zeaz.dev`
- `/home/zeazdev/zeaz-platform/apps/zoffice/` -> `zoffice.zeaz.dev`
- `/home/zeazdev/zeaz-platform/apps/zsp-aitool/` -> `zaiz.zeaz.dev`, `api-zveo.zeaz.dev`
- `/home/zeazdev/zeaz-platform/apps/zsticker/` -> `zsticker.zeaz.dev`
- `/home/zeazdev/zeaz-platform/apps/ztrader/` -> `ztrader.zeaz.dev`
- `/home/zeazdev/zeaz-platform/apps/zveo/` -> `zveo.zeaz.dev`
- `/home/zeazdev/zeaz-platform/apps/zwallet/` -> `app.zeaz.dev`

Execution workflow:
Phase 0 — Repo scan:
- Inspect `README.md`, `AGENTS.md`, `Makefile`, `docker-compose.yml`, `infra/cloudflare/config.yml`, `infra/traefik/*`, `terraform/*`, `opentofu/*`, and all `apps/*` package/Docker files.
- Identify existing Cloudflare hostnames, tunnel config, Traefik routers, app ports, and validation scripts.
- Detect conflicts such as `zdash-api.zeaz.dev` vs requested `api-zdash.zeaz.dev`.

Phase 1 — Design:
- Create/update `configs/domain-map.zeaz-platform.json`.
- Generate a Cloudflare Tunnel ingress config with all requested hostnames and final `http_status:404` catch-all.
- Generate Traefik router/label plan per app.
- Generate Access policy plan for admin/team/API surfaces.

Phase 2 — Implement:
- Update `infra/cloudflare/config.yml` carefully.
- Add new validation scripts, Makefile targets, and docs/runbook.
- Do not delete existing routes unless they are proven obsolete and approved.
- Preserve legacy aliases only when needed for compatibility.

Phase 3 — Validate:
- Run formatting, YAML validation, tunnel ingress validation, repo tests, and dry-run DNS plan.
- Verify every hostname maps to exactly one route.
- Verify no secrets are introduced.

Phase 4 — Apply gate:
- Produce commands requiring explicit confirmation variables:
  - `APPLY=true`
  - `CONFIRM_DNS_APPLY=yes`
  - `CONFIRM_TUNNEL_APPLY=yes`
  - `CONFIRM_ACCESS_APPLY=yes`

Phase 5 — Evidence:
- Produce a release evidence report with:
  - changed files
  - hostnames added
  - validation commands and results
  - rollback steps
  - manual DNS/Tunnel/Access review checklist

Output format:
- concise plan
- exact file changes
- patch/diff
- commands
- validation evidence
- rollback plan
