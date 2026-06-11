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
| `validate-cloudflare-config.sh` | Phase 5 | Combined offline validator |
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

## Directory History

- Phase 2: Created canonical config layout (`config/tunnels.yml`)
- Phase 3: Added comparison scripts (`compare-*.sh`)
- Phase 4: Added scanner, inventory, drift report, consolidation plan
- Phase 5: Secret containment plan, DNS ownership matrix, secret leak detection, enhanced validator
