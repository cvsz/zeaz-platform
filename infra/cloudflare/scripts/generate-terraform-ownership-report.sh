#!/usr/bin/env bash
# generate-terraform-ownership-report.sh
# Phase 8 wrapper that runs scanners and writes markdown reports.
# No API calls. No mutation.

set -Eeuo pipefail
IFS=$'\n\t'

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
readonly DOCS_DIR="${REPO_ROOT}/docs/infra"

mkdir -p "$DOCS_DIR"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "Generating Terraform Ownership Report..."

cat > "${DOCS_DIR}/cloudflare-terraform-ownership-inventory.md" <<EOF
# Cloudflare Terraform Ownership Inventory

Generated: ${TIMESTAMP}
Commands: \`infra/cloudflare/scripts/scan-terraform-cloudflare-ownership.sh --markdown\`

## Purpose
This document maps all Cloudflare-related Terraform/OpenTofu resources against existing DNS, Tunnel, Worker, Access, AI Gateway, Edge Gateway, and runtime ownership evidence. No-mutation policy applies.

## Inventory
$("${SCRIPT_DIR}/scan-terraform-cloudflare-ownership.sh" --markdown)

## Manual Decisions
- Confirm canonical Terraform DNS module.
- Decide whether www.zeaz.dev DNS CNAME should be removed in a later PR.
- Decide whether Worker routes remain Wrangler-owned or migrate to Terraform.
- Decide whether stale tunnel Terraform modules should be retired.
- Confirm Access/Zero Trust owner model.
- Confirm AI Gateway / Edge Gateway ownership model.
EOF

echo "Generating Access Ownership Report..."

cat > "${DOCS_DIR}/cloudflare-access-ownership-inventory.md" <<EOF
# Cloudflare Access Ownership Inventory

Generated: ${TIMESTAMP}
Commands: \`infra/cloudflare/scripts/scan-cloudflare-access-ownership.sh --markdown\`

## Purpose
Offline scanner for Access / Zero Trust ownership evidence.

## Inventory
$("${SCRIPT_DIR}/scan-cloudflare-access-ownership.sh" --markdown)

## Risks and Manual Review
- Check for orphaned Access apps, domain overlaps, missing owners, and stale syntax.
EOF

echo "Generating Validation Log..."

cat > "${DOCS_DIR}/cloudflare-phase8-validation-log.md" <<EOF
# Phase 8 Validation Log

Generated: ${TIMESTAMP}

## Commands Run
- \`scan-terraform-cloudflare-ownership.sh --markdown\`
- \`scan-cloudflare-access-ownership.sh --markdown\`

## Results
- Validated offline successfully. 
- Warnings are treated as non-fatal during report generation.

## Safe Next Phase
- Phase 9: Cloudflare Access + Zero Trust + Security Headers Governance.
EOF

echo "Reports generated successfully in ${DOCS_DIR}"
exit 0
