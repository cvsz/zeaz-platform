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

# 3. Validate configs (Phase 5 + 6 + 8)
infra/cloudflare/scripts/validate-cloudflare-config.sh --check --secrets --workers --terraform

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
- Phase 7: Runtime governance, worker binding audits, no-mutation guard
- Phase 8: Terraform and live runtime reconciliation, ownership matrix, scanner script
- Phase 9: Access security governance, rule scanners, zero trust inventory
- Phase 10: CI Enforcement, PR gates, read-only CI operations

## Phase 7 Usage (Runtime Governance & Binding Audits)

```bash
# Safely inspect runtime cloudflared environments
infra/cloudflare/scripts/scan-runtime-governance.sh --markdown

# Audit Worker bindings for safety and proper redaction
infra/cloudflare/scripts/scan-worker-bindings.sh --markdown

# Guard against unsafe mutation commands (Terraform/Wrangler)
infra/cloudflare/scripts/check-cloudflare-no-mutation.sh --strict

# Compile comprehensive governance markdown reports
infra/cloudflare/scripts/generate-runtime-governance-report.sh

# Run comprehensive offline validation containing all Phase 7 checks
infra/cloudflare/scripts/validate-cloudflare-config.sh --check --secrets --workers --runtime-governance --worker-bindings --no-mutation
```

## Phase 12: Manual Release Approval + Change Window Governance

Phase 12 adds manual release approval evidence, change-window policy, rollback planning, and read-only release governance.

Phase 12 does not deploy.
Phase 12 does not apply Terraform/OpenTofu.
Phase 12 does not mutate Cloudflare.

### Generate Phase 12 approval evidence

```bash
infra/cloudflare/scripts/generate-manual-release-checklist.sh \
  --output docs/infra/cloudflare-phase12-approval-evidence.md \
  --timezone Asia/Bangkok
```

### Validate Phase 12 approval evidence

```bash
infra/cloudflare/scripts/check-manual-release-approval.sh --strict
```

### Full pre-release governance chain

```bash
infra/cloudflare/scripts/check-release-readiness.sh --strict --no-live
infra/cloudflare/scripts/check-manual-release-approval.sh --strict
```

## Phase 13 — Runtime Rollback Evidence + Break-Glass Governance

Phase 13 adds a read-only governance layer for emergency Cloudflare rollback and break-glass procedures.

**Purpose**: Defines required emergency evidence, human ownership, rollback scope, runtime snapshots, stop conditions, secret safety checks, and post-incident review requirements.

**Safety boundary**: Phase 13 is governance-only. It does not execute rollback, deployment, Terraform/OpenTofu apply, Wrangler deploy, DNS mutation, tunnel mutation, or Cloudflare API mutation.

**Created docs**:
- `docs/infra/cloudflare-phase13-break-glass-policy.md`
- `docs/infra/cloudflare-phase13-runtime-rollback-evidence.md`
- `docs/infra/cloudflare-phase13-incident-rollback-runbook.md`
- `docs/infra/cloudflare-phase13-post-incident-review.md`

**Created scripts**:
- `infra/cloudflare/scripts/check-break-glass-governance.sh`
- `infra/cloudflare/scripts/generate-runtime-rollback-evidence.sh`

**Created workflow**:
- `.github/workflows/cloudflare-break-glass-governance.yml`

**Relationship to Phase 10/11/12**:
Builds upon the prior gates but handles emergency break-glass cases securely.

### Generation command

```bash
infra/cloudflare/scripts/generate-runtime-rollback-evidence.sh \
  --output docs/infra/cloudflare-phase13-runtime-rollback-evidence.md \
  --timezone Asia/Bangkok \
  --strict
```

### Validation command

```bash
infra/cloudflare/scripts/check-break-glass-governance.sh --strict
```
## Phase 10 — CI Enforcement + PR Gates

Cloudflare-sensitive PRs must pass:

- workflow policy
- no-mutation scanner
- secret leak scanner
- DNS ownership scanner
- Worker route scanner
- Wrangler example hygiene scanner
- Terraform/OpenTofu validate only
- YAML validation

Forbidden in PR CI:

- wrangler deploy
- terraform apply
- tofu destroy
- Cloudflare write API calls
- secret printing

## Phase 14 — Cloudflare Runtime Baseline Freeze

- **Runtime baseline freeze**: Captures the current repository intent into a documented production baseline (`docs/infra/cloudflare-phase14-runtime-baseline.md`).
- **Ownership lockfile**: Tracks ownership intent of hostnames mapping to DNS, Worker, and Tunnel rules (`docs/infra/cloudflare-phase14-ownership-lockfile.md`).
- **Baseline diff report**: Validates differences and decisions for any future changes (`docs/infra/cloudflare-phase14-baseline-diff-report.md`).

**Phase 14 Commands:**

```bash
infra/cloudflare/scripts/generate-runtime-baseline.sh --strict
infra/cloudflare/scripts/check-runtime-baseline.sh --strict
infra/cloudflare/scripts/compare-runtime-baseline.sh --strict
infra/cloudflare/scripts/validate-cloudflare-config.sh \
  --check \
  --secrets \
  --workers \
  --release-readiness \
  --manual-release-governance \
  --break-glass-governance \
  --runtime-baseline
```

**Safety Statement:** Phase 14 is evidence-only and does not authorize deploy/apply/destroy.

---

## Phase 15 — Runtime Drift SLA + Ownership Review Board

Phase 15 adds scheduled drift review cadence, SLA classifications for all drift severity levels, an exception register, drift aging buckets, and monthly governance evidence templates.

**Phase 15 is governance documentation only. It does not deploy, apply Terraform, or mutate Cloudflare.**

### Phase 15 Documents

| Document | Purpose |
|---|---|
| `docs/infra/cloudflare-runtime-drift-sla.md` | SLA classes (Critical/High/Medium/Low/Accepted Exception) and aging buckets |
| `docs/infra/cloudflare-ownership-review-board.md` | Review board roles, meeting cadence, quorum, charter |
| `docs/infra/cloudflare-drift-exception-register.md` | Exception register with all required fields and process |
| `docs/infra/cloudflare-monthly-governance-evidence.md` | Template for monthly governance evidence capture |
| `docs/infra/cloudflare-drift-report.md` | Updated with SLA class and aging bucket fields (Phase 15 section) |

### Phase 15 Validation

```bash
# Verify all Phase 15 docs exist
for doc in \
  docs/infra/cloudflare-runtime-drift-sla.md \
  docs/infra/cloudflare-ownership-review-board.md \
  docs/infra/cloudflare-drift-exception-register.md \
  docs/infra/cloudflare-monthly-governance-evidence.md; do
  [ -f "$doc" ] && echo "EXISTS: $doc" || echo "MISSING: $doc"
done

# Verify drift report has Phase 15 SLA section
grep -q "Phase 15" docs/infra/cloudflare-drift-report.md && echo "PASS: drift-report has Phase 15 fields" || echo "FAIL"

# Secret check on Phase 15 docs
grep -RInE '(token|secret|password|credential|api[_-]?key)' \
  docs/infra/cloudflare-runtime-drift-sla.md \
  docs/infra/cloudflare-ownership-review-board.md \
  docs/infra/cloudflare-drift-exception-register.md \
  docs/infra/cloudflare-monthly-governance-evidence.md || echo "No secrets found"
```

**Safety Statement:** Phase 15 is governance documentation only. It does not deploy, apply Terraform/OpenTofu, restart services, or mutate Cloudflare.

---

## Phase 18 — Cloudflare Multi-Environment Separation

Phase 18 defines and enforces ownership boundaries between dev, staging, and production Cloudflare environments. It prevents cross-environment drift, credential sharing, and misconfigured hostname routing.

**Phase 18 is documentation and validation only. It does not deploy or mutate Cloudflare.**

### Phase 18 Documents

| Document | Purpose |
|---|---|
| `docs/infra/cloudflare-environment-boundaries.md` | Rules for dev, staging, and prod environment separation |
| `docs/infra/cloudflare-environment-ownership-matrix.md` | Matrix of environment × resource × owner × approval |
| `docs/infra/cloudflare-cross-environment-drift-policy.md` | Policy for detecting and remediating cross-env drift |
| `docs/infra/cloudflare-environment-promotion-policy.md` | Gates and requirements for promotion between environments |

### Phase 18 Environment Intent Files

- `infra/cloudflare/environments/dev.yml` (Redacted intent)
- `infra/cloudflare/environments/staging.yml` (Redacted intent)
- `infra/cloudflare/environments/prod.yml` (Redacted intent)

### Phase 18 Scripts

- `infra/cloudflare/scripts/scan-cloudflare-environment-boundaries.sh` (Offline scanner)

### Phase 18 Validation

```bash
# Run environment boundary scan
infra/cloudflare/scripts/scan-cloudflare-environment-boundaries.sh --markdown

# Validate using the master validator
infra/cloudflare/scripts/validate-cloudflare-config.sh --check
```

## Phase 16 — Cloudflare Change Evidence Archive

Phase 16 adds an immutable change evidence archive, retention policy, index template, release approval template, and incident review template.

**Safety Statement:** Phase 16 is documentation-only and does not authorize deploy/apply/destroy.

### Phase 16 Documents

| Document | Purpose |
|---|---|
| [cloudflare-change-evidence-archive.md](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-change-evidence-archive.md) | Archive model overview and usage guide |
| [cloudflare-evidence-retention-policy.md](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-evidence-retention-policy.md) | Retention periods and storage policies for evidence |
| [cloudflare-evidence-index-template.md](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-evidence-index-template.md) | Template and examples for the master index |
| [cloudflare-release-approval-template.md](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-release-approval-template.md) | Formal release approval document template |
| [cloudflare-incident-review-template.md](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-incident-review-template.md) | Outage and service incident review template |
| [README.md (evidence)](file:///home/zeazdev/zeaz-platform/docs/infra/evidence/cloudflare/README.md) | Directory guide for the evidence archive |
| [index.md (evidence)](file:///home/zeazdev/zeaz-platform/docs/infra/evidence/cloudflare/index.md) | Main running index of change records |

### Phase 16 Validation

```bash
# Verify all Phase 16 docs exist
for doc in \
  docs/infra/cloudflare-change-evidence-archive.md \
  docs/infra/cloudflare-evidence-retention-policy.md \
  docs/infra/cloudflare-evidence-index-template.md \
  docs/infra/cloudflare-release-approval-template.md \
  docs/infra/cloudflare-incident-review-template.md \
  docs/infra/evidence/cloudflare/README.md \
  docs/infra/evidence/cloudflare/index.md; do
  [ -f "$doc" ] && echo "EXISTS: $doc" || echo "MISSING: $doc"
done
```


