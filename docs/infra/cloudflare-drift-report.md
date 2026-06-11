# Cloudflare Configuration Drift Report — Phase 5

## Summary

| Metric | Phase 4 | Phase 5 | Change |
|---|---|---|---|
| Config files inventoried | 13 | 13 | No change |
| Secret files tracked in git | 1 (creds.json, assumed) | **0** | False positive corrected — creds.json was never committed |
| Hardcoded tunnel IDs found | 2 files | **2 files** (infrastructure/cloudflare/, apps/zLinebot/) | No new hardcodes |
| Hardcoded credentials paths | 2 files | **2 files** | Unchanged (Phase 4 partially fixed ingress.yml) |
| Duplicate hostnames across configs | 20 hostnames | **20 hostnames** | No new duplicates |
| DNS ownership conflicts (TF modules) | Not tracked | **3** | New: TC, TA, TZ overlap |
| Live tunnel vs repo alignment | Not tracked | **Complete mismatch** | Live config (8 hostnames) vs repo (all different) |

## Phase 5 Actions Completed

### ✅ Credential Containment

- Verified `infra/cloudflare/creds.json` was **never committed** to git history
- Already covered by `.gitignore` patterns
- Added `infra/cloudflare/examples/creds.example.json` with placeholder values
- Created `docs/infra/cloudflare-secret-containment-plan.md`
- Created `infra/cloudflare/scripts/check-secret-leaks.sh`
- Updated `.gitignore` with additional secret patterns

### ✅ DNS Ownership Mapping

- Created `docs/infra/cloudflare-dns-ownership-matrix.md` — 41 hostnames across 12+ sources
- Created `docs/infra/cloudflare-dns-consolidation-plan.md`
- Created `infra/cloudflare/scripts/scan-dns-ownership.sh`
- Identified **3 overlapping Terraform modules** managing DNS records
- Identified **20 duplicate hostnames** across sources

### ✅ Remaining Hardcoded Config Files

| File | Issue | Severity |
|---|---|---|
| `infrastructure/cloudflare/config.yml` | Hardcoded tunnel name `zeaz-platform` | Medium |
| `apps/zLinebot/cloudflared/config.yml` | Hardcoded tunnel name `zlinebot` | Low |
| `tunnels/cloudflared/config.yml` | Empty tunnel name, malformed cred path | Low |

### ✅ Duplicate Hostname Count: 20

### Top 10 Duplicated Hostnames

| Hostname | Duplicates | Sources | Risk |
|---|---|---|---|
| `app.zeaz.dev` | 8 | L, TA, T1, T2, T3, T4, I1, IS | HIGH |
| `zveo.zeaz.dev` | 7 | L, TA, T1, T3, T4, I1, IS | HIGH |
| `zcino.zeaz.dev` | 5 | TA, TZ, T1, I1, IS | HIGH |
| `api.zeaz.dev` | 5 | TC, T1, T3, T4, I2 | HIGH |
| `auth.zeaz.dev` | 5 | TC, T1, T3, T4, I2 | HIGH |
| `grafana.zeaz.dev` | 4 | TC, T1, T3, I2 | MEDIUM |
| `loki.zeaz.dev` | 4 | TC, T1, T3, I2 | MEDIUM |
| `ztrader.zeaz.dev` | 3 | TA, I1, IS | MEDIUM |
| `zcfdash.zeaz.dev` | 3 | TA, I1, IS | MEDIUM |
| `admin-wallet.zeaz.dev` | 3 | L, T2, T4 | MEDIUM |

### Terraform Overlap Risks

- `terraform/cloudflare` (TC) defines 13 subdomains as tunnel CNAME records
- `terraform/cloudflare-apps` (TA) defines 20 app routes with port mappings
- `terraform/zdash` (TZ) defines 4 records that overlap with TA
- `release.zeaz.dev` and `zcino.zeaz.dev` are managed by both TA and TZ
- **7 TC subdomains** have no tunnel ingress rule — will return 404

### Live Tunnel vs Repo

The live tunnel (`ef0355dd`, token-based at `/etc/cloudflared/config.yml`) is **completely different** from all repo configs:

- 8 hostnames in live config (office, zveo, cctv, api.zveo, app, admin-wallet, zcloud, ztest)
- No matching port scheme with any repo file
- Repo files reference Docker service names, .internal hosts, or different port ranges

## Recommendations by Severity

### HIGH
1. Resolve Terraform module overlap (TC → TA consolidation)
2. Add DNS records for live-only hostnames (office, admin-wallet)
3. Add tunnel ingress rules for TC-only hostnames (panel, agents, risk, memory, etc.)

### MEDIUM
1. Convert remaining hardcoded tunnel names to env var placeholders
2. Resolve `release.zeaz.dev` ownership between TA and TZ
3. Resolve `zcino.zeaz.dev` origin port conflicts (3 variants)
4. Clean up stale tunnel configs after operator verification

### LOW
1. Create canonical `infra/cloudflare/config/domains.yml` with full inventory
2. Add canonical `infra/cloudflare/config/tunnels.yml` matching live config
3. Remove orphaned credential file `22bd858b` from disk

## Phase 6 Recommendation

**Phase 6 — Workers/Wrangler Route Ownership Cleanup**

Resolve:
- Worker route vs DNS CNAME conflicts (www.zeaz.dev)
- Placeholder KV/DO IDs in wrangler.toml files
- Inline JWT_SECRET and API token references
- Wrangler route overlap with tunnel ingress hostnames
- Duplicate `wrangler.toml` across examples and active configs
