# Makefile Final Evolution Track

This document records the repository-safe implementation track for the uploaded ZEAZ META OS Makefile Final Evolution prompt.

The uploaded source requests a full Makefile orchestration refactor across runtime, Cloudflare, Terraform/OpenTofu, validation, security, observability, healing, governance, and release operations. In this repository, that request is handled as a validation-first, reviewable orchestration track.

## Baseline

Run before and after implementation:

```bash
make env-normalize-local
make env-format-validate-local
make validate
```

## Required safety rules

- Keep Free/no-cost mode as the default.
- Keep Ubuntu 24.04+ and Docker Compose V2 compatibility.
- Keep rootless Docker compatibility where possible.
- Keep existing Make targets backward compatible.
- Do not commit `.env`, `.env.cloudflare`, generated state, caches, or credentials.
- Do not print secret values.
- Do not introduce silent failures.
- Production, firewall, destructive, release, or cloud-sync operations must require explicit confirmation.
- Default risky runtime actions to dry-run or validation-only mode.

## Makefile architecture target

Preferred modular layout:

```text
Makefile
make/core.mk
make/edge.mk
make/auth.mk
make/obs.mk
make/ai.mk
make/llm.mk
make/trading.mk
make/healing.mk
make/governance.mk
make/cloudflare.mk
make/terraform.mk
make/validation.mk
make/security.mk
make/runtime.mk
make/release.mk
make/chaos.mk
make/vertex.mk
```

Root Makefile requirements:

- include modular files
- use strict shell mode
- support CI mode
- support dry-run mode
- support environment overlays
- keep validation-first deployment flow
- keep rollback-aware orchestration
- keep deterministic logging

## Target namespaces

Core:

```text
zaiz
zaiz-up
zaiz-down
zaiz-restart
zaiz-reload
zaiz-status
zaiz-health
zaiz-clean
zaiz-reset
zaiz-upgrade
```

Runtime:

```text
zaiz-runtime
zaiz-runtime-reconcile
zaiz-runtime-converge
zaiz-runtime-events
zaiz-runtime-memory
zaiz-runtime-policy
zaiz-runtime-governor
zaiz-runtime-heal
zaiz-runtime-freeze
zaiz-runtime-unfreeze
```

Edge and Cloudflare:

```text
zaiz-edge
zaiz-cloudflare
zaiz-cloudflare-sync
zaiz-cloudflare-routes
zaiz-cloudflare-validate
zaiz-tunnel
zaiz-tunnel-restart
zaiz-traefik
zaiz-traefik-rules
zaiz-traefik-validate
```

Auth and observability:

```text
zaiz-auth
zaiz-auth-validate
zaiz-auth-rbac
zaiz-obs
zaiz-grafana
zaiz-loki
zaiz-prometheus
zaiz-otel
zaiz-metrics
zaiz-logs
zaiz-traces
zaiz-alerts
```

AI and provider orchestration:

```text
zaiz-llm
zaiz-llm-health
zaiz-llm-router
zaiz-llm-costs
zaiz-vertex
zaiz-vertex-test
zaiz-vertex-stream
zaiz-vertex-budget
zaiz-vertex-failover
zaiz-genai
```

Runtime engine controls:

```text
zaiz-trader
zaiz-trader-status
zaiz-trader-risk
zaiz-trader-freeze
zaiz-trader-unfreeze
zaiz-trader-paper
zaiz-trader-backtest
zaiz-trader-heal
zaiz-trader-sync
zaiz-trader-heartbeat
zaiz-trader-reconcile
```

Validation:

```text
zaiz-validate
zaiz-validate-all
zaiz-validate-ports
zaiz-validate-edge
zaiz-validate-cloudflare
zaiz-validate-auth
zaiz-validate-runtime
zaiz-validate-obs
zaiz-validate-trader
zaiz-validate-ws
zaiz-validate-llm
zaiz-validate-security
```

Security, chaos, healing, release, Terraform, and OpenTofu:

```text
zaiz-security
zaiz-security-audit
zaiz-security-scan
zaiz-chaos
zaiz-heal
zaiz-release
zaiz-release-prod
zaiz-release-rollback
zaiz-tf-init
zaiz-tf-plan
zaiz-tf-apply
zaiz-tf-destroy
zaiz-tf-validate
zaiz-tofu-init
zaiz-tofu-plan
zaiz-tofu-apply
zaiz-tofu-destroy
```

## Environment standardization

Example files to add or update only if they remain secret-free:

```text
.env.runtime.example
.env.trading.example
.env.vertex.example
.env.cloudflare.example
```

Required port keys:

```text
META_PANEL_PORT=3007
API_GATEWAY_PORT=8007
POSTGRES_PORT=5436
REDIS_PORT=6382
MINIO_PORT=9004
AUTHENTIK_PORT=9443
GRAFANA_PORT=3010
LOKI_PORT=3100
PROMETHEUS_PORT=9091
OTEL_PORT=4318
TRADER_API_PORT=8100
TRADER_WS_PORT=8101
STRATEGY_ENGINE_PORT=8102
EXECUTION_ENGINE_PORT=8103
RISK_ENGINE_PORT=8104
MARKET_DATA_PORT=8105
AI_COORDINATOR_PORT=8106
PAPER_TRADING_PORT=8107
BACKTEST_PORT=8108
PORTFOLIO_ENGINE_PORT=8109
TRAEFIK_PORT=8080
SSH_TUNNEL_PORT=2222
```

## Required docs

Generate or update:

```text
docs/makefile/makefile-audit.md
docs/makefile/orchestration-map.md
docs/makefile/runtime-dependency-graph.md
docs/makefile/command-lifecycle-map.md
docs/network/port-federation.md
docs/network/domain-routing-map.md
docs/network/websocket-topology.md
docs/network/cloudflare-edge-map.md
```

## Required validation scripts

Generate or update:

```text
scripts/validation/validate_make_targets.sh
scripts/validation/validate_runtime_graph.sh
scripts/validation/validate_edge_topology.sh
scripts/validation/validate_trading_runtime.sh
scripts/validation/validate_vertex_runtime.sh
scripts/validation/validate_otel_pipeline.sh
scripts/validation/validate_release_state.sh
scripts/full_validation.sh
```

## Final validation

```bash
make env-normalize-local
make env-format-validate-local
make validate
bash scripts/full_validation.sh || true
git status --short
```

## GitHub publish rule

After implementation is complete and validation passes locally, use a signed commit and push to GitHub:

```bash
git add .
bash gpg-loopback.sh commit -m "detail commit"
git push
```

Use a feature branch unless the owner explicitly requests direct `main` updates.
