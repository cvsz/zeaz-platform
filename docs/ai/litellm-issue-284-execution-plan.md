# LiteLLM Issue 284 Execution Plan

Source issue: <https://github.com/cvsz/zeaz-platform/issues/284>

## Goal

Integrate LiteLLM into `zeaz-platform` as one platform service without
duplicating the existing Cloudflare, Traefik, monitoring, billing, and RBAC
patterns already present elsewhere in the monorepo.

## Phase 1

Deliver a safe runtime foundation:

1. `services/litellm/` service boundary
2. Docker Compose stack with:
   - LiteLLM
   - PostgreSQL
   - Redis
   - Prometheus
   - Grafana
3. Offline config validation
4. Health/backup/restore scripts
5. Service README and env contract

Acceptance:

- `bash services/litellm/scripts/validate-config.sh`
- `python3 scripts/validate-yaml.py`

## Phase 2

Integrate with platform routing and identity:

1. Add Traefik route contract
2. Add Cloudflare Zero Trust access design
3. Define provider routing test matrix for:
   - OpenAI
   - Gemini
   - Anthropic
   - DeepSeek
4. Define virtual key model
5. Define team quota and rate-limit enforcement points

Acceptance:

- service routing doc reviewed
- Zero Trust mapping doc reviewed
- provider config validation extended

## Phase 3

Add SaaS controls:

1. Usage event schema
2. Metering persistence
3. Stripe subscription + billing portal integration
4. Customer portal surface
5. Tenant/team RBAC and audit trail

Acceptance:

- billing adapter contract
- usage ledger schema
- audit event schema
- RBAC policy table

## Phase 4

Delivery artifacts:

1. Helm chart
2. Terraform module or environment binding
3. Monitoring dashboard pack
4. Runbooks and operator docs

Acceptance:

- chart validation
- terraform validation
- docs aligned with implementation
