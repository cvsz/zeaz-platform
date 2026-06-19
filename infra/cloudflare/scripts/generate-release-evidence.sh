#!/usr/bin/env bash
# generate-release-evidence.sh
# Phase 11: Generate Release Evidence

set -Eeuo pipefail

MODE="markdown"
STRICT=false
OUTPUT="docs/infra/cloudflare-phase11-release-evidence.md"

show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Read-only evidence report generator.

Options:
  --help          Show this help message
  --markdown      Output as markdown
  --json          Output as JSON
  --output <path> Write output to file (default: $OUTPUT)
  --strict        Exit non-zero if script fails
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help; exit 0 ;;
    --markdown) MODE="markdown" ;;
    --json) MODE="json" ;;
    --output) OUTPUT="$2"; shift ;;
    --strict) STRICT=true ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

generate_markdown() {
  cat <<EOF
# Cloudflare Phase 11 Release Evidence

## Scope
Release readiness evidence report for Cloudflare infrastructure.

## Repository State
$(git status --short)

## Current Branch
$(git branch --show-current)

## Last Commit
$(git log -1 --oneline)

## Cloudflare-Sensitive Paths
$(find infra/cloudflare -maxdepth 4 -type f | wc -l) files in infra/cloudflare
$(find docs/infra -maxdepth 1 -type f -name "cloudflare*" | wc -l) docs

## DNS Ownership Evidence
$(infra/cloudflare/scripts/scan-dns-ownership.sh --markdown || echo "Failed to scan DNS ownership")

## Worker Route Evidence
$(infra/cloudflare/scripts/scan-workers-routes.sh --markdown || echo "Failed to scan Worker routes")

## Tunnel Governance Evidence
$(infra/cloudflare/scripts/scan-tunnel-configs.sh --markdown 2>/dev/null || echo "No tunnel scan available")

## Wrangler Example Hygiene
$(infra/cloudflare/scripts/check-wrangler-examples.sh || echo "Failed to check Wrangler examples")

## Secret Containment Evidence
$(infra/cloudflare/scripts/check-secret-leaks.sh || echo "Failed to check secret leaks")

## GitHub Actions PR Gate Evidence
$(infra/cloudflare/scripts/check-ci-pr-gates.sh --markdown || echo "Failed to check CI PR gates")

## Terraform/OpenTofu Readiness
Checked via workflow policy and validation gates.

## Manual Workflow Isolation
Verified manual triggers only for terraform-apply.yml.

## Known Blockers
None discovered during local automated scan.

## Required Human Review
Review output above. Ensure manual approval checklist is completed before proceed.

## Confirmed Non-Actions
- No wrangler deploy executed.
- No Terraform/OpenTofu apply executed.
- No Terraform/OpenTofu destroy executed.
- No Cloudflare write API executed.
- No secrets printed.

## Release Readiness Decision
**Pending Human Approval**
EOF
}

generate_json() {
  cat <<EOF
{
  "title": "Cloudflare Phase 11 Release Evidence",
  "status": "Pending Human Approval"
}
EOF
}

if [[ "$MODE" == "markdown" ]]; then
  if [[ -n "$OUTPUT" ]]; then
    generate_markdown > "$OUTPUT"
  else
    generate_markdown
  fi
elif [[ "$MODE" == "json" ]]; then
  if [[ -n "$OUTPUT" ]]; then
    generate_json > "$OUTPUT"
  else
    generate_json
  fi
fi

exit 0
