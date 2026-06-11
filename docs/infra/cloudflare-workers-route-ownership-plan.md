# Cloudflare Workers Route Ownership Plan

## Current State

| Layer | Files | Routes | Status |
|---|---|---|---|
| `zeaz-platform` Worker | `wrangler.toml` | None | dev-only, no production routes |
| `zeaz-loading` Worker | `workers/zeaz-loading/wrangler.toml` | `www.zeaz.dev/*` | Production route |
| `edge-gateway` Worker | `workers/edge-gateway/wrangler.toml` | None | dev-only, placeholder KV ID |
| `edge-gateway` example | `wrangler.toml.example` | None | **Exact copy** — no value |
| OpenTofu `cloudflare-workers` | `opentofu/modules/cloudflare-workers/` | None | Skeleton, not wired |
| Terraform DNS | `terraform/cloudflare-apps/` | CNAME records | `www.zeaz.dev` conflicts with Worker |

## Source-of-Truth Rules

```text
Rule 1: The wrangler.toml file inside a worker's directory is the
        authoritative source for that worker's config.

Rule 2: Worker routes (wrangler.toml) are the authoritative source
        for which hostnames the Worker handles at the edge.

Rule 3: DNS CNAME records (Terraform) are the authoritative source
        for which hostnames route through the tunnel.

Rule 4: If a hostname appears in BOTH a Worker route AND a DNS CNAME,
        the Worker route wins for HTTP(S) edge handling, and the DNS CNAME
        must be removed to avoid split routing.

Rule 5: No wrangler.toml may be an exact copy of its .example counterpart.
        Examples must use placeholder values and env var patterns.
```

## Ownership Boundaries

| Boundary | Handled By | Source of Truth |
|---|---|---|
| DNS record creation | Terraform `cloudflare-apps` | `apps.auto.tfvars.json` |
| Tunnel ingress routing | Live `/etc/cloudflared/config.yml` | Operator runtime config |
| Worker script deployment | Wrangler CLI | `wrangler.toml` per worker |
| Worker route binding | Wrangler CLI (`route` in wrangler.toml) | `wrangler.toml` per worker |
| Worker to Domain binding | Wrangler CLI (`custom_domain`) | `wrangler.toml` per worker |
| Terraform Worker management | OpenTofu `cloudflare-workers` module | Skeleton only, not wired |

## Specific Hostname Decisions

### `www.zeaz.dev` — Worker Route

**Decision**: Let the `zeaz-loading` Worker handle `www.zeaz.dev`.

The Worker provides edge-level handling (status page, maintenance mode, redirects). The DNS CNAME for `www.zeaz.dev` in `terraform/cloudflare-apps` should be **removed** to prevent split routing.

**Migration**:
1. Keep Worker route in `workers/zeaz-loading/wrangler.toml`
2. Remove `www.zeaz.dev` from `terraform/cloudflare-apps/apps.auto.tfvars.json`
3. Verify: `wrangler deploy` + `curl https://www.zeaz.dev`

### `zeaz.dev` Apex — No Current Worker

**Decision**: Keep the apex as tunnel-routed via DNS CNAME (Terraform `cloudflare-apps`).

No Worker currently handles the apex. If a Worker is needed in the future, it must be explicitly documented and the DNS CNAME removed.

### `app.zeaz.dev` — Tunnel-Routed via DNS CNAME

**Decision**: Keep tunnel-routed. No Worker route defined.

If a future Worker needs to handle `app.zeaz.dev`:
1. Worker route must be added to `wrangler.toml`
2. DNS CNAME must be removed from `terraform/cloudflare-apps`
3. Both changes must be in the same PR

### API Hostnames (`api-*.zeaz.dev`)

**Decision**: All API subdomains (`api-zveo`, `api-zdash`, `api-zcfdash`, `api-ztrader`, `api-zzdash`) are tunnel-routed via DNS CNAME. No Worker routes.

API workers may be added in the future — same rule applies: Worker route + DNS CNAME removal in the same PR.

## Placeholder ID Policy

```text
Rule: Every wrangler.toml binding with a placeholder ID must have:
  1. An inline comment explaining what the real ID should be
  2. A reference to the docs where the real ID is documented
  3. A corresponding wrangler.example.toml with placeholder values
```

**Currently affected**:
- `workers/edge-gateway/wrangler.toml` — KV `EDGE_RATE_LIMIT_KV` has ID `00000000000000000000000000000000`

## Wrangler Example Policy

```text
Rule: Every wrangler.example.toml MUST:
  - Differ from the live wrangler.toml in at least bindings IDs and secrets
  - Use env var patterns (${VAR_NAME}) instead of inline values where possible
  - Not contain real account_id, zone_id, or token values

Rule: Every wrangler.toml MUST have a corresponding wrangler.example.toml
       (or an explicit note explaining why one is not needed).
```

**Currently affected**:
- `workers/edge-gateway/wrangler.toml.example` is an **exact copy** — must be updated
- `workers/zeaz-loading/wrangler.toml` has no `.example` file — needs one

## No-Mutation Migration Path

```text
Step 1: Phase 6 (this phase) — Document, inventory, plan. No mutations.
Step 2: Operator creates wrangler.example.toml for zeaz-loading.
Step 3: Operator updates edge-gateway wrangler.toml.example to differ from live.
Step 4: Operator removes www.zeaz.dev DNS CNAME from terraform/cloudflare-apps.
Step 5: Operator replaces KV placeholder ID in edge-gateway wrangler.toml.
Step 6: Operator runs wrangler deploy for affected workers.
Step 7: Operator verifies with curl against live hostnames.
```

## Rollback Plan

All Phase 6 changes are additive (documentation + scripts). Rollback is:

```bash
git revert <commit-sha>
```

For DNS CNAME removal (Step 4), rollback is:

```bash
# Add www.zeaz.dev back to terraform/cloudflare-apps/apps.auto.tfvars.json
# Then:
terraform apply     # after operator review
```

## Validation Gates Before Any Future Deploy

Before deploying any Worker that modifies routes:

```bash
# 1. Check for route conflicts
infra/cloudflare/scripts/scan-workers-routes.sh --strict

# 2. Check example files
infra/cloudflare/scripts/check-wrangler-examples.sh --strict

# 3. Full validation
infra/cloudflare/scripts/validate-cloudflare-config.sh --check --secrets

# 4. DNS ownership scan
infra/cloudflare/scripts/scan-dns-ownership.sh --strict

# 5. Compare against live (requires tokens)
infra/cloudflare/scripts/compare-tunnel.sh --live
infra/cloudflare/scripts/compare-dns.sh --live
```

No `wrangler deploy`, `terraform apply`, or `tofu apply` may run unless all five gates pass or failures are explicitly documented and approved.

## Phase 8 Cross-Reference
- Worker route ownership is compared against Terraform DNS ownership.
- `www.zeaz.dev` remains a manual review item.
- Future migration must choose either Wrangler-owned route or Terraform-managed Worker route, not both.

