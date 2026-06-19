# Paid Upgrade Options

## Overview

The ZeaZ Platform is designed to run fully on local infrastructure with **zero recurring cost**. Terraform/OpenTofu state is stored locally, all validation runs offline, and local development requires no paid services.

The options documented here are **completely optional** upgrades that add convenience, team collaboration, or production-grade resilience. Start local, and only adopt paid services when your team scale or operational requirements justify the cost.

---

## S3 + DynamoDB State Locking

**Service:** AWS S3 (state storage) + DynamoDB (state locking)
**Cost:** ~$0.50/month at low usage
**Purpose:** Remote state with team-safe locking

- Stores `terraform.tfstate` in an S3 bucket
- DynamoDB prevents concurrent state modifications
- Enables CI/CD pipelines to run Terraform/OpenTofu safely

**Setup:** See [backend.s3.example.tf](../../terraform/backend.s3.example.tf)

**When to upgrade:**
- Multiple people running Terraform from different machines
- CI/CD pipelines that need to read/write state
- Need state versioning and rollback via S3 object versioning

---

## Cloudflare R2 (S3-compatible) State Backend

**Service:** Cloudflare R2
**Cost:** Free tier (10GB storage, 1M reads/month); negligible beyond that
**Purpose:** Remote state without AWS dependency

- Uses S3-compatible API — Terraform/OpenTofu treats it as an S3 backend
- Zero egress fees
- No DynamoDB-style locking (falls back to local locking)

**Setup:** See [backend.r2.example.tf](../../terraform/backend.r2.example.tf)

**When to upgrade:**
- Already using Cloudflare and want to stay in-ecosystem
- Want remote state without managing AWS IAM
- Small team where concurrent state conflicts are rare

---

## Terraform Cloud / OpenTofu Cloud

**Service:** HashiCorp Terraform Cloud or OpenTofu Cloud
**Cost:** Free tier (5 users, 500 resources); paid tiers for larger orgs
**Purpose:** Managed remote state, runs, and policy enforcement

- Built-in state storage and locking
- Remote runs with full audit trail
- Sentinel/OPA policy enforcement
- VCS integration with PR-driven plan comments

**When to upgrade:**
- Team of 3+ infrastructure engineers
- Need policy-as-code gates before apply
- Want VCS-driven plan/apply workflow without self-hosting

---

## Grafana Cloud

**Service:** Grafana Cloud (hosted metrics, logs, dashboards)
**Cost:** Free tier (10k series, 50GB logs); paid from ~$50/month
**Purpose:** Production observability without self-hosting

- Hosted Prometheus, Loki, Tempo, and Grafana
- Pre-built dashboards for Cloudflare, Terraform, infrastructure
- Alerting with Slack/PagerDuty/webhook integration

**When to upgrade:**
- Running production workloads that need 24/7 monitoring
- Want centralized logs without running Loki yourself
- Need SLO/SLI tracking and alerting

---

## Better Stack / Datadog

**Service:** Better Stack (lightweight) or Datadog (full-featured)
**Cost:** Better Stack free tier available; Datadog from ~$15/host/month
**Purpose:** Infrastructure monitoring, APM, and incident management

**Better Stack:**
- Uptime monitoring, status pages, log management
- Generous free tier for small deployments
- Simple incident response workflows

**Datadog:**
- Full APM, infrastructure monitoring, log management
- Cloudflare integration for worker/edge observability
- More expensive but more powerful

**When to upgrade:**
- Need APM and request tracing
- Running microservices that need distributed tracing
- Want integrated incident response and status pages

---

## Secrets Management

**Service:** 1Password CLI, Doppler, or HashiCorp Vault
**Cost:** Variable (1Password ~$5/user/month; Doppler free tier; Vault free self-hosted)
**Purpose:** Centralized secrets management beyond `.env` files

- 1Password CLI: good for small teams using 1Password already
- Doppler: purpose-built for environment variable management
- HashiCorp Vault: full-featured, self-hosted option

**When to upgrade:**
- More than 2-3 people need access to the same secrets
- Need audit trails on secret access
- Want automatic secret rotation

---

## Remote Backup Storage

**Service:** S3, R2, Backblaze B2, or similar
**Cost:** Typically < $1/month for state backups
**Purpose:** Off-site backup of Terraform state and critical configs

- Automated nightly backups of state snapshots
- Geo-redundant storage for disaster recovery
- Enables restore from known-good state

**When to upgrade:**
- State loss would cause significant recovery time
- Need off-site backup for compliance
- Want automated backup verification

---

## Cost Comparison Table

| Service | Approximate Monthly Cost | Purpose |
|---|---|---|
| **Local only** (no upgrade) | **$0.00** | Everything works locally |
| S3 + DynamoDB | ~$0.50 | Team state locking |
| Cloudflare R2 | ~$0.00 (free tier) | Remote state without AWS |
| Terraform Cloud Free | $0.00 | Managed runs (up to 500 resources) |
| Terraform Cloud Team | ~$20/user | Policy + team runs |
| Grafana Cloud Free | $0.00 | Basic monitoring (10k series) |
| Grafana Cloud Pro | ~$50+ | Production monitoring |
| Datadog | ~$15/host | Full APM + infrastructure |
| Better Stack | $0–$30 | Uptime + logs + incidents |
| 1Password CLI | ~$5/user | Secrets management |
| Doppler | $0–$20 | Env var management |
| Vault (self-hosted) | $0 (infra cost) | Secrets management |

---

## Recommendation

| Scenario | Recommended Setup |
|---|---|
| Solo developer, local only | Local state, no paid services |
| 2–3 person team, same office | R2 state backend + Doppler for secrets |
| 2–3 person team, remote | R2 or Terraform Cloud Free + Grafana Cloud Free |
| 5+ person platform team | Terraform Cloud Team + Datadog or Grafana Cloud Pro + Vault or Doppler |
| Production workloads | Remote state (S3 or R2) + monitoring + backup storage |

**Start local. Add services deliberately. Only pay for what your team actually needs.**

---

## See Also

- [Rescue Tags](./rescue-tags.md)
- [Terraform Backend Examples](../../terraform/backend.local.example.tf)
- [Backup Script](../../scripts/backup/local-state-backup.sh)
