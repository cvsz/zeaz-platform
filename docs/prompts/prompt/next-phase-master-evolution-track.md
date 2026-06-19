# Next Phase Master Evolution Track

This document records the repository-safe implementation track for the uploaded ZEAZ META OS next-phase master evolution prompt.

The uploaded source requests a full production broken-state remediation and upgrade pass across Vertex AI, Cloudflare, Terraform/OpenTofu, trading runtime, Makefile orchestration, validation, secret scanning, and free-tier constraints. This repository version preserves that intent while enforcing validation-first, no-secret, free-tier-safe execution.

## Current operational context

The track assumes the repo is in a stabilization phase involving:

- Vertex AI v2 integration under billing-disabled constraints
- Cloudflare stack in scoped-token and dry-run-first mode
- Terraform/TFLint cleanup requirements
- historical secret-scan findings requiring remediation discipline
- Makefile and CI release-blocker fixes
- Python dependency compatibility fixes
- trading runtime port rebalance and isolation work
- config schema normalization work
- Free/no-cost enforcement

## Baseline commands

Run before and after any implementation work:

```bash
make env-normalize-local
make env-format-validate-local
make validate
make security-scan
```

Use strict scanner mode only after the toolchain is installed and the repo is ready for hard failure gates:

```bash
STRICT_SECURITY_SCAN=true make security-scan
```

## Non-negotiable safety rules

- Keep Free/no-cost mode as the default.
- Do not require GCP billing-dependent services.
- Preserve Cloudflare-only ingress for public access.
- Use canonical `CLOUDFLARE_*` environment names.
- Do not commit `.env`, `.env.cloudflare`, generated state, caches, Wrangler caches, token audit logs, or credentials.
- Do not print secret values.
- Do not add fake secret-looking placeholders.
- Do not hardcode account IDs, zone IDs, tokens, API keys, private keys, passphrases, or exchange credentials.
- Default runtime, cloud-sync, security, trading, and release operations to dry-run or validation-first behavior unless explicit confirmation is supplied.
- Commit only after validation passes.
- Push to GitHub only after the signed commit succeeds.

## Phase 1 — Critical failure remediation

### Terraform/TFLint

Fix strict lint failures without weakening validation:

- add or preserve required Terraform version constraints
- remove unused variables or wire them into modules intentionally
- keep Terraform/OpenTofu validation green

Target review files:

```text
terraform/cloudflare/main.tf
terraform/cloudflare/variables.tf
terraform/environments/*/main.tf
```

### Secret scan remediation

Separate current-tree cleanup from historical remediation:

1. Verify current tree first:

   ```bash
   gitleaks detect --no-git --redact --source . || true
   ```

2. Treat historical Cloudflare/Wrangler/token-audit findings as compromised.
3. Rotate/revoke exposed provider tokens outside Git.
4. Keep `.wrangler/`, `.env.cloudflare`, `.cloudflare-token-audit.log`, and backup token logs ignored and untracked.
5. Do not rewrite repository history until the owner approves a coordinated history rewrite.

Recommended docs:

```text
docs/security/gitleaks-history-remediation.md
docs/security/token-rotation-runbook.md
```

### Config schema normalization

If config parsing fails because legacy integer roles appear where structured agent role objects are required, add a compatibility migration layer that:

- validates config before runtime start
- rejects invalid agent definitions with clear errors
- migrates known legacy integer role values into structured role objects only when safe
- writes no secrets

Preferred files:

```text
runtime/config/schema.py
runtime/config/loader.py
scripts/fix_config_toml.py
```

## Phase 2 — Cloudflare stable edge

Create or update safe Cloudflare ingress files only with variables and local service origins:

```text
infra/cloudflare/ingress.yml
infra/cloudflare/tunnel.yml
infra/cloudflare/access-policies.yml
infra/cloudflare/zero-trust-rules.yml
```

Target domain map:

```text
panel.zeaz.dev      -> 3007
api.zeaz.dev        -> 8007
auth.zeaz.dev       -> 9443
grafana.zeaz.dev    -> 3010
loki.zeaz.dev       -> 3100
prometheus.zeaz.dev -> 9091
trader.zeaz.dev     -> 8100
ws.trader.zeaz.dev  -> 8101
risk.zeaz.dev       -> 8104
memory.zeaz.dev     -> 8109
agents.zeaz.dev     -> 8106
```

Rules:

- use cloudflared ingress only for public access
- expose no public origin ports
- keep websocket route explicit
- keep strict host routing
- keep Cloudflare Free-compatible behavior by default

## Phase 3 — Port realignment

Target deterministic mapping:

```text
3007 META OS panel
8007 API gateway
5436 Postgres
6382 Redis
9004 MinIO
9443 Authentik
3010 Grafana
3100 Loki
9091 Prometheus
4318 OpenTelemetry
8100-8109 trading/runtime isolation cluster
8080 Traefik dashboard, local/admin only
2222 internal SSH tunnel only
```

Apply only where compatible with existing compose/runtime files. Preserve backward-compatible aliases until migration is complete.

## Phase 4 — Trading engine hardening

Harden trading runtime with dry-run/paper-mode defaults. No live exchange execution should be enabled by default.

Target runtime files:

```text
runtime/trading/execution_engine.py
runtime/trading/risk_engine.py
runtime/trading/portfolio_engine.py
runtime/trading/reconciliation_engine.py
runtime/trading/heartbeat_monitor.py
```

Safety controls:

- ledger consistency lock
- anti-ghost-order detection
- circuit breaker levels
- max drawdown hard stop
- websocket reconnect jitter
- Redis Streams backpressure
- emergency freeze
- explicit live-mode guard

## Phase 5 — TradingView security layer

Target files:

```text
runtime/trading/tradingview/webhook_server.py
runtime/trading/tradingview/validator.py
runtime/trading/tradingview/replay_protection.py
runtime/trading/tradingview/signal_router.py
```

Requirements:

- HMAC SHA256 validation
- Redis-backed nonce tracking
- IP allowlist enforcement where configured
- replay window protection
- strategy-ID binding
- dead-letter handling
- no exchange credentials in examples or docs

## Phase 6 — Makefile evolution

Add or preserve deterministic `zaiz-*` targets without breaking existing Make targets:

```text
zaiz-up
zaiz-down
zaiz-ports
zaiz-cloudflare-sync
zaiz-trader
zaiz-risk
zaiz-heal
zaiz-memory
zaiz-chaos
zaiz-validate
zaiz-secret-rotate
zaiz-terraform-plan
zaiz-terraform-apply
zaiz-lint
zaiz-fix
zaiz-ci
```

Rules:

- production, firewall, apply, rotate, and cloud-sync operations require explicit confirmation
- dry-run defaults for risky commands
- idempotent commands where possible
- no silent failures
- update `scripts/make-help.sh`

## Phase 7 — Validation system

Create or update:

```text
scripts/full_validation.sh
scripts/validation/validate_ports.sh
scripts/validation/validate_cloudflare.sh
scripts/validation/validate_runtime.sh
scripts/validation/validate_trading_runtime.sh
scripts/validation/validate_edge_topology.sh
```

Validation should check only what exists and skip optional subsystems with clear warnings. It must avoid printing secrets.

## Phase 8 — Self-healing patch

Extend `runtime/self_healing_runtime.py` if present. Otherwise add safe dry-run scaffolding only.

Required behavior:

- tunnel health check
- websocket recovery check
- trading freeze on anomaly in dry-run by default
- Redis backlog protection
- memory pressure detection
- infinite restart prevention using cooldown windows
- anomaly clustering report

## Phase 9 — Security hardening final

Document and implement where safe:

- seccomp references
- rootless Docker compatibility
- read-only containers where possible
- capability drops
- JWT rotation design
- RBAC enforcement checks
- Redis AUTH requirement
- Postgres network isolation
- CSP strict mode
- websocket auth middleware

Recommended document:

```text
docs/security/META_OS_HARDENING.md
```

## Final validation

Run:

```bash
make env-normalize-local
make env-format-validate-local
make validate
make security-scan
bash scripts/full_validation.sh || true
git status --short
```

## GitHub publish rule

After implementation is complete and validation passes locally:

```bash
git add .
bash gpg-loopback.sh commit -m "detail commit"
git push
```

Use a feature branch unless the owner explicitly requests direct `main` updates.
