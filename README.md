# zeaz-platform — Cloudflare Zero Trust + Free Control Panel

[![ci](https://github.com/cvsz/zeaz-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/cvsz/zeaz-platform/actions/workflows/ci.yml)
[![e2e](https://github.com/cvsz/zeaz-platform/actions/workflows/e2e.yml/badge.svg)](https://github.com/cvsz/zeaz-platform/actions/workflows/e2e.yml)
[![release-validate](https://github.com/cvsz/zeaz-platform/actions/workflows/release-validate.yml/badge.svg)](https://github.com/cvsz/zeaz-platform/actions/workflows/release-validate.yml)
[![release](https://github.com/cvsz/zeaz-platform/actions/workflows/release.yml/badge.svg)](https://github.com/cvsz/zeaz-platform/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Enterprise-grade Cloudflare infrastructure automation for **ZeazDev** (`zeaz.dev`) with scoped-token-first operations, Cloudflare Tunnel, DNS, Zero Trust Access, Terraform/OpenTofu, and a FREE NO COST control-panel expansion.

Default operating mode is safe and cost-controlled:

```bash
CLOUDFLARE_PLAN_TIER=Free
COST_LOCK=true
TERRAFORM_BACKEND_TYPE=local
```

Paid or overage-prone features must remain disabled unless the owner explicitly approves them and disables the relevant cost-lock guard.

---

## Table of contents

1. [Architecture](#architecture)
2. [Free/no-cost mode](#freeno-cost-mode)
3. [Prerequisites](#prerequisites)
4. [Quickstart](#quickstart)
5. [Environment variables](#environment-variables)
6. [Repository structure](#repository-structure)
7. [Makefile targets](#makefile-targets)
8. [Token management](#token-management)
9. [Deployment phases](#deployment-phases)
10. [Phase 52: zeaz.dev production routing](#phase-52-zeazdev-production-routing)
11. [Cloudflare docs context](#cloudflare-docs-context)
12. [Security](#security)
13. [Contributing](#contributing)

---

## Architecture

```text
                         ┌─────────────────────────────────────────────┐
                         │              Cloudflare Edge                │
                         │                                             │
  Users ──────────────►  │  DNS → Access → Tunnel → Self-hosted VM     │
                         │                                             │
                         │  Domains:                                   │
                         │  ├── www.zeaz.dev          (public landing) │
                         │  ├── zeaz.dev              (redirect)       │
                         │  ├── zdash.zeaz.dev        (zDash frontend) │
                         │  ├── zdash-api.zeaz.dev    (zDash API)      │
                         │  ├── release.zeaz.dev      (evidence page)  │
                         │  ├── ssh.zeaz.dev          (Access SSH)     │
                         │  ├── auth.zeaz.dev         (identity)       │
                         │  ├── app.zeaz.dev          (zWallet)        │
                         │  ├── zveo.zeaz.dev         (AI platform)    │
                         │  └── analytics.zeaz.dev    (analytics)      │
                         └─────────────────────────────────────────────┘
                                          │
                              Cloudflare Tunnel (cloudflared)
                                          │
                         ┌─────────────────────────────────────────────┐
                         │              Self-hosted origin             │
                         │  zeaz-platform (Ubuntu/Docker/systemd)      │
                         └─────────────────────────────────────────────┘
```

### Platform layers

| Layer | Technology | Purpose | Free-mode default |
|---|---|---|---|
| Identity | Cloudflare Access + SAML/OIDC | Zero Trust auth for selected subdomains | enabled |
| Network | Cloudflare Tunnel | Secure origin connectivity, no open inbound ports | enabled |
| DNS | Cloudflare DNS | zone and hostname automation | enabled |
| IaC | Terraform + OpenTofu | Declarative provisioning and drift checks | enabled |
| Secrets | SOPS + age / local env files | GitOps-safe secret handling | enabled |
| Observability | Grafana + Prometheus + local checks | local metrics and health checks | optional |
| Workers/R2/D1/WAF advanced | Cloudflare platform services | edge compute/storage/security modules | guarded |

## Integrated applications

| App | Path | Notes |
|---|---|---|
| zDash | `apps/zdash/` | Integrated monorepo subtree for the zDash application, backend, frontend, tests, and release tooling. |

---

## Free/no-cost mode

See [`docs/CLOUDFLARE_CONTROL_PANEL_FREE.md`](docs/CLOUDFLARE_CONTROL_PANEL_FREE.md) for the full control-panel plan.

Free-mode guardrails:

```bash
COST_LOCK=true
ALLOW_PAID_CLOUDFLARE_FEATURES=false
ALLOW_R2_WRITE=false
ALLOW_WORKERS_DEPLOY=false
ALLOW_LOAD_BALANCING=false
ALLOW_ADVANCED_WAF=false
ALLOW_LOGPUSH=false
```

Allowed in Free mode:

- DNS read/write with confirmation for destructive changes
- Cloudflare Tunnel config generation and routing
- free-compatible Access apps and policies
- local backups and audit logs
- local SQLite/PostgreSQL/Redis/Grafana/Prometheus runtime

Blocked by default in Free mode:

- Load Balancing
- Argo Smart Routing
- paid Bot Management
- paid Logpush destinations
- R2 write-heavy workflows
- Workers deployment unless explicitly enabled
- advanced WAF templates unless explicitly enabled
- Enterprise-only APIs

zDash remains integrated under the same free/no-cost guardrails. The root operator repo stays responsible for Cloudflare DNS, Tunnel, Access, IaC, and release orchestration, while zDash is run from `apps/zdash/`.

---

## Prerequisites

| Tool | Minimum version | Notes |
|---|---:|---|
| bash | 4.0+ | required by shell helpers |
| curl | any | Cloudflare/API checks |
| jq | 1.6+ | token lifecycle script |
| python3 | 3.10+ | env and YAML validators |
| PyYAML | current | `scripts/validate-yaml.py` |
| pytest | current | test suite |
| terraform | 1.5+ | Terraform modules |
| tofu | optional | OpenTofu validation |
| cloudflared | current | Tunnel connector |
| age + sops | current | encrypted secret files |

Cloudflare account requirement: `zeaz.dev` must already be added to Cloudflare. Use scoped API tokens only; avoid Global API Key usage in automation.

---

## Quickstart

### 1. Clone and configure

```bash
git clone https://github.com/cvsz/zeaz-platform.git
cd zeaz-platform

make setup-free
```

`make setup-free` creates or preserves `.env`, backs up any existing `.env`, and enforces Free/no-cost defaults.

Fill `.env` using canonical `CLOUDFLARE_*` variables. Stale short `CF_*` variables are forbidden by active source validators. New config should use `CLOUDFLARE_*` names only.

### 2. Validate source health

```bash
python3 -m pip install -r requirements-dev.txt
make validate-env
python3 scripts/validate-yaml.py
make doctor
make yaml-validate
```

`make validate-env` is advisory and does not fail on missing deployment secrets. Use strict mode only after real values are filled:

```bash
make validate-env-strict
```

### 3. Refresh Cloudflare docs context for agents

```bash
bash scripts/cloudflare/fetch-cloudflare-llms-context.sh
```

The docs cache is written to `.cache/cloudflare-docs/` and is intentionally ignored by Git.

### 4. Validate IaC

```bash
make tf-fmt-check
make tf-init
make tf-validate
make tofu-validate
```

### 5. Provision infrastructure only after review

```bash
terraform -chdir=terraform/environments/${ENVIRONMENT} init
terraform -chdir=terraform/environments/${ENVIRONMENT} plan -out=tfplan
# apply only after reviewing the plan
terraform -chdir=terraform/environments/${ENVIRONMENT} apply tfplan
```

All apply/destroy workflows should remain manually approved.

---

## Environment variables

Copy `.env.example` to `.env` or run `make setup-free`, then fill values locally.

### Cloudflare core

| Variable | Required | Description |
|---|---:|---|
| `CLOUDFLARE_ACCOUNT_ID` | yes | Cloudflare account ID |
| `CLOUDFLARE_ZONE_ID` | yes | Zone ID for `zeaz.dev` |
| `PRIMARY_DOMAIN` | yes | default `zeaz.dev` |
| `CLOUDFLARE_PLAN_TIER` | yes | `Free`, `Pro`, `Business`, or `Enterprise` |
| `COST_LOCK` | yes | defaults to `true` |

### Scoped tokens

| Variable | Required | Scope |
|---|---:|---|
| `CLOUDFLARE_API_TOKEN` | yes | general scoped token for Terraform fallback |
| `CLOUDFLARE_DNS_TOKEN` | yes | Zone DNS Edit + Zone Read |
| `CLOUDFLARE_ZT_TOKEN` | yes | Access apps/policies as needed |
| `CLOUDFLARE_WORKERS_TOKEN` | conditional | Workers operations; guarded in Free mode |
| `CLOUDFLARE_WAF_TOKEN` | conditional | WAF operations; guarded in Free mode |
| `CLOUDFLARE_TUNNEL_TOKEN` | yes | Cloudflare Tunnel operations |
| `CLOUDFLARE_R2_TOKEN` | conditional | R2 operations; guarded in Free mode |
| `CLOUDFLARE_AUDIT_TOKEN` | optional | audit/log read workflows |

### Terraform backend

| Variable | Required | Description |
|---|---:|---|
| `TERRAFORM_BACKEND_TYPE` | yes | `local` or `s3`; default is `local` |
| `TERRAFORM_STATE_BUCKET` | only for s3 | remote state bucket |
| `TERRAFORM_LOCK_TABLE` | only for s3 | lock table |

---

## Repository structure

```text
zeaz-platform/
├── .github/workflows/                  # CI validation and Terraform workflows
├── docs/                               # architecture, audits, prompts, runbooks
├── ops/                                # host-level operations scripts
├── python/                             # validators and helper utilities
├── scripts/                            # setup, Cloudflare, Terraform, validation scripts
├── terraform/                          # Terraform modules/root config
├── opentofu/                           # OpenTofu environment roots
├── tunnels/cloudflared/                # cloudflared templates
├── tests/                              # Python validation tests
├── .env.example                        # safe local env template
├── AGENTS.md                           # agent instructions
├── Makefile                            # canonical task runner
└── README.md
```

---

## Makefile targets

```bash
make doctor                 # show local tool status
make test                   # run pytest when available
make validate-env           # advisory environment check for repo/CI health
make zdash-validate-fast    # run zDash structural + safety validation
make zdash-server-start     # start the zDash backend/frontend dev servers
make phase51-validate       # validate the monorepo import and wrapper contract
make validate-env-strict    # strict deployment validation with real values
make yaml-validate          # validate active YAML files
make shellcheck             # shellcheck tracked scripts when installed
make tf-fmt-check           # Terraform/OpenTofu formatting check
make tf-validate            # Terraform validation
make tofu-validate          # OpenTofu validation when installed
make token-clean            # dry-run token cleanup
make token-rotate-dry       # dry-run token regeneration
make token-rotate           # live token regeneration; use only after review
make drift-detect           # Terraform drift check
make security-scan          # optional security tools if installed
make docs-context           # refresh Cloudflare docs context cache
make upgrade-report         # generate reports/project-upgrade-report.md
```

---

## Token management

Token lifecycle helper:

```bash
scripts/cloudflare/clean-and-regenerate-tokens.sh
```

Recommended workflow:

```bash
make token-clean
make token-rotate-dry
# only after review and with correct bootstrap permission
make token-rotate
```

Safety rules:

- never commit `.env`, `.env.cloudflare`, tunnel credentials, origin certs, or token values
- keep token rotation dry-run first
- keep generated token files mode `600`
- prefer scoped tokens over Global API Key
- review permission groups before regeneration

---

## Deployment phases

| Phase | Name | Objective | Primary commands |
|---|---|---|---|
| F1 | Context + Variables | Advisory source/env check, then strict deployment validation after real secrets are filled | `make validate-env` / `make validate-env-strict` |
| F2 | Terraform Foundation | Init and validate IaC | `make tf-validate` / `make tofu-validate` |
| F3 | Zero Trust + Identity | Configure Access apps/policies and identity metadata | Terraform plan/apply after review |
| F4 | DNS + Tunnels | Provision DNS and cloudflared templates | tunnel validation + Terraform |
| F5 | Workers + Edge | Guarded edge compute/storage modules | disabled by default in Free mode |
| F6 | Monitoring + DR | Drift, backups, audit, security scans | `make drift-detect && make security-scan` |
| F7 | GitOps | workflow policy and PR checks | `make gitops-validate` |
| F9 | zDash Monorepo | Full zDash app imported under apps/zdash, Makefile wrappers, monorepo operations runbooks | `make phase51-validate` |
| F52 | zeaz.dev production routing | Controlled DNS, Tunnel, and Access apply mode for `www.zeaz.dev`, `zeaz.dev`, and zDash routes | `make phase52-validate` |

## Phase 52: zeaz.dev production routing

Phase 52 adds controlled apply mode for the production `zeaz.dev` routing surface.

Key hostnames:

- `www.zeaz.dev` for the public landing page
- `zeaz.dev` for redirecting to `www.zeaz.dev`
- `zdash.zeaz.dev` for the zDash frontend
- `zdash-api.zeaz.dev` for the zDash backend API
- `release.zeaz.dev` for optional public release evidence
- `ssh.zeaz.dev` remains unchanged

Guardrails:

- dry-run by default
- no Cloudflare changes unless `APPLY=true`
- DNS changes require `CONFIRM_DNS_APPLY=yes`
- Tunnel changes require `CONFIRM_TUNNEL_APPLY=yes`
- Access changes require `CONFIRM_ACCESS_APPLY=yes`
- paid Cloudflare features remain disabled
- `COST_LOCK=true`
- `CLOUDFLARE_PLAN_TIER=Free`
- `ALLOW_PAID_CLOUDFLARE_FEATURES=false`

Commands:

```bash
make zeaz-dev-plan
make phase52-validate
APPLY=true CONFIRM_DNS_APPLY=yes CONFIRM_TUNNEL_APPLY=yes CONFIRM_ACCESS_APPLY=yes make zeaz-dev-apply
```

---

## zDash monorepo

zDash (`cvsz/zdash`) is integrated under `apps/zdash/` via **git subtree --squash**.

### Why subtree (not submodule)

- **History preservation**: subtree inlines history under `--squash` — no nested `.git`.
- **Simpler CI**: no submodule init/update; all code present after a standard clone.
- **Rollback is `git revert`**: no detached submodule pointers.
- **Submodule overhead**: subtree avoids submodule management complexity.

### Key commands

| Command | Purpose |
|---------|---------|
| `make zdash-validate-fast` | Safety scan + lint + backend tests + frontend tests + build |
| `make zdash-server-start` | Start backend (8005) + frontend (5173) concurrently |
| `make phase51-validate` | Full Phase 51 validation chain |
| `make zdash-backend-test` | Run zDash backend tests |
| `make zdash-frontend-test` | Run zDash frontend tests |
| `make zdash-build` | Build frontend production bundle |
| `make zdash-release-evidence` | Generate release evidence report |
| `bash scripts/zdash/sync-zdash-subtree.sh` | Sync latest zDash changes from upstream |

### Warnings

- Original zDash safety invariants are preserved (dry-run, cost lock, no live trading by default).
- Old `apps/zdash` content (Cloudflare Pages dashboard) was moved aside before import.
- All Cloudflare configs for zDash live in `configs/cloudflare/zdash/*.example.json` — dry-run only.

See `docs/architecture/ZDASH_MONOREPO_INTEGRATION.md` and `docs/runbooks/ZDASH_MONOREPO_OPERATIONS.md` for full details.

## Cloudflare docs context

The repo includes a Cloudflare docs cache workflow for agent upgrades:

```bash
bash scripts/cloudflare/fetch-cloudflare-llms-context.sh
```

See [`docs/CLOUDFLARE_LLM_CONTEXT.md`](docs/CLOUDFLARE_LLM_CONTEXT.md).

---

## Security

- Never commit secrets.
- `.gitignore` excludes `.env`, `.env.cloudflare`, `.cache`, state files, backups, and local agent folders.
- Use scoped API tokens only.
- Keep `COST_LOCK=true` for Free/no-cost mode.
- Review all Terraform plans before apply.
- Audit all token lifecycle changes.
- Use local docs cache rather than vendoring Cloudflare documentation into Git.

To report a security issue or leaked credential, see [`.github/SECURITY.md`](.github/SECURITY.md) if present.

---

## Contributing

1. Create a feature branch from `main`.
2. Run validation before opening a PR:

   ```bash
   python3 -m pytest -q tests
   python3 scripts/validate-yaml.py
   make tf-fmt-check
   make tf-validate
   ```

3. Never commit credentials, token values, `.tfstate`, tunnel credentials, or local caches.
4. Reference [`AGENTS.md`](AGENTS.md) and the audit reports in `docs/` for architecture decisions.

---

Built for ZeazDev. Licensed under MIT.
