# Cloudflare DNS Consolidation Plan

## Current State

| Source | Hostnames | Managed By | Status |
|---|---|---|---|
| Live `/etc/cloudflared/config.yml` | 8 | Operator runtime | Active, single source of truth for routing |
| `terraform/cloudflare-apps/apps.auto.tfvars.json` | 20 | Terraform cloudflare-apps | Most complete app route inventory |
| `terraform/cloudflare/main.tf` | 13 subdomains | Terraform cloudflare | Generic tunnel CNAME records |
| `terraform/zdash/main.tf` | 4 records | Terraform zdash | Overlaps with TA |
| `workers/zeaz-loading/wrangler.toml` | 1 route | Wrangler | Worker route, conflicts with CNAME |
| `infra/cloudflare/config.yml` (repo) | 12 | Stale IaC | Phase 2 canonical reference |
| `infra/cloudflare/ingress.yml` (repo) | 11 | Stale IaC | Different tunnel stack |
| Other tunnel configs | Various | Stale | Legacy/reference only |

### Problems

- **3 Terraform modules** managing DNS records for overlapping hostnames
- **41 unique hostnames** across all sources, **20 hostnames duplicated** in 2+ sources
- **7 TC subdomains** have no live tunnel ingress → return 404
- **3 different origin ports** for `app.zeaz.dev` (3000, 3003, Docker)
- **Live config** diverges completely from all repo configs

## Target State

```text
infra/cloudflare/
  config/
    domains.yml      — Human-readable domain inventory (all 41 hostnames)
    dns.yml           — Canonical DNS record definitions
    tunnels.yml       — Canonical tunnel ingress rules
  scripts/
    scan-dns-ownership.sh    — Read-only DNS ownership scanner
    scan-tunnel-configs.sh   — Read-only tunnel config scanner
    check-secret-leaks.sh    — Secret leak detection
    validate-cloudflare-config.sh  — Combined validator
    compare-dns.sh           — Live DNS comparison (Phase 3)
    compare-tunnel.sh        — Live tunnel comparison (Phase 3)

terraform/
  cloudflare-apps/    — Canonical Terraform DNS module (single source)
  cloudflare/         — Legacy, migrate to cloudflare-apps or retire
  zdash/              — Legacy, migrate zdash/zzdash records to cloudflare-apps

tunnels/              — Reference only, no active Terraform management
infrastructure/       — Legacy, retire after verification
```

## Source-of-Truth Decision

| Layer | Source of Truth | Execution Layer |
|---|---|---|
| Which hostnames exist | `infra/cloudflare/config/domains.yml` | Human-edited inventory |
| What DNS records to create | `infra/cloudflare/config/dns.yml` | Terraform cloudflare-apps |
| What tunnel ingress rules | Live `/etc/cloudflared/config.yml` | Operator / cloudflared |
| Worker routes | `workers/*/wrangler.toml` | Wrangler deploy |

**Primary Terraform module**: `terraform/cloudflare-apps` for all app CNAME records.
**Legacy modules** (`terraform/cloudflare`, `terraform/zdash`): consolidate into cloudflare-apps, then retire.

## No-Cost Policy

- No changes to live Cloudflare state from this plan
- All work is documentation, validation, and scripting
- Operator must manually execute any mutation after review

## No-Mutation Migration Sequence

```text
Step 1: Phase 5 (this phase) — Document, inventory, scan. No mutations.
Step 2: Operator reviews matrix and approves canonical sources.
Step 3: Consolidate TZ (zdash) records into TA (cloudflare-apps) tfvars.
Step 4: Merge TC (cloudflare) subdomains into TA or retire.
Step 5: Delete redundant Terraform modules.
Step 6: Remove stale tunnel configs from repo.
Step 7: Update live tunnel config to match canonical dns.yml.
Step 8: Run compare-dns.sh to verify live matches canonical.
```

## DNS Ownership Rules

```text
1. Every hostname has exactly one canonical Terraform source.
2. The canonical TF source is terraform/cloudflare-apps (TA).
3. No TF module may modify a DNS record owned by another module.
4. Worker routes (wrangler.toml) are exempt from TF ownership.
5. The live tunnel ingress file is the runtime source of truth for routing.
6. Every hostname in the live config must have a DNS record in TA.
7. Every hostname in TA must have a tunnel ingress rule (or documented exception).
```

## Terraform/OpenTofu Ownership Rules

```text
Current modules that manage DNS:

Module              Hostnames                 Future
──────              ─────────                 ──────
cloudflare-apps     20 app routes             ✅ KEEP (canonical)
cloudflare          13 subdomains             ⛔ CONSOLIDATE into cloudflare-apps
zdash               4 records                 ⛔ CONSOLIDATE into cloudflare-apps

After consolidation:

Module              Hostnames                 Notes
──────              ─────────                 ─────
cloudflare-apps     All 41 hostnames          Single module, single apply
wrangler            www.zeaz.dev              Separate worker deploy
```

## Manual Operator Checklist

- [ ] Review `docs/infra/cloudflare-dns-ownership-matrix.md`
- [ ] Decide canonical origin ports for overdefined hostnames (app, zveo, zcino, etc.)
- [ ] Resolve `release.zeaz.dev` conflict between TA and TZ
- [ ] Add DNS records for live-only hostnames (office, admin-wallet, ztest)
- [ ] Add tunnel ingress rules for TC-only hostnames (panel, agents, risk, etc.)
- [ ] Clean up stale tunnel configs after operator confirmation
- [ ] Run `compare-dns.sh --live` to verify against Cloudflare API

## Verification

```bash
# Run DNS ownership scanner
infra/cloudflare/scripts/scan-dns-ownership.sh --strict

# Compare tunnel configs
infra/cloudflare/scripts/compare-tunnel.sh

# Run validator
infra/cloudflare/scripts/validate-cloudflare-config.sh --check
```

## Rollback Plan

All Phase 5 changes are additive (documentation + scripts). Rollback is:

```bash
git revert <commit-sha>
```

For Terraform consolidation (future phase), rollback is:

```bash
# Restore previous module structure
git checkout main -- terraform/
terraform apply          # after operator review
```
