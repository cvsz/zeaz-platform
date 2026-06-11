# Cloudflare Infrastructure Config

This directory contains configuration, scripts, and documentation for Cloudflare tunnels, DNS, and secrets management.

## Contents

| File | Type | Description |
|---|---|---|
| `config.yml` | Tunnel ingress | Main apps tunnel — 12 zeaz.dev hostnames → localhost:41XX |
| `ingress.yml` | Tunnel ingress | Meta-OS tunnel — 11 hostnames → Docker service names |
| `compose.yaml` | Docker Compose | Launches cloudflared container(s) for active tunnels |
| `.gitignore` | Git config | Protects secret files from commits |
| `config/` | Canonical config | Reserved for domain, DNS, tunnel inventories |
| `examples/` | Examples | Example files with placeholder values |
| `examples/creds.example.json` | Example | Fake credential template (safe for commits) |
| `scripts/` | Tooling | Validation, scanning, and comparison scripts |

## Scripts

| Script | Phase | Description |
|---|---|---|
| `scan-tunnel-configs.sh` | Phase 4 | Offline tunnel config drift scanner |
| `scan-dns-ownership.sh` | Phase 5 | DNS hostname ownership scanner across all sources |
| `check-secret-leaks.sh` | Phase 5 | Detects tracked secret-like files in git |
| `validate-cloudflare-config.sh` | Phase 5+6 | Combined offline validator |
| `scan-workers-routes.sh` | Phase 6 | Worker route ownership scanner (--markdown/--json/--strict) |
| `check-wrangler-examples.sh` | Phase 6 | Wrangler example file hygiene checker |
| `scan-workers-edge-bindings.sh` | Phase 7 | Edge bindings and AI Gateway governance scanner |
| `compare-tunnel.sh` | Phase 3 | Live tunnel comparison (requires tokens) |
| `compare-dns.sh` | Phase 3 | Live DNS comparison (requires tokens) |

## Secret Handling Policy

- **Never commit**: `creds.json`, `*.pem`, `*.key`, `*.tfvars`, `.env`, `*credentials.json`, `*secret*`, `*token*`, `*.auth`
- **`infra/cloudflare/creds.json`** exists on disk but is gitignored and was never committed. Still, treat credentials as exposed.
- **`examples/creds.example.json`** contains fake placeholder values and is safe for commits.
- **Rotation**: Operator must recreate tunnel credentials in Cloudflare dashboard and replace the local file. See `docs/infra/cloudflare-secret-containment-plan.md`.

## DNS Ownership Model

- **Primary Terraform module**: `terraform/cloudflare-apps` (20 app routes)
- **Legacy modules**: `terraform/cloudflare` (13 subdomains), `terraform/zdash` (4 records)
- **Live tunnel**: `/etc/cloudflared/config.yml` (8 hostnames, token-based)
- **Canonical target**: All DNS records → `terraform/cloudflare-apps`. All tunnel ingress → live config.
- See `docs/infra/cloudflare-dns-ownership-matrix.md` for the full matrix.

## How to Interpret Duplicate Hostname Results

The scanner flags a hostname as "duplicate" when it appears in 2+ config sources. This means:
- The hostname may be managed by multiple Terraform modules (risk of drift)
- The hostname may have different origin ports across sources (operator must verify which is correct)
- Some sources may be stale (the live config is the runtime source of truth)

## Safe Operator Workflow

```bash
# 1. Check for secret leaks
infra/cloudflare/scripts/check-secret-leaks.sh --strict

# 2. Run DNS ownership scan
infra/cloudflare/scripts/scan-dns-ownership.sh --strict

# 3. Validate configs
infra/cloudflare/scripts/validate-cloudflare-config.sh --check --secrets

# 4. Compare against live (requires tokens)
infra/cloudflare/scripts/compare-tunnel.sh --live
infra/cloudflare/scripts/compare-dns.sh --live
```

## Live Runtime

The actual running tunnel uses **token-based auth** (not config files in this repo):

- Tunnel ID: `ef0355dd-8e90-45ed-a222-b5053794ed20`
- Systemd: `/etc/systemd/system/cloudflared.service` (token embedded)
- Config: `/etc/cloudflared/config.yml` (8 hostnames, different port range)
- Old tunnel `22bd858b` is orphaned (credential file on disk, no running process)

## Worker Route Ownership Model (Phase 6)

### Source-of-Truth Rules

| Layer | Authority | Notes |
|---|---|---|
| Cloudflare Workers routes | `workers/*/wrangler.toml` | Only source for Worker route patterns |
| Cloudflare DNS CNAMEs | `terraform/cloudflare-apps` | Primary DNS module |
| Cloudflare Tunnel ingress | Live `/etc/cloudflared/config.yml` | Runtime source of truth |
| Terraform worker routes | `cloudflare_worker_route` resources | None currently exist |

### Ownership Boundaries

| Hostname | Worker Route | DNS CNAME | Tunnel Ingress | Owner |
|---|---|---|---|---|
| `www.zeaz.dev` | `zeaz-loading` | TA module | No | **Worker** (route wins) |
| `zeaz.dev` apex | No | No | Yes | **Tunnel** |
| `app.zeaz.dev` | No | TA module | Yes | **Tunnel** |
| `api-*.zeaz.dev` | No | TC module | Yes | **Tunnel** |

**Rule**: Any new Worker route + existing DNS CNAME for same hostname must be handled in the same PR (add route + remove CNAME).

### Placeholder ID Policy

- Every binding ID in `wrangler.toml` must be a real Cloudflare ID or explicit placeholder (`00000000000000000000000000000000`)
- Placeholders are **not deployable** — operator must replace before deploy
- Example files must use placeholders; real IDs forbidden in examples

### Example File Policy

- Every `wrangler.toml` must have a corresponding `.example` file
- Example file must **not** be an exact copy
- Example file must not contain real-looking IDs, tokens, secrets, or routes

## Safe Operator Workflow (Phase 6 Added)

```bash
# 1. Check for secret leaks
infra/cloudflare/scripts/check-secret-leaks.sh --strict

# 2. Run DNS ownership scan
infra/cloudflare/scripts/scan-dns-ownership.sh --strict

# 3. Validate configs (Phase 5 + 6)
infra/cloudflare/scripts/validate-cloudflare-config.sh --check --secrets --workers

# 4. Compare against live (requires tokens)
infra/cloudflare/scripts/compare-tunnel.sh --live
infra/cloudflare/scripts/compare-dns.sh --live
```

## Worker Route Validation

```bash
# Scan all Worker routes (markdown for docs)
infra/cloudflare/scripts/scan-workers-routes.sh --markdown > docs/infra/cloudflare-workers-route-scan.md

# Scan all Worker routes (JSON for tooling)
infra/cloudflare/scripts/scan-workers-routes.sh --json > docs/infra/cloudflare-workers-route-scan.json

# Strict mode (exits non-zero on duplicates, exact copies, placeholders, overlaps)
infra/cloudflare/scripts/scan-workers-routes.sh --strict

# Check wrangler example hygiene
infra/cloudflare/scripts/check-wrangler-examples.sh --strict
```

## No-Deploy Safety Warning

**This phase is documentation, scanning, validation, and source-of-truth planning only.**

- Do not run `wrangler deploy`
- Do not run `terraform apply`
- Do not run `tofu apply`
- Do not mutate Cloudflare DNS
- Do not mutate Cloudflare tunnels
- Do not call Cloudflare write APIs
- Do not print secrets
- Do not commit credentials
- Do not delete production config files

## Future Live Verification Requirements

Before any Worker route deployment:
1. Operator verifies `www.zeaz.dev` DNS CNAME removed from `terraform/cloudflare-apps`
2. Operator replaces placeholder KV IDs in `workers/edge-gateway/wrangler.toml`
3. Operator creates `wrangler.toml.example` for root and `workers/zeaz-loading/`
4. Validation gates: `validate-cloudflare-config.sh --check --secrets --workers` passes
5. Scan artifacts updated: `docs/infra/cloudflare-workers-route-scan.{md,json}`

## Directory History

- Phase 2: Created canonical config layout (`config/tunnels.yml`)
- Phase 3: Added comparison scripts (`compare-*.sh`)
- Phase 4: Added scanner, inventory, drift report, consolidation plan
- Phase 5: Secret containment plan, DNS ownership matrix, secret leak detection, enhanced validator
- Phase 6: Worker route ownership model, scanner scripts, example checker, inventory, ownership plan
