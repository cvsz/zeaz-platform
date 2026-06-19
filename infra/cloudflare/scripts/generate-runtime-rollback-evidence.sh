#!/usr/bin/env bash
set -Eeuo pipefail

OUTPUT="docs/infra/cloudflare-phase13-runtime-rollback-evidence.md"
TIMEZONE="Asia/Bangkok"
INCIDENT_ID="PHASE13-TEMPLATE"
INCIDENT_TITLE="Runtime rollback evidence template"
REQUESTED_BY="UNKNOWN"
OWNER="REQUIRED"
APPROVER="REQUIRED"
RELATED_PR="UNKNOWN"
RELATED_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo UNKNOWN)"
AFFECTED_HOSTNAMES="NONE"
AFFECTED_WORKERS="NONE"
AFFECTED_TUNNELS="NONE"
AFFECTED_DNS_RECORDS="NONE"
ROLLBACK_CANDIDATE="REQUIRED"
STRICT=false

usage() {
  cat << 'EOF'
Usage: generate-runtime-rollback-evidence.sh [OPTIONS]

Generate Phase 13 runtime rollback evidence template.

Options:
  --output <path>
  --incident-id <value>
  --incident-title <value>
  --requested-by <value>
  --owner <value>
  --approver <value>
  --related-pr <value>
  --related-commit <value>
  --affected-hostnames <value>
  --affected-workers <value>
  --affected-tunnels <value>
  --affected-dns-records <value>
  --rollback-candidate <value>
  --timezone <value>
  --strict
  --help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output) OUTPUT="$2"; shift 2 ;;
    --incident-id) INCIDENT_ID="$2"; shift 2 ;;
    --incident-title) INCIDENT_TITLE="$2"; shift 2 ;;
    --requested-by) REQUESTED_BY="$2"; shift 2 ;;
    --owner) OWNER="$2"; shift 2 ;;
    --approver) APPROVER="$2"; shift 2 ;;
    --related-pr) RELATED_PR="$2"; shift 2 ;;
    --related-commit) RELATED_COMMIT="$2"; shift 2 ;;
    --affected-hostnames) AFFECTED_HOSTNAMES="$2"; shift 2 ;;
    --affected-workers) AFFECTED_WORKERS="$2"; shift 2 ;;
    --affected-tunnels) AFFECTED_TUNNELS="$2"; shift 2 ;;
    --affected-dns-records) AFFECTED_DNS_RECORDS="$2"; shift 2 ;;
    --rollback-candidate) ROLLBACK_CANDIDATE="$2"; shift 2 ;;
    --timezone) TIMEZONE="$2"; shift 2 ;;
    --strict) STRICT=true; shift ;;
    --help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; exit 2 ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
OUTPUT_PATH="$REPO_ROOT/$OUTPUT"

cat << EOF > "$OUTPUT_PATH"
# Cloudflare Phase 13 — Runtime Rollback Evidence

## Incident Metadata
- Incident ID: $INCIDENT_ID
- Incident title: $INCIDENT_TITLE
- Date/time: $(TZ="$TIMEZONE" date)
- Timezone: $TIMEZONE
- Requested by: $REQUESTED_BY
- Related PR: $RELATED_PR
- Related commit: $RELATED_COMMIT

## Emergency Classification
Provide justification for why this incident requires break-glass or emergency rollback procedures.

## Runtime Snapshot Before Action
Record the exact status of the targeted resources.

## DNS Ownership Snapshot
- Affected DNS records: $AFFECTED_DNS_RECORDS

## Worker Route Ownership Snapshot
- Affected Worker(s): $AFFECTED_WORKERS

## Tunnel Ownership Snapshot
- Affected tunnel(s): $AFFECTED_TUNNELS

## Terraform/OpenTofu Scope Snapshot
- Target resources scopes for rollback or apply.

## Wrangler Scope Snapshot
- Expected scope of Wrangler rollback/deploy.

## Secret Safety Confirmation
- Review any potential secrets exposure.

## Rollback Candidate
- Rollback candidate: $ROLLBACK_CANDIDATE

## Rollback Owner
- Emergency owner: $OWNER
- Approver: $APPROVER

## Rollback Preconditions
List all systems and services that must be verified before proceeding.

## Rollback Trigger
What metric, alert, or manual action triggers this rollback plan.

## Rollback Execution Boundary
Describe the limits of what this manual rollback is permitted to change.

## Stop Conditions
Define conditions that mandate halting the rollback.

## Validation After Manual Action
- Validation status: PENDING

## Evidence Attachments
Links to logs, metrics, or command outputs.

## Decision
- Rollback decision: NOT_READY

## Post-Incident Review Link
- Post-incident review owner: REQUIRED
Link to PIR documentation.

---

### Phase 13 Checklist

- [ ] Emergency justification is documented.
- [ ] Named human owner is assigned.
- [ ] Runtime evidence snapshot exists.
- [ ] DNS ownership was reviewed.
- [ ] Worker route ownership was reviewed.
- [ ] Tunnel ownership was reviewed.
- [ ] Terraform/OpenTofu scope was reviewed.
- [ ] Wrangler scope was reviewed.
- [ ] Secret safety was confirmed.
- [ ] Rollback plan exists.
- [ ] Stop conditions are defined.
- [ ] Post-incident review is required.

### Phase 13 Confirmed Non-Actions

- [ ] Phase 13 did not run Wrangler deploy.
- [ ] Phase 13 did not run Terraform apply.
- [ ] Phase 13 did not run OpenTofu apply.
- [ ] Phase 13 did not run destroy.
- [ ] Phase 13 did not mutate Cloudflare.
- [ ] Phase 13 did not print secrets.
- [ ] Phase 13 did not commit credentials.
EOF

echo "Generated Phase 13 runtime rollback evidence template at $OUTPUT"
