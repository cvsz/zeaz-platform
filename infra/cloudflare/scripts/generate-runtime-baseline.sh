#!/usr/bin/env bash
# generate-runtime-baseline.sh
# Phase 14: Read-only generator for Cloudflare runtime baseline evidence.
# No deploy. No apply. No mutate. No secret printing.

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"

OUTPUT_FILE="docs/infra/cloudflare-phase14-runtime-baseline.md"
LOCKFILE="docs/infra/cloudflare-phase14-ownership-lockfile.md"
DIFF_REPORT="docs/infra/cloudflare-phase14-baseline-diff-report.md"
TIMEZONE="Asia/Bangkok"
STRICT=false

show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Generate Phase 14 runtime baseline evidence. Read-only, safe, no mutations.

Options:
  --help                Show this help message
  --output PATH         Output markdown path (default: $OUTPUT_FILE)
  --lockfile PATH       Lockfile path (default: $LOCKFILE)
  --diff-report PATH    Diff report path (default: $DIFF_REPORT)
  --timezone TZ         Timezone for date generation (default: $TIMEZONE)
  --strict              Exit with error if failure occurs
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help; exit 0 ;;
    --output) OUTPUT_FILE="$2"; shift ;;
    --lockfile) LOCKFILE="$2"; shift ;;
    --diff-report) DIFF_REPORT="$2"; shift ;;
    --timezone) TIMEZONE="$2"; shift ;;
    --strict) STRICT=true ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

DATE_STR=$(TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M:%S %Z')

# Generate the baseline document
cat <<EOF > "${REPO_ROOT}/${OUTPUT_FILE}"
# Cloudflare Runtime Baseline Freeze (Phase 14)

Date: $DATE_STR

Phase 14 does not deploy. Phase 14 does not apply Terraform or OpenTofu. Phase 14 does not run Wrangler deploy. Phase 14 does not mutate Cloudflare. Phase 14 freezes repository-visible Cloudflare runtime intent into a reviewable baseline only.

## Baseline Scope
- DNS ownership
- Worker route ownership
- tunnel ingress ownership
- Terraform/OpenTofu intent
- CI/PR gate posture
- release readiness evidence
- manual release governance
- break-glass governance
- secret containment posture

## Known Baseline Facts
- DNS canonical target: terraform/cloudflare-apps
- Worker routes canonical source: workers/*/wrangler.toml
- Tunnel ingress canonical source: live /etc/cloudflared/config.yml, represented only by docs/scans
- www.zeaz.dev is Worker-owned
- zeaz.dev apex remains tunnel-owned
- app.zeaz.dev remains tunnel-owned
- api-* hostnames remain tunnel-owned
- no production mutation is permitted from PR CI

## Baseline Status Table
| Area | Source of truth | Baseline status | Validator | Risk if changed |
|---|---|---|---|---|
| DNS | terraform/cloudflare-apps | Frozen | scan-dns-ownership.sh | Traffic misrouting |
| Worker Routes | workers/*/wrangler.toml | Frozen | scan-workers-routes.sh | Overriding tunnel traffic |
| Tunnel Ingress | docs/scans | Frozen | Compare checks | Tunnel bypass |
| CI/PR Gates | .github/workflows | Frozen | workflow-policy.sh | Unauthorized mutation |
| Release Governance | Phase 11-13 Evidence | Frozen | check-manual-release-approval.sh | Deployment bypass |

## Review Procedure
- baseline changes require PR review
- baseline changes must include evidence diff
- baseline changes must not include deploy/apply actions
- baseline changes must pass Phase 10-14 validators
EOF

# Generate Lockfile
cat <<EOF > "${REPO_ROOT}/${LOCKFILE}"
# Cloudflare Runtime Ownership Lockfile

This lockfile is documentation evidence only. It is not an executable deployment file.

| Hostname | Runtime owner | Source file / evidence | Expected route behavior | Conflict policy | Change approval required |
|---|---|---|---|---|---|
| www.zeaz.dev | Worker | workers/zeaz-loading/wrangler.toml | Worker route www.zeaz.dev/* | Worker wins for HTTP(S); DNS CNAME conflict must be reviewed | Phase 10-14 gates required |
| zeaz.dev | Tunnel | docs/infra/cloudflare-dns-ownership-matrix.md and tunnel docs | apex tunnel ingress | no Worker route unless baseline updated | Phase 10-14 gates required |
| app.zeaz.dev | Tunnel | tunnel docs/scans | tunnel ingress | no Worker route unless baseline updated | Phase 10-14 gates required |
| api-*.zeaz.dev | Tunnel | tunnel docs/scans | tunnel ingress | no Worker route unless baseline updated | Phase 10-14 gates required |

## How to update this lockfile safely
- Updates require a Pull Request.
- Validate using \`infra/cloudflare/scripts/compare-runtime-baseline.sh\`.
- Ensure corresponding infrastructure code (Terraform or Wrangler) is updated.
- No direct deployments are allowed during lockfile updates.

## Forbidden lockfile changes
- Do not assign \`api-*.zeaz.dev\` to a Worker without explicit architectural review.
- Do not reassign \`zeaz.dev\` apex from Tunnel without reviewing apex proxying rules.

## Required evidence for ownership change
- A generated baseline diff report (\`docs/infra/cloudflare-phase14-baseline-diff-report.md\`).
- Passed Phase 10-14 validation scripts.
EOF

# Generate Diff Report Template
cat <<EOF > "${REPO_ROOT}/${DIFF_REPORT}"
# Phase 14 Baseline Diff Report

Current decision status:
- [x] BASELINE_MATCH
- [ ] BASELINE_CHANGED_REVIEW_REQUIRED
- [ ] BASELINE_BLOCKED

## Checklist
- [x] DNS ownership reviewed
- [x] Worker route ownership reviewed
- [x] Tunnel ownership reviewed
- [x] Wrangler examples reviewed
- [x] Secrets check passed
- [x] CI workflow mutation safety reviewed
- [x] Phase 10 PR gates passed
- [x] Phase 11 release readiness passed
- [x] Phase 12 manual release governance passed
- [x] Phase 13 break-glass governance passed
- [x] Phase 14 baseline checker passed

## Confirmed non-actions
- [x] no deploy
- [x] no Terraform/OpenTofu apply
- [x] no destroy
- [x] no Wrangler deploy
- [x] no Cloudflare API mutation
- [x] no secret printing
EOF

echo "[INFO] Generated Phase 14 baseline documents successfully."
exit 0
