#!/usr/bin/env bash
# generate-manual-release-checklist.sh
# Phase 12: Generate manual release approval evidence checklist.

set -Eeuo pipefail

OUTPUT="docs/infra/cloudflare-phase12-approval-evidence.md"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
PR=""
REQUESTED_BY=""
REVIEWED_BY=""
APPROVED_BY=""
CHANGE_WINDOW=""
TIMEZONE="Asia/Bangkok"
MODE="human"
STRICT=false

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"

show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Generate manual release approval evidence checklist.

Options:
  --help                Show this help message
  --output <path>       Output path (default: $OUTPUT)
  --branch <branch>     Set branch name
  --commit <commit>     Set commit hash
  --pr <url-or-number>  Set PR reference
  --requested-by <name> Set requester
  --reviewed-by <name>  Set reviewer
  --approved-by <name>  Set approver
  --change-window <val> Set change window
  --timezone <val>      Set timezone (default: $TIMEZONE)
  --markdown            Markdown output
  --strict              Strict mode
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help; exit 0 ;;
    --output) OUTPUT="$2"; shift ;;
    --branch) BRANCH="$2"; shift ;;
    --commit) COMMIT="$2"; shift ;;
    --pr) PR="$2"; shift ;;
    --requested-by) REQUESTED_BY="$2"; shift ;;
    --reviewed-by) REVIEWED_BY="$2"; shift ;;
    --approved-by) APPROVED_BY="$2"; shift ;;
    --change-window) CHANGE_WINDOW="$2"; shift ;;
    --timezone) TIMEZONE="$2"; shift ;;
    --markdown) MODE="markdown" ;;
    --strict) STRICT=true ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$(dirname "${REPO_ROOT}/${OUTPUT}")"

cat <<EOF > "${REPO_ROOT}/${OUTPUT}"
# Cloudflare Phase 12 Approval Evidence

## Release Candidate

- Branch: ${BRANCH}
- Commit: ${COMMIT}
- Pull Request: ${PR}
- Requested By: ${REQUESTED_BY}
- Reviewed By: ${REVIEWED_BY}
- Approved By: ${APPROVED_BY}
- Approval Date: ${DATE}
- Change Window: ${CHANGE_WINDOW}
- Timezone: ${TIMEZONE}

## Phase 11 Evidence

- Release readiness document: docs/infra/cloudflare-phase11-release-readiness.md
- Release readiness checker result: 
- Known blockers: 

## Human Approval Checklist

- [ ] Approval is explicit.
- [ ] Approver is human.
- [ ] Change window is declared.
- [ ] Rollback plan is present.
- [ ] Secret handling is confirmed.
- [ ] DNS ownership is confirmed.
- [ ] Worker route ownership is confirmed.
- [ ] Tunnel ownership is confirmed.
- [ ] Terraform/OpenTofu scope is confirmed.
- [ ] Wrangler scope is confirmed.
- [ ] Emergency stop conditions are understood.

## Confirmed Non-Actions

- [ ] No Wrangler deploy was run by Phase 12.
- [ ] No Terraform apply was run by Phase 12.
- [ ] No OpenTofu apply was run by Phase 12.
- [ ] No destroy operation was run by Phase 12.
- [ ] No Cloudflare write API was called by Phase 12.
- [ ] No secrets were printed by Phase 12.

## Release Decision

Status:

- [ ] APPROVED FOR FUTURE MANUAL CHANGE
- [ ] NOT APPROVED

Reason: 
EOF

if [[ "$MODE" == "markdown" ]]; then
  echo "Generated checklist at \`${OUTPUT}\`"
else
  echo "[OK] Checklist generated at ${OUTPUT}"
fi
exit 0
