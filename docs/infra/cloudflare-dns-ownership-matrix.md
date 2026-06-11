# Cloudflare DNS Ownership Matrix

Complete hostname inventory across all config sources: live tunnel, Terraform, tunnel files, wrangler routes.

## Source Key

| Source | Type | Hostnames |
|---|---|---|
| **L** = Live `/etc/cloudflared/config.yml` | Runtime tunnel ingress | 8 |
| **TA** = `terraform/cloudflare-apps/apps.auto.tfvars.json` | Terraform DNS records | 20 |
| **TC** = `terraform/cloudflare/main.tf` | Terraform DNS records | 13 |
| **TZ** = `terraform/zdash/main.tf` | Terraform DNS records | 4 |
| **WL** = `workers/zeaz-loading/wrangler.toml` | Worker route | 1 |
| **T1** = `tunnels/cloudflared/config.yml` | Reference tunnel config | 11 |
| **T2** = `tunnels/cloudflared/zeaz-platform.yml` | Reference tunnel config | 5 |
| **T3** = `tunnels/config/config.yml` | Reference tunnel config | 11 |
| **T4** = `tunnels/config.yaml` | Abstract reference config | 11 |
| **I1** = `infra/cloudflare/config.yml` | Repo tunnel config (Phase 2) | 12 |
| **I2** = `infra/cloudflare/ingress.yml` | Repo tunnel config (Phase 2) | 11 |
| **IS** = `infrastructure/cloudflare/config.yml` | Legacy tunnel config | 12 |

## Matrix

| # | Hostname | App/Service | L | TA | TC | TZ | WL | T1 | T2 | T3 | T4 | I1 | I2 | IS | Dups | Status | Action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `zeaz.dev` | root landing | | ✅ | | | | ✅ | | ✅ | ✅ | | | | 3 | active | Keep TA as source |
| 2 | `www.zeaz.dev` | landing | | ✅ | | | ✅ | | | | ✅ | | | | 3 | active | Move TA to canonical |
| 3 | `app.zeaz.dev` | web ui | ✅ | ✅ | | | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | | ✅ | 8 | **overdefined** | Pick TA (3003) as canonical |
| 4 | `zveo.zeaz.dev` | zveo ai | ✅ | ✅ | | | | ✅ | ✅ | ✅ | ✅ | ✅ | | ✅ | 7 | **overdefined** | Pick TA (3002) as canonical |
| 5 | `api-zveo.zeaz.dev` | zveo api | ✅ | ✅ | | | | | | | | | | | 2 | defined | Live matches TA |
| 6 | `cctv.zeaz.dev` | cctv | ✅ | ✅ | | | | | | | | | | | 2 | defined | Live matches TA |
| 7 | `admin-wallet.zeaz.dev` | admin-wallet | ✅ | | | | | | ✅ | ✅ | | | | | 3 | defined | Add TA record |
| 8 | `zcloud.zeaz.dev` | zcloud | ✅ | ✅ | | | | | | | ✅ | | | | 3 | defined | Live matches TA |
| 9 | `ztest.zeaz.dev` | zsp-aitool | ✅ | ✅ | | | | | | | | | | | 2 | defined | Live matches TA |
| 10 | `office.zeaz.dev` | office | ✅ | | ✅ | | | | | | | | | | 2 | defined | Add TA record |
| 11 | `studio.zeaz.dev` | studio | | ✅ | | | | | | | ✅ | | | | 2 | defined | TA only |
| 12 | `zdash.zeaz.dev` | zdash | | ✅ | | | | | ✅ | | | | | | 2 | defined | TA only |
| 13 | `api-zdash.zeaz.dev` | zdash api | | ✅ | | | | | | | | | | | 1 | defined | TA only |
| 14 | `release.zeaz.dev` | release | | ✅ | | ✅ | | | | | | | | | 2 | **overdefined** | Merge TA+TZ |
| 15 | `zkbtrader.zeaz.dev` | zkbtrader | | ✅ | | | | | | | ✅ | | | | 2 | defined | TA only |
| 16 | `ztrader.zeaz.dev` | ztrader | | ✅ | | | | | | | | ✅ | | ✅ | 3 | **overdefined** | Pick TA (3016) |
| 17 | `zcino.zeaz.dev` | zcino | | ✅ | | ✅ | | ✅ | | | | ✅ | | ✅ | 5 | **overdefined** | Pick TA (3000) |
| 18 | `zcfdash.zeaz.dev` | zcfdash | | ✅ | | | | | | | | ✅ | | ✅ | 3 | **overdefined** | Pick TA (3003) |
| 19 | `api-zcfdash.zeaz.dev` | zcfdash api | | ✅ | | | | | | | | ✅ | | ✅ | 3 | **overdefined** | Pick TA (8088) |
| 20 | `api-ztrader.zeaz.dev` | ztrader api | | ✅ | | | | | | | | | | | 1 | defined | TA only |
| 21 | `ssh.zeaz.dev` | ssh tunnel | | ✅ | | | | | | | | | | | 1 | defined | TA only |
| 22 | `zzdash.zeaz.dev` | zdash frontend | | | | ✅ | | | | | | | | | 1 | defined | TZ only |
| 23 | `api-zzdash.zeaz.dev` | zdash api | | | | ✅ | | | | | | | | | 1 | defined | TZ only |
| 24 | `panel.zeaz.dev` | panel | | | ✅ | | | | | | | | ✅ | | 2 | defined | TC + I2 |
| 25 | `api.zeaz.dev` | api gateway | | | ✅ | | | ✅ | | ✅ | ✅ | | ✅ | | 5 | **overdefined** | Pick TC (tunnel CNAME) |
| 26 | `auth.zeaz.dev` | authentik | | | ✅ | | | ✅ | | ✅ | ✅ | | ✅ | | 5 | **overdefined** | Pick TC (tunnel CNAME) |
| 27 | `grafana.zeaz.dev` | grafana | | | ✅ | | | ✅ | | ✅ | | | ✅ | | 4 | **overdefined** | Pick TC (tunnel CNAME) |
| 28 | `loki.zeaz.dev` | loki | | | ✅ | | | ✅ | | ✅ | | | ✅ | | 4 | **overdefined** | Pick TC (tunnel CNAME) |
| 29 | `prometheus.zeaz.dev` | prometheus | | | ✅ | | | | | | | | ✅ | | 2 | defined | TC + I2 |
| 30 | `trader.zeaz.dev` | trader | | | ✅ | | | | | | | | ✅ | | 2 | defined | TC + I2 |
| 31 | `ws.trader.zeaz.dev` | trader ws | | | ✅ | | | | | | | | ✅ | | 2 | defined | TC + I2 |
| 32 | `risk.zeaz.dev` | risk engine | | | ✅ | | | | | | | | ✅ | | 2 | defined | TC + I2 |
| 33 | `memory.zeaz.dev` | memory engine | | | ✅ | | | | | | | | ✅ | | 2 | defined | TC + I2 |
| 34 | `agents.zeaz.dev` | ai coordinator | | | ✅ | | | | | | | | ✅ | | 2 | defined | TC + I2 |
| 35 | `fcc.zeaz.dev` | fcc | | | ✅ | | | ✅ | | | | | | | 2 | defined | TC + T1 |
| 36 | `zow.zeaz.dev` | zow | | | | | | | | | | ✅ | | ✅ | 2 | defined | I1 + IS |
| 37 | `zaiz.zeaz.dev` | zaiz | | | | | | | | | | ✅ | | ✅ | 2 | defined | I1 + IS |
| 38 | `zsticker.zeaz.dev` | zsticker | | | | | | | | | | ✅ | | ✅ | 2 | defined | I1 + IS |
| 39 | `zlms.zeaz.dev` | zlms | | | | | | | | | | ✅ | | ✅ | 2 | defined | I1 + IS |
| 40 | `dash.zeaz.dev` | dash | | | | | | | | | | ✅ | | ✅ | 2 | defined | I1 + IS |
| 41 | `zoffice.zeaz.dev` | zoffice (alt) | | ✅ | | | | | | | | ✅ | | ✅ | 3 | **overdefined** | Check if zoffice=ZOFFICE |

## Duplicate Hostname Summary

| Hostname | Config Sources | Duplicates | Risk |
|---|---|---|---|
| `app.zeaz.dev` | L, TA, T1, T2, T3, T4, I1, IS | **8** | **HIGH** — 8 different files define this hostname, 3 different origins (3000, 3003, Docker) |
| `zveo.zeaz.dev` | L, TA, T1, T3, T4, I1, IS | **7** | **HIGH** — 4 different origins (3002, 8787, .internal, localhost:80) |
| `zcino.zeaz.dev` | TA, TZ, T1, I1, IS | **5** | **HIGH** — 3 different origins (3000, localhost:3000, localhost:80) |
| `api.zeaz.dev` | TC, T1, T3, T4, I2 | **5** | **HIGH** — tunnel CNAME, Docker, .internal, multiple mismatches |
| `auth.zeaz.dev` | TC, T1, T3, T4, I2 | **5** | **HIGH** — tunnel CNAME, Docker:9443, .internal, Docker:9090 |
| `grafana.zeaz.dev` | TC, T1, T3, I2 | **4** | **MEDIUM** — tunnel CNAME, Docker:3000/3010 |
| `loki.zeaz.dev` | TC, T1, T3, I2 | **4** | **MEDIUM** — tunnel CNAME, Docker:3100 |
| `ztrader.zeaz.dev` | TA, I1, IS | **3** | **MEDIUM** — 3016 vs 4106 vs 80 |
| `zcfdash.zeaz.dev` | TA, I1, IS | **3** | **MEDIUM** — 3003 vs 4103 vs 80 |
| `admin-wallet.zeaz.dev` | L, T2, T4 | **3** | **MEDIUM** — 8081 vs Docker |

## Terraform Ownership Conflicts

### terraform/cloudflare (TC) vs terraform/cloudflare-apps (TA)

| Hostname | TC | TA | Conflict |
|---|---|---|---|
| `office.zeaz.dev` | ✅ (CNAME → tunnel) | — | No conflict, TC only |
| `api.zeaz.dev` | ✅ (CNAME → tunnel) | — | TC only |
| `auth.zeaz.dev` | ✅ (CNAME → tunnel) | — | TC only |
| `panel.zeaz.dev` | ✅ (CNAME → tunnel) | — | TC only |
| `app.zeaz.dev` | — | ✅ (CNAME→tunnel, port 3003) | TA handles `app` via app routes |
| `zveo.zeaz.dev` | — | ✅ (CNAME→tunnel, port 3002) | TA handles `zveo` via app routes |

TC defines 13 generic subdomains (CNAME → tunnel). TA defines 20 app-specific routes with explicit port mappings. These two modules will conflict if applied together for the same hostname — Terraform would try to manage the same DNS record from two places.

### terraform/cloudflare-apps (TA) vs terraform/zdash (TZ)

| Hostname | TA | TZ | Conflict |
|---|---|---|---|
| `release.zeaz.dev` | ✅ (CNAME→tunnel) | ✅ (CNAME→tunnel) | Two modules managing same record |
| `zcino.zeaz.dev` | ✅ (CNAME→tunnel, port 3000) | ✅ (CNAME→tunnel) | TA has origin info, TZ duplicates |

## Wrangler Route Conflicts

| Hostname | Worker Route | Tunnel Ingress | Conflict |
|---|---|---|---|
| `www.zeaz.dev` | `zeaz-loading` Worker | (not in live tunnel, in TA+T4) | Worker handles `www.zeaz.dev/*`, TA has CNAME record. Could conflict if both are applied. |

## Live Config Only

These hostnames exist in the live tunnel `/etc/cloudflared/config.yml` but have **no Terraform DNS record**:

- `office.zeaz.dev` (TC has it, but different purpose)
- `admin-wallet.zeaz.dev` (defined in TA?)
- `ztest.zeaz.dev` (defined in TA)

## Terraform Only (No Live Tunnel Ingress)

These hostnames have TF records but no tunnel ingress rule — they resolve through the tunnel but have no routing target:

- `panel.zeaz.dev` (TC)
- `trader.zeaz.dev` (TC)
- `ws.trader.zeaz.dev` (TC)
- `risk.zeaz.dev` (TC)
- `memory.zeaz.dev` (TC)
- `agents.zeaz.dev` (TC)
- `fcc.zeaz.dev` (TC)

These will return 404 from the tunnel catch-all unless they're routed in the live config.

## Key Risks

1. **Terraform module overlap**: TC and TA both manage CNAME records for different subdomains. If both `apply` with different tunnel IDs, records will flap.
2. **Origin port drift**: The same hostname has different ports across live, TA, and tunnel files. Operator must verify which port is actually running.
3. **Orphaned TC subdomains**: 7 hostnames in TC have no tunnel ingress rule, causing 404 at runtime.
4. **Duplicate `release.zeaz.dev`**: Managed by both TA and TZ.
5. **`zcino.zeaz.dev`** managed by TA, TZ, and present in 5 total config files.

## Phase 8 Notes
- **Terraform ownership risks**: Modules managing the same record across `TA` and `TZ` require manual consolidation.
- **Worker/DNS overlap for www.zeaz.dev**: `www.zeaz.dev` is defined in both Wrangler configuration and Terraform DNS CNAME. Worker route wins; DNS CNAME should be evaluated for removal.
- **Tunnel/DNS ownership separation**: Keep separation between where DNS is managed (Terraform) and ingress runtime (Live config) until full IaC migration is approved.
- **Manual decisions still pending**: Consolidate canonical Terraform module, cleanup orphaned subdomains, and address overlap risks.

