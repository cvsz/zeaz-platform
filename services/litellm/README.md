# LiteLLM Gateway Service

This directory provides a Phase 1 foundation for issue `#284`:

- LiteLLM proxy service
- PostgreSQL backend
- Redis cache
- Prometheus metrics scrape
- Grafana dashboard provisioning
- Traefik integration override
- Zero Trust access policy scaffold
- Tenant quota/billing control-plane scaffold
- Health/backup/restore scripts

It is intentionally additive and offline-safe. It does not mutate Cloudflare,
Stripe, or other third-party systems by default.

## Layout

- `docker-compose.yaml` - local runtime topology
- `docker-compose.traefik.yaml` - optional Traefik exposure override
- `.env.example` - required environment contract
- `config/litellm.config.yaml` - LiteLLM router/proxy configuration
- `monitoring/prometheus.yml` - Prometheus scrape configuration
- `grafana/dashboards/litellm-overview.json` - starter dashboard
- `policies/access-policy.yaml` - Zero Trust and header contract
- `policies/quota-policy.yaml` - tenant tier and quota policy
- `scripts/validate-config.sh` - offline validation
- `scripts/validate-policies.sh` - offline policy validation
- `scripts/check-access.py` - offline RBAC decision helper
- `scripts/evaluate-quota.py` - offline quota decision helper
- `scripts/healthcheck.sh` - service readiness/liveness checks
- `scripts/backup.sh` - Postgres/Redis backup helper
- `scripts/restore.sh` - Postgres/Redis restore helper

## Runtime Variables

Required:

- `LITELLM_MASTER_KEY`
- `OPENAI_API_KEY`

Optional providers:

- `GEMINI_API_KEY`
- `ANTHROPIC_API_KEY`
- `DEEPSEEK_API_KEY`

Infrastructure:

- `LITELLM_DB_PASSWORD`
- `GRAFANA_ADMIN_PASSWORD`
- `LITELLM_PORT`
- `PROMETHEUS_PORT`
- `GRAFANA_PORT`
- `LITELLM_GATEWAY_HOSTNAME`
- `LITELLM_ALLOWED_EMAIL_DOMAIN`

## Quick Start

1. Copy `.env.example` to `.env` and supply real values outside version control.
2. Run `bash scripts/validate-config.sh`.
3. Run `bash scripts/validate-policies.sh`.
4. Start the stack with `docker compose -f docker-compose.yaml up -d`.
5. Check readiness with `bash scripts/healthcheck.sh`.

Optional Traefik integration:

1. Ensure the external Docker network `proxy` exists.
2. Start with `docker compose -f docker-compose.yaml -f docker-compose.traefik.yaml up -d`.
3. Route `LITELLM_GATEWAY_HOSTNAME` through the existing ZeaZ proxy and Access middleware.

## Security Notes

- No plaintext secrets are committed here.
- All provider keys are sourced from environment variables.
- Backups and restores require explicit confirmation guards.
- Public exposure is isolated into a compose override so the base stack stays local-safe.
- Access policy requires upstream identity headers and AI RBAC groups.
- This scaffold does not claim production readiness yet.

## Next Phases

- Add virtual key issuance and upstream key rotation workflow
- Add tenant usage webhooks and persistent billing reconciliation
- Integrate usage metering and Stripe billing
- Add Helm chart and Terraform module
