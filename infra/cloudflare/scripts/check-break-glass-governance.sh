#!/usr/bin/env bash
set -Eeuo pipefail

MODE="text"
STRICT=false
EVIDENCE_PATH="docs/infra/cloudflare-phase13-runtime-rollback-evidence.md"
TIMEZONE="Asia/Bangkok"

usage() {
  cat << 'EOF'
Usage: check-break-glass-governance.sh [OPTIONS]

Validate Phase 13 break-glass governance requirements.

Options:
  --strict            Fail if any checks fail
  --markdown          Output in markdown format
  --json              Output in JSON format
  --evidence <path>   Path to the rollback evidence file
  --timezone <value>  Expected timezone (default: Asia/Bangkok)
  --help              Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --strict) STRICT=true; shift ;;
    --markdown) MODE="markdown"; shift ;;
    --json) MODE="json"; shift ;;
    --evidence) EVIDENCE_PATH="$2"; shift 2 ;;
    --timezone) TIMEZONE="$2"; shift 2 ;;
    --help) usage; exit 0 ;;
    *) echo "Unknown parameter passed: $1"; exit 2 ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ERRORS=()
WARNINGS=()

check_file() {
  local file="$1"
  if [[ ! -f "$REPO_ROOT/$file" ]]; then
    ERRORS+=("Missing file: $file")
    return 1
  fi
  return 0
}

# 1. Required files
DOCS=(
  "docs/infra/cloudflare-phase13-break-glass-policy.md"
  "docs/infra/cloudflare-phase13-runtime-rollback-evidence.md"
  "docs/infra/cloudflare-phase13-incident-rollback-runbook.md"
  "docs/infra/cloudflare-phase13-post-incident-review.md"
)
SCRIPTS=(
  "infra/cloudflare/scripts/check-break-glass-governance.sh"
  "infra/cloudflare/scripts/generate-runtime-rollback-evidence.sh"
)
WORKFLOWS=(
  ".github/workflows/cloudflare-break-glass-governance.yml"
)

for f in "${DOCS[@]}" "${SCRIPTS[@]}" "${WORKFLOWS[@]}"; do
  check_file "$f"
done

# 2. Check forbidden commands in scripts and workflows
FORBIDDEN_PATTERN="wrangler[[:space:]]+deploy|terraform[[:space:]]+apply|tofu[[:space:]]+apply|terraform[[:space:]]+destroy|tofu[[:space:]]+destroy|make[[:space:]]+tf-apply|make[[:space:]]+zeaz-dev-apply|curl[[:space:]]+-X[[:space:]]+(POST|PUT|PATCH|DELETE)[[:space:]]+https://api\.cloudflare\.com|api\.cloudflare\.com/client/v4"

for f in "${SCRIPTS[@]}" "${WORKFLOWS[@]}"; do
  if [[ -f "$REPO_ROOT/$f" ]]; then
    if grep -qE "$FORBIDDEN_PATTERN" "$REPO_ROOT/$f"; then
      ERRORS+=("Forbidden mutation command found in executable file: $f")
    fi
  fi
done

# 3. Validate Evidence Template Sections and checklist
if [[ -f "$REPO_ROOT/$EVIDENCE_PATH" ]]; then
  content=$(cat "$REPO_ROOT/$EVIDENCE_PATH")
  
  # Sections
  sections=("Incident Metadata" "Emergency Classification" "Runtime Snapshot Before Action" "DNS Ownership Snapshot" "Worker Route Ownership Snapshot" "Tunnel Ownership Snapshot" "Terraform/OpenTofu Scope Snapshot" "Wrangler Scope Snapshot" "Secret Safety Confirmation" "Rollback Candidate" "Rollback Owner" "Rollback Preconditions" "Rollback Trigger" "Rollback Execution Boundary" "Stop Conditions" "Validation After Manual Action" "Evidence Attachments" "Decision" "Post-Incident Review Link")
  for sec in "${sections[@]}"; do
    if ! echo "$content" | grep -qi "## $sec"; then
      ERRORS+=("Missing section in evidence: $sec")
    fi
  done
  
  # Checklist items
  checklists=("Emergency justification is documented" "Named human owner is assigned" "Runtime evidence snapshot exists" "DNS ownership was reviewed" "Worker route ownership was reviewed" "Tunnel ownership was reviewed" "Terraform/OpenTofu scope was reviewed" "Wrangler scope was reviewed" "Secret safety was confirmed" "Rollback plan exists" "Stop conditions are defined" "Post-incident review is required")
  for cl in "${checklists[@]}"; do
    if ! echo "$content" | grep -Fq "[ ] $cl" && ! echo "$content" | grep -Fq "[x] $cl"; then
      ERRORS+=("Missing checklist item in evidence: $cl")
    fi
  done
  
  # Confirmed non-actions
  non_actions=("Phase 13 did not run Wrangler deploy" "Phase 13 did not run Terraform apply" "Phase 13 did not run OpenTofu apply" "Phase 13 did not run destroy" "Phase 13 did not mutate Cloudflare" "Phase 13 did not print secrets" "Phase 13 did not commit credentials")
  for na in "${non_actions[@]}"; do
    if ! echo "$content" | grep -Fq "[ ] $na" && ! echo "$content" | grep -Fq "[x] $na"; then
      ERRORS+=("Missing confirmed non-action in evidence: $na")
    fi
  done

  # Validate timezone
  if ! echo "$content" | grep -q "Timezone: $TIMEZONE"; then
    ERRORS+=("Evidence missing required timezone policy: $TIMEZONE")
  fi
fi

if [[ "$MODE" == "json" ]]; then
  echo "{"
  echo "  \"errors\": ${#ERRORS[@]},"
  echo "  \"warnings\": ${#WARNINGS[@]}"
  echo "}"
elif [[ "$MODE" == "markdown" ]]; then
  echo "### Phase 13 Break-Glass Governance"
  if [[ ${#ERRORS[@]} -gt 0 ]]; then
    for err in "${ERRORS[@]}"; do echo "- ❌ $err"; done
  else
    echo "- ✅ All Phase 13 governance checks passed."
  fi
else
  if [[ ${#ERRORS[@]} -gt 0 ]]; then
    for err in "${ERRORS[@]}"; do echo "[ERROR] $err"; done
  else
    echo "[INFO] All Phase 13 governance checks passed."
  fi
fi

if [[ "$STRICT" == true && ${#ERRORS[@]} -gt 0 ]]; then
  exit 1
fi

exit 0
