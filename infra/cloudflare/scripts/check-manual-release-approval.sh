#!/usr/bin/env bash
# check-manual-release-approval.sh
# Phase 12: Validate that Phase 12 approval evidence exists and is structurally complete.

set -Eeuo pipefail

MODE="human"
STRICT=false
EVIDENCE_PATH="docs/infra/cloudflare-phase12-approval-evidence.md"
CHANGE_WINDOW=""
TIMEZONE=""

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"

show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Validate that Phase 12 approval evidence exists and is structurally complete.

Options:
  --help                Show this help message
  --strict              Exit 1 if evidence is missing or incomplete
  --markdown            Output as markdown
  --json                Output as JSON
  --evidence <path>     Path to the evidence file (default: $EVIDENCE_PATH)
  --change-window <val> Specify change window manually
  --timezone <val>      Specify timezone manually
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help; exit 0 ;;
    --strict) STRICT=true ;;
    --markdown) MODE="markdown" ;;
    --json) MODE="json" ;;
    --evidence) EVIDENCE_PATH="$2"; shift ;;
    --change-window) CHANGE_WINDOW="$2"; shift ;;
    --timezone) TIMEZONE="$2"; shift ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

# Required files
REQUIRED_FILES=(
  "docs/infra/cloudflare-phase12-manual-release-runbook.md"
  "docs/infra/cloudflare-phase12-change-window-policy.md"
  "docs/infra/cloudflare-phase12-rollback-plan.md"
  "$EVIDENCE_PATH"
  "docs/infra/cloudflare-phase11-release-evidence.md"
  "docs/infra/cloudflare-phase11-release-readiness.md"
)

# Required scripts
REQUIRED_SCRIPTS=(
  "infra/cloudflare/scripts/check-release-readiness.sh"
  "infra/cloudflare/scripts/generate-release-evidence.sh"
)

# Required workflows
REQUIRED_WORKFLOWS=(
  ".github/workflows/cloudflare-release-readiness.yml"
)

REQUIRED_SECTIONS=(
  "Release Candidate"
  "Phase 11 Evidence"
  "Human Approval Checklist"
  "Confirmed Non-Actions"
  "Release Decision"
  "Timezone: Asia/Bangkok"
)

REQUIRED_CHECKLIST_ITEMS=(
  "Approval is explicit"
  "Approver is human"
  "Change window is declared"
  "Rollback plan is present"
  "Secret handling is confirmed"
  "DNS ownership is confirmed"
  "Worker route ownership is confirmed"
  "Tunnel ownership is confirmed"
  "Terraform/OpenTofu scope is confirmed"
  "Wrangler scope is confirmed"
  "Emergency stop conditions are understood"
)

REQUIRED_NON_ACTIONS=(
  "No Wrangler deploy was run by Phase 12"
  "No Terraform apply was run by Phase 12"
  "No OpenTofu apply was run by Phase 12"
  "No destroy operation was run by Phase 12"
  "No Cloudflare write API was called by Phase 12"
  "No secrets were printed by Phase 12"
)

declare -a ERRORS=()

# Check files
for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "${REPO_ROOT}/${file}" ]]; then
    ERRORS+=("Missing required file: ${file}")
  fi
done

# Check scripts
for script in "${REQUIRED_SCRIPTS[@]}"; do
  if [[ ! -f "${REPO_ROOT}/${script}" ]]; then
    ERRORS+=("Missing required script: ${script}")
  fi
done

# Check workflows
for wf in "${REQUIRED_WORKFLOWS[@]}"; do
  if [[ ! -f "${REPO_ROOT}/${wf}" ]]; then
    ERRORS+=("Missing required workflow: ${wf}")
  fi
done

# Check evidence content if file exists
EVIDENCE_FILE="${REPO_ROOT}/${EVIDENCE_PATH}"
if [[ -f "$EVIDENCE_FILE" ]]; then
  CONTENT=$(cat "$EVIDENCE_FILE")

  for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! echo "$CONTENT" | grep -q "$section"; then
      ERRORS+=("Evidence missing section/value: ${section}")
    fi
  done

  for item in "${REQUIRED_CHECKLIST_ITEMS[@]}"; do
    if ! echo "$CONTENT" | grep -q "$item"; then
      ERRORS+=("Evidence missing checklist item: ${item}")
    fi
  done

  for item in "${REQUIRED_NON_ACTIONS[@]}"; do
    if ! echo "$CONTENT" | grep -q "$item"; then
      ERRORS+=("Evidence missing non-action confirmation: ${item}")
    fi
  done
fi

# Forbidden content scan (do not scan in node_modules, .git, etc.)
# Find files matching forbidden strings.
FORBIDDEN=(
  "wrangler deploy"
  "terraform apply -auto-approve"
  "tofu apply -auto-approve"
  "terraform destroy"
  "tofu destroy"
  "curl -X POST api.cloudflare.com"
  "curl -X PUT api.cloudflare.com"
  "curl -X PATCH api.cloudflare.com"
  "curl -X DELETE api.cloudflare.com"
)

# We will just do a basic grep over infra/cloudflare/scripts and github workflows for Phase 12
if [[ -d "${REPO_ROOT}/infra/cloudflare/scripts" ]]; then
  for fstring in "${FORBIDDEN[@]}"; do
    if grep -r -q "$fstring" "${REPO_ROOT}/infra/cloudflare/scripts" "${REPO_ROOT}/.github/workflows" 2>/dev/null; then
      ERRORS+=("Forbidden command found in repo: ${fstring}")
    fi
  done
fi

if [[ ${#ERRORS[@]} -eq 0 ]]; then
  if [[ "$MODE" == "json" ]]; then
    echo '{"status": "ok", "errors": []}'
  elif [[ "$MODE" == "markdown" ]]; then
    echo "| Phase 12 Approval Evidence | PASS | Structurally complete |"
  else
    echo "[OK] Phase 12 approval evidence is structurally complete."
  fi
  exit 0
else
  if [[ "$MODE" == "json" ]]; then
    echo '{"status": "error", "errors": ['
    # rudimentary json formatting
    first=1
    for err in "${ERRORS[@]}"; do
      if [ $first -eq 1 ]; then first=0; else echo ","; fi
      echo -n "\"$err\""
    done
    echo ']}'
  elif [[ "$MODE" == "markdown" ]]; then
    echo "| Phase 12 Approval Evidence | FAIL | Missing requirements |"
    for err in "${ERRORS[@]}"; do
      echo "- $err"
    done
  else
    echo "[FAIL] Phase 12 approval evidence has errors:"
    for err in "${ERRORS[@]}"; do
      echo "  - $err"
    done
  fi
  if [[ "$STRICT" == true ]]; then
    exit 1
  fi
  exit 0
fi
