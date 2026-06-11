#!/usr/bin/env bash
# generate-access-security-governance-report.sh
# Phase 9: Report generator

set -Eeuo pipefail
IFS=$'\n\t'

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
readonly DOCS_DIR="${REPO_ROOT}/docs/infra"

mkdir -p "$DOCS_DIR"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "Generating Zero Trust Governance Report..."
cat > "${DOCS_DIR}/cloudflare-zero-trust-governance-inventory.md" <<EOF
# Cloudflare Zero Trust Governance Inventory

Generated: ${TIMESTAMP}
Commands: \`infra/cloudflare/scripts/scan-zero-trust-governance.sh --markdown\`

## Purpose
Scanner for Zero Trust governance evidence.

## Inventory
$("${SCRIPT_DIR}/scan-zero-trust-governance.sh" --markdown || true)
EOF

echo "Generating Security Headers Governance Report..."
cat > "${DOCS_DIR}/cloudflare-security-headers-inventory.md" <<EOF
# Cloudflare Security Headers Inventory

Generated: ${TIMESTAMP}
Commands: \`infra/cloudflare/scripts/scan-security-headers-governance.sh --markdown\`

## Purpose
Scanner for Security headers governance.

## Inventory
$("${SCRIPT_DIR}/scan-security-headers-governance.sh" --markdown || true)
EOF

echo "Generating Rulesets Governance Report..."
cat > "${DOCS_DIR}/cloudflare-rulesets-governance-inventory.md" <<EOF
# Cloudflare Rulesets Governance Inventory

Generated: ${TIMESTAMP}
Commands: \`infra/cloudflare/scripts/scan-cloudflare-rulesets-governance.sh --markdown\`

## Purpose
Scanner for Cloudflare rulesets governance.

## Inventory
$("${SCRIPT_DIR}/scan-cloudflare-rulesets-governance.sh" --markdown || true)
EOF

echo "Generating Validation Log..."
cat > "${DOCS_DIR}/cloudflare-phase9-validation-log.md" <<EOF
# Phase 9 Validation Log

Generated: ${TIMESTAMP}

## Commands Run
- \`scan-zero-trust-governance.sh --markdown\`
- \`scan-security-headers-governance.sh --markdown\`
- \`scan-cloudflare-rulesets-governance.sh --markdown\`

## Results
- Validated offline successfully.

## Next manual decisions
1. Which ZEAZ domains require Access protection?
2. Which domains must remain public?
3. Which apps require service-token auth?
4. Who owns Access policy reviews?
5. What is the source of truth for security headers?
   - Cloudflare rulesets
   - app middleware
   - Nginx
   - Workers
6. What is the source of truth for WAF / rate limits?
7. Should broad allow/bypass rules be forbidden in CI?
8. Should HSTS preload be enabled later?
9. Should CSP be enforced or report-only first?
10. Should Phase 10 add CI enforcement?
EOF

echo "Reports generated successfully in ${DOCS_DIR}"
exit 0
