# Cloudflare Workers/Wrangler Route Inventory

## Summary

| Metric | Value |
|---|---|
| Total Worker script names found | 3 |
| Total wrangler.toml files (live) | 3 |
| Total wrangler example files | 1 |
| Total routes defined | 1 |
| Total custom domains | 0 |
| Workers with `workers_dev = true` | 2 |
| Workers with routes | 1 |
| Workers with bindings (KV/R2/D1/Queues) | 1 |
| Placeholder IDs in bindings | 1 (`000000...`) |
| OpenTofu Worker modules | 1 (stub) |
| Route/DNS/tunnel overlaps | 1 (`www.zeaz.dev`) |
| Exact wrangler.toml copies (live→example) | 1 (`edge-gateway`) |

## Inventory

### 1. Root: `zeaz-platform`

| Field | Value |
|---|---|
| **File** | `/home/zeazdev/zeaz-platform/wrangler.toml` |
| **Worker Name** | `zeaz-platform` |
| **Main** | `workers/src/index.js` |
| **Compatibility Date** | `2025-01-01` |
| **workers_dev** | `true` |
| **Routes** | None |
| **Custom Domains** | None |
| **Bindings** | None |
| **Zone References** | None |
| **Account References** | None |
| **Placeholder IDs** | None |
| **Overlaps with Tunnel Hostnames** | None (no routes) |
| **Overlaps with DNS Hostnames** | None (no routes) |
| **Owner** | Platform infra |
| **Recommended Action** | Keep as-is. No routes — workers_dev only for dev testing. Main entry point references `workers/src/index.js` which exists with a minimal health response. |

### 2. `zeaz-loading`

| Field | Value |
|---|---|
| **File** | `/home/zeazdev/zeaz-platform/workers/zeaz-loading/wrangler.toml` |
| **Worker Name** | `zeaz-loading` |
| **Main** | `src/index.js` |
| **Compatibility Date** | `2026-05-24` |
| **workers_dev** | `false` |
| **Routes** | `www.zeaz.dev/*` (zone: `zeaz.dev`) |
| **Custom Domains** | None |
| **Bindings** | None |
| **Vars** | `BRAND_NAME`, `APP_URL`, `STATUS_TEXT_TH`, `STATUS_TEXT_EN` |
| **Placeholder IDs** | None |
| **Overlaps with Tunnel Hostnames** | `www.zeaz.dev` — not in live tunnel config, but in `tunnels/config.yaml` (abstract) |
| **Overlaps with DNS Hostnames** | `www.zeaz.dev` is a CNAME in `terraform/cloudflare-apps` (proxied, pointing to tunnel) |
| **Owner** | Platform infra |
| **Recommended Action** | **Resolve ownership conflict.** Currently: Worker route handles `www.zeaz.dev/*` at edge AND Terraform CNAME record points to tunnel. These will conflict. Decision: Worker handles `www.zeaz.dev` — see ownership plan. |

### 3. `edge-gateway`

| Field | Value |
|---|---|
| **File** | `/home/zeazdev/zeaz-platform/workers/edge-gateway/wrangler.toml` |
| **Worker Name** | `edge-gateway` |
| **Main** | `src/index.ts` |
| **Compatibility Date** | `2026-05-12` |
| **workers_dev** | `true` |
| **Routes** | None |
| **Custom Domains** | None |
| **Bindings** | `EDGE_RATE_LIMIT_KV` (KV) — **placeholder ID** `0000...0000` |
| **Vars** | `JWT_AUDIENCE`, `EDGE_USE_DURABLE_LIMITER`, `CLOUDFLARE_AI_GATEWAY_SLUG` |
| **Zone References** | None |
| **Account References** | None |
| **Placeholder IDs** | 1 — KV namespace ID is all zeros |
| **Overlaps with Tunnel Hostnames** | None (no routes, workers_dev only) |
| **Overlaps with DNS Hostnames** | None (no routes) |
| **Owner** | Platform infra |
| **Recommended Action** | Replace placeholder KV ID with real ID before production deploy. Add routes or custom domains when ready for production. Consider adding an example file that differs from live. |

### 4. `edge-gateway` Example

| Field | Value |
|---|---|
| **File** | `/home/zeazdev/zeaz-platform/workers/edge-gateway/wrangler.toml.example` |
| **Status** | **Identical copy** of `wrangler.toml` |
| **Risk** | Example contains placeholder KV ID — low risk, but exact copy provides no value as reference. Should differ from live to show template vs actual values. |
| **Recommended Action** | Either remove or replace with useful template showing env var patterns. |

## Bindings Summary

| Worker | Binding Type | Binding Name | ID Status |
|---|---|---|---|
| `edge-gateway` | KV Namespace | `EDGE_RATE_LIMIT_KV` | **PLACEHOLDER** (`000000...0000`) |

## OpenTofu Workers Module

| Field | Value |
|---|---|
| **Path** | `opentofu/modules/cloudflare-workers/` |
| **Resource** | `cloudflare_worker_script` |
| **Content** | Stub (returns "ok") |
| **Routes** | None defined |
| **Status** | Skeleton module, not wired into any environment |
| **Recommended Action** | Keep as skeleton — wire into environments only when workers need Terraform-managed deployment |

## Route Conflict Analysis

### `www.zeaz.dev` — Triple Ownership

| Source | Type | Details |
|---|---|---|
| `workers/zeaz-loading/wrangler.toml` | Worker route | `{ pattern = "www.zeaz.dev/*", zone_name = "zeaz.dev" }` |
| `terraform/cloudflare-apps/apps.auto.tfvars.json` | DNS CNAME | `www.zeaz.dev` → tunnel CNAME, proxied |
| `tunnels/config.yaml` | Abstract tunnel | `www.${PRIMARY_DOMAIN}` → web origin |

**Conflict**: If the worker route is active, Cloudflare will route `www.zeaz.dev` requests to the `zeaz-loading` Worker. If the DNS CNAME is active, requests go through the tunnel. Both cannot be active for the same hostname at the same time without explicit Cloudflare configuration ordering.

**Recommendation**: Let the Worker handle `www.zeaz.dev` as the edge handler. Remove the DNS CNAME from Terraform cloudflare-apps for `www.zeaz.dev` to avoid split routing.

## Route Statistics

| Metric | Count |
|---|---|
| Total Worker scripts discovered | 3 |
| Total wrangler.toml files (live) | 3 |
| Total wrangler.example.toml files | 1 |
| Total routes defined across all workers | 1 |
| Route/DNS overlap conflicts | 1 |
| Route/Tunnel overlap conflicts | 0 |
| Workers with `workers_dev = true` (no production routes) | 2 |
| Workers with `workers_dev = false` (production routes) | 1 |
| Workers with bindings containing placeholder IDs | 1 |
| Exact live→example copies | 1 |
