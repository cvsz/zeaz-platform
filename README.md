# zeazdev - cfstack — Cloudflare Zero Trust Platform

Enterprise-grade, fully-automated Cloudflare infrastructure platform for **ZeazDev** (`zeaz.dev`).
Covers Zero Trust access, DNS, Cloudflare Tunnels, Workers, WAF, R2, and scoped API token lifecycle management.

---

## Table of contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Quickstart](#quickstart)
4. [Environment variables](#environment-variables)
5. [Repository structure](#repository-structure)
6. [Makefile targets](#makefile-targets)
7. [Token management](#token-management)
8. [Deployment phases](#deployment-phases)
9. [Security](#security)
10. [Contributing](#contributing)

---

## Architecture

```
                         ┌─────────────────────────────────────────────┐
                         │              Cloudflare Edge                │
                         │                                             │
  Users ──────────────►  │  WAF → Zero Trust → Tunnel → Origin        │
                         │                                             │
                         │  Domains:                                   │
                         │  ├── auth.zeaz.dev          (identity)      │
                         │  ├── app.zeaz.dev            (zWallet)      │
                         │  ├── pay.zeaz.dev            (zPay)         │
                         │  ├── treasury.zeaz.dev       (finance)      │
                         │  ├── zveo.zeaz.dev           (AI platform)  │
                         │  ├── studio.zeaz.dev         (AI studio)    │
                         │  └── analytics.zeaz.dev      (analytics)    │
                         └─────────────────────────────────────────────┘
                                          │
                              Cloudflare Tunnel (cloudflared)
                                          │
                         ┌─────────────────────────────────────────────┐
                         │              Self-hosted origin             │
                         │  zeaz-platform (zeazdev@zeaz-platform)      │
                         └─────────────────────────────────────────────┘

Infrastructure-as-code: Terraform (HCL)
Secret management:      SOPS + age
CI/CD:                  GitHub Actions
Token lifecycle:        scripts/cloudflare/clean-and-regenerate-tokens.sh (wrapper)
```

### Platform layers

| Layer | Technology | Purpose |
|---|---|---|
| Identity | Cloudflare Access + SAML/OIDC | Zero Trust auth for all subdomains |
| Network | Cloudflare Tunnel (cloudflared) | Secure origin connectivity, no open ports |
| Compute | Cloudflare Workers + Workers AI | Edge functions, AI inference |
| Storage | R2 + KV + D1 | Object storage, key-value, SQLite at edge |
| Security | WAF + Bot Management + mTLS | Fintech-grade request filtering |
| IaC | Terraform + OpenTofu | Declarative, idempotent provisioning |
| Secrets | SOPS + age | Encrypted secrets, GitOps-safe |
| Observability | Grafana + Prometheus + Loki | Metrics, logs, dashboards |

---

## Prerequisites

| Tool | Minimum version | Install |
|---|---|---|
| bash | 4.0+ | macOS: `brew install bash` |
| curl | any | pre-installed on most systems |
| jq | 1.6+ | `apt install jq` / `brew install jq` |
| terraform | 1.5+ | https://developer.hashicorp.com/terraform/install |
| age | 1.1+ | `apt install age` / `brew install age` |
| sops | 3.8+ | https://github.com/getsops/sops/releases |
| shellcheck | 0.9+ | `apt install shellcheck` / `brew install shellcheck` |
| python3 | 3.10+ | https://python.org (for yaml-validate target) |
| pyyaml | any | `pip install pyyaml` |

> **Cloudflare account:** You need a Cloudflare account with `zeaz.dev` added as a zone.
> Use scoped API tokens for all operations; avoid Global API Key usage in automation.

---

## Quickstart

### 1. Clone and configure

```bash
git clone https://github.com/cvsz/cloudflare-platform.git
cd cloudflare-platform

cp .env.example .env
chmod 600 .env
```

Open `.env` and fill in every value. See [Environment variables](#environment-variables) for details.

### 2. Bootstrap the agent environment

```bash
source .env
make bootstrap-agent
```

This runs `scripts/ai/bootstrap-agent.sh` which validates your environment, checks API connectivity, and sets up local tooling.

### 3. Validate everything

```bash
make validate-agent        # check env vars and API token scopes
make terraform-validate    # init + validate all Terraform modules
make yaml-validate         # lint all .yml files
make shell-validate        # shellcheck all scripts
```

### 4. Provision infrastructure (phased)

Run phases in order. Each phase is independent and idempotent.

```bash
# Phase 1 — variables and context (no API calls)
# Ensure .env is fully populated.

# Phase 2 — Terraform foundation
terraform -chdir=terraform/environments/${ENVIRONMENT} init
terraform -chdir=terraform/environments/${ENVIRONMENT} plan -out=tfplan
terraform -chdir=terraform/environments/${ENVIRONMENT} apply tfplan

# Phase 3 — Zero Trust + Identity
# Configure SAML/OIDC providers via Terraform modules:
# terraform/modules/cloudflare-saml-provider/

# Phase 4 — DNS + Tunnels
# See tunnels/cloudflared/ for tunnel config files.

# Phase 5 — Workers + Edge
# Deploy workers via wrangler or Terraform cloudflare_worker_script resources.

# Phase 6 — Monitoring + DR
# See docs/ai/ for runbook references.
```

### 5. Manage API tokens

```bash
# Preview what would be revoked (safe — no API calls)
make token-clean

# Revoke duplicates + stale tokens
make token-rotate-dry      # dry run first
make token-rotate          # live run with backup
```

---

## Environment variables

Copy `.env.example` to `.env` and fill in every value before running any script or Terraform.

### Cloudflare core

| Variable | Required | Description |
|---|---|---|
| `CF_ACCOUNT_ID` | yes | Cloudflare account ID. Found in the dashboard URL. |
| `CF_ZONE_ID` | yes | Zone ID for `zeaz.dev`. Found in the zone overview page. |
| `CF_API_TOKEN` | yes | Scoped API token with Edit permissions for general Terraform use. |

### Scoped service tokens

| Variable | Required | Scope |
|---|---|---|
| `CF_DNS_TOKEN` | yes | Zone DNS Edit + Zone Read |
| `CF_ZT_TOKEN` | yes | Access Apps/Policies Edit + Identity Providers Edit |
| `CF_WORKERS_TOKEN` | yes | Workers Scripts Edit + Routes Edit + KV Edit + R2 Edit + D1 Edit |
| `CF_WAF_TOKEN` | yes | WAF Edit + Firewall Services Edit |
| `CF_TUNNEL_TOKEN` | yes | Cloudflare Tunnel Edit |
| `CF_R2_TOKEN` | yes | R2 Storage Edit |
| `CF_AUDIT_TOKEN` | no | Account Audit Logs Read. Required for `.mcp.json` log MCP server. |

Regenerate all tokens with:
```bash
make token-rotate
```

### Identity provider

| Variable | Required | Description |
|---|---|---|
| `IDENTITY_PROVIDER_TYPE` | yes | `saml` or `oidc` |
| `IDENTITY_PROVIDER_VENDOR` | yes | e.g. `okta`, `azure`, `google`, `authentik` |
| `IDENTITY_PROVIDER_METADATA_URL` | yes | SAML metadata URL or OIDC discovery URL |

### Infrastructure

| Variable | Required | Description |
|---|---|---|
| `ENVIRONMENT` | yes | `dev`, `staging`, or `prod` |
| `REGION` | yes | Primary region, e.g. `ap-southeast-1` |
| `PRIMARY_DOMAIN` | yes | `zeaz.dev` |
| `ORIGIN_INFRA_TYPE` | yes | `vm`, `kubernetes`, `serverless`, or `hybrid` |
| `ORIGIN_HOSTS` | yes | Comma-separated origin IPs or hostnames |
| `CLOUDFLARE_PLAN_TIER` | yes | `Free`, `Pro`, `Business`, or `Enterprise` |

### Terraform backend

| Variable | Required | Description |
|---|---|---|
| `TERRAFORM_BACKEND_TYPE` | yes | `s3` or `local` |
| `TERRAFORM_STATE_BUCKET` | yes | Bucket name for remote state |
| `TERRAFORM_LOCK_TABLE` | yes | DynamoDB table name (if `s3` backend) |

### Secret management

| Variable | Required | Description |
|---|---|---|
| `SOPS_AGE_KEY` | yes | age private key for SOPS decryption. Keep this secret. |
| `SECRET_ROTATION_INTERVAL` | no | Days between scheduled rotations. Default: `90` |
| `CF_AI_GATEWAY_SLUG` | no | AI Gateway slug for `.mcp.json` MCP server |

---

## Repository structure

```
cloudflare-platform/
├── .claude/                    # Claude AI agent context + system prompt
├── .codex/                     # OpenAI Codex agent context
├── .cursor/                    # Cursor IDE AI context
├── .github/
│   ├── workflows/              # GitHub Actions CI/CD pipelines
│   └── SECURITY.md             # Vulnerability reporting policy
├── docs/
│   └── ai/                     # AI platform documentation
├── scripts/
│   ├── ai/
│   │   ├── bootstrap-agent.sh  # Environment bootstrap and validation
│   │   └── validate-agent-env.sh
│   └── cloudflare/
│       └── clean-and-regenerate-tokens.sh  # Token lifecycle management
├── terraform/                  # All Terraform/OpenTofu modules and roots
├── tunnels/
│   └── cloudflared/            # cloudflared tunnel configuration files
├── .env.example                # Template for all required env vars
├── .gitignore                  # Excludes secrets, state, binaries
├── .mcp.json                   # MCP server config (Cloudflare API, AI Gateway, Logs)
├── AGENTS.md                   # Master meta-prompt — full platform specification
├── LICENSE                     # MIT
├── Makefile                    # All runnable targets
└── README.md                   # This file
```

---

## Makefile targets

```bash
make bootstrap-agent        # bootstrap environment and validate prerequisites
make validate-agent         # validate all env vars and API token scopes

make terraform-fmt          # format all Terraform files recursively
make terraform-validate     # init (no backend) + validate all modules
make yaml-validate          # lint all .yml files with PyYAML
make shell-validate         # shellcheck scripts/ai/ and scripts/cloudflare/

make token-clean            # dry-run: show duplicate/stale tokens (no API calls)
make token-rotate-dry       # dry-run: full rotate flow with backup preview
make token-rotate           # live: backup → revoke duplicates/stale → regenerate all
```

---

## Token management

This repo includes a production-ready token lifecycle script at `scripts/cloudflare/clean-and-regenerate-tokens.sh`.

### What it does

- Finds and revokes **duplicate tokens** (keeps the newest N per name)
- Finds and revokes **stale tokens** unused for more than N days
- **Regenerates** fresh scoped tokens for each service
- Writes new values **atomically** to `.env.cloudflare` (mode 600)
- Records all actions to `.cloudflare-token-audit.log` (no secrets in log)
- Checks quota before creating (Cloudflare limit: 50 tokens per account)

### Recommended workflow

```bash
# 1. Always dry-run first
CF_EMAIL=you@example.com CF_GLOBAL_API_KEY=xxxx \
  bash scripts/cloudflare/clean-and-regenerate-tokens.sh \
    --keep-most 1 --unused-days 90 --dry-run

# 2. Backup and revoke interactively
CF_EMAIL=you@example.com CF_GLOBAL_API_KEY=xxxx \
  bash scripts/cloudflare/clean-and-regenerate-tokens.sh \
    --keep-most 1 --unused-days 90 --backup

# 3. Full rotate: revoke + regenerate all + write env
CF_EMAIL=you@example.com CF_GLOBAL_API_KEY=xxxx \
  bash scripts/cloudflare/clean-and-regenerate-tokens.sh \
    --keep-most 1 --unused-days 90 --backup --yes \
    --regenerate --types all --write .env.cloudflare
```

> **Security note:** `CF_GLOBAL_API_KEY` appears in shell history. Consider wrapping the above in a script that reads from a password manager or `read -rs`.

---

## Deployment phases

| Phase | Scope | Key resources |
|---|---|---|
| F1 | Context + Variables | `.env` validation, prerequisite checks |
| F2 | Terraform Foundation | Provider config, account-level resources |
| F3 | Zero Trust + Identity | Access apps, policies, SAML/OIDC providers, RBAC |
| F4 | DNS + Tunnels + Networking | DNS records, cloudflared tunnels, routing |
| F5 | Workers + Edge + AI | Worker scripts, KV namespaces, R2 buckets, D1 databases, AI Gateway |
| F6 | Monitoring + DR + Security | WAF rules, dashboards, alert policies, backup schedules |

Each phase supports partial execution. Run `terraform plan -target=module.<name>` to scope to a single module.

---

## Security

- **Never commit secrets.** `.gitignore` excludes `.env`, `*.tfvars`, `*.pem`, `*.agekey`, and backup directories.
- **Rotate the Global API Key** immediately after any token rotation run.
- **Scoped tokens only** for all automated operations. The Global API Key is used exclusively by the token lifecycle script.
- **SOPS + age** for all secret files that must be committed (e.g. `terraform.tfvars.enc`).
- **Audit log** at `.cloudflare-token-audit.log` records every token action. Contains no secret values.
- **Mode 600** enforced on `.env.cloudflare` and all backup files.

To report a security issue or leaked credential, see [`.github/SECURITY.md`](.github/SECURITY.md).

---

## Contributing

1. Fork the repo and create a feature branch from `main`.
2. Run `make shell-validate` and `make terraform-validate` before opening a PR.
3. Never commit real credentials, token values, or `.tfstate` files.
4. Reference the full platform specification in [`AGENTS.md`](AGENTS.md) for architectural decisions.

---

*Built for ZeazDev · Licensed under MIT · See [AGENTS.md](AGENTS.md) for the full platform specification.*


## Phased deployment (F1-F6)

- F1: Context + Variables (`bash scripts/validate.sh --offline --strict`)
- F2: Terraform Foundation
- F3: Zero Trust + Identity
- F4: DNS + Tunnels + Networking
- F5: Workers + Edge + AI
- F6: Monitoring + DR + Security


## Plan Matrix

| Feature | Free | Pro | Business | Enterprise |
|---|---:|---:|---:|---:|
| Core DNS/Tunnel/Access | ✅ | ✅ | ✅ | ✅ |
| API Shield | ❌ | ❌ | ❌ | ✅ |
| Device Posture | ❌ | ❌ | ❌ | ✅ |
| Bot Management Advanced | ❌ | ❌ | ❌ | ✅ |

## Phased Deployment

Deploy with `enabled_phases` (`F1`..`F6`) per environment root in `terraform/environments/*` and `opentofu/environments/*`.

## Rollback

Use saved Terraform/OpenTofu plans for controlled rollback, or run `terraform destroy`/`tofu destroy` only with explicit `CONFIRM_APPLY=yes` in non-production recovery windows. Operational rollback runbooks are in `docs/runbooks/`.

## Security Model

Least-privilege token separation is enforced (`CF_DNS_TOKEN`, `CF_ZT_TOKEN`, `CF_WORKERS_TOKEN`, `CF_WAF_TOKEN`, `CF_TUNNEL_TOKEN`, `CF_R2_TOKEN`), with policy-as-code in `policies/`, WAF controls in `waf/`, and Zero Trust identity definitions in `zero-trust/`.

## GitOps Workflow

1. Commit reviewed IaC and policy changes.
2. Run `make validate`, `make test`, `make tf-validate`, and `make tofu-validate`.
3. Open PR and require CI approval checks before merge.
4. Apply per phase/environment from audited pipelines.

## Setup

See **Quickstart** above for bootstrap, validation, and phased apply commands.
