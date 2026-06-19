#!/usr/bin/env bash
# score-cloudflare-change-risk.sh
# Phase 17: Offline pre-merge risk scoring for Cloudflare DNS, Worker,
# Tunnel, Access policy, and IaC changes. Read-only. No network calls.
#
# Capture of --help output:
# Usage: score-cloudflare-change-risk.sh [--help] [--markdown] [--json] [--strict] [--approved] [--live] [change-file]
#
# Score proposed Cloudflare platform changes from a change description.
# If no change-file is provided, reads from stdin when stdin is piped.
#
# Options:
#   --help        Show this help message and exit
#   --markdown    Output a markdown scorecard
#   --json        Output JSON
#   --strict      Exit 1 when aggregate risk is Critical and not approved
#   --approved    Mark a Critical score as manually approved
#   --live        Inspect local live config metadata only; never prints contents
set -Eeuo pipefail
IFS=$'\n\t'

readonly LIVE_CONFIG_PATH="/etc/cloudflared/config.yml"

usage() {
  cat <<EOF
Usage: $(basename "$0") [--help] [--markdown] [--json] [--strict] [--approved] [--live] [change-file]

Score proposed Cloudflare platform changes from a change description.
If no change-file is provided, reads from stdin when stdin is piped.

Read-only behavior:
  - No network access
  - No Cloudflare API calls
  - No deploy/apply/destroy operations
  - No /etc/cloudflared/config.yml read unless --live is passed
  - No secret, token, credential, or private key values printed

Options:
  --help        Show this help message and exit
  --markdown    Output a markdown scorecard
  --json        Output JSON
  --strict      Exit 1 when aggregate risk is Critical and not approved
  --approved    Mark a Critical score as manually approved
  --live        Inspect local live config metadata only; never prints contents

Exit codes:
  0   Risk score generated
  1   Critical unapproved risk detected with --strict
  2   Usage or input error
EOF
}

MODE="human"
STRICT=false
APPROVED=false
LIVE=false
CHANGE_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --markdown)
      MODE="markdown"
      ;;
    --json)
      MODE="json"
      ;;
    --strict)
      STRICT=true
      ;;
    --approved)
      APPROVED=true
      ;;
    --live)
      LIVE=true
      ;;
    -*)
      echo "ERROR: unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      if [[ -n "$CHANGE_FILE" ]]; then
        echo "ERROR: only one change-file argument is supported" >&2
        exit 2
      fi
      CHANGE_FILE="$1"
      ;;
  esac
  shift
done

read_change_content() {
  if [[ -n "$CHANGE_FILE" ]]; then
    if [[ ! -f "$CHANGE_FILE" ]]; then
      echo "ERROR: change description file not found: $CHANGE_FILE" >&2
      exit 2
    fi
    if [[ ! -r "$CHANGE_FILE" ]]; then
      echo "ERROR: change description file is not readable: $CHANGE_FILE" >&2
      exit 2
    fi
    cat "$CHANGE_FILE"
    return
  fi

  if [[ ! -t 0 ]]; then
    cat
  fi
}

map_level() {
  case "$1" in
    1) echo "Low" ;;
    2) echo "Medium" ;;
    3) echo "High" ;;
    4) echo "Critical" ;;
    *) echo "Unknown" ;;
  esac
}

required_approvers_for_score() {
  case "$1" in
    1) echo "Automated check only" ;;
    2) echo "One domain owner" ;;
    3) echo "Terraform/OpenTofu Owner + Platform Security Reviewer" ;;
    4) echo "Release Approver + Platform Security Reviewer + Review Board Quorum (Phase 15)" ;;
    *) echo "Manual review required" ;;
  esac
}

json_escape() {
  local value="${1:-}"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//$'\n'/\\n}"
  value="${value//$'\r'/\\r}"
  value="${value//$'\t'/\\t}"
  printf '%s' "$value"
}

CONTENT="$(read_change_content)"
CONTENT_LOWER="$(printf '%s' "$CONTENT" | tr '[:upper:]' '[:lower:]')"

LIVE_CONFIG_STATUS="not_requested"
LIVE_HOSTNAME_COUNT=0
if [[ "$LIVE" == true ]]; then
  if [[ -r "$LIVE_CONFIG_PATH" ]]; then
    LIVE_CONFIG_STATUS="readable"
    live_hostnames="$(grep -E '^[[:space:]]*-?[[:space:]]*hostname:' "$LIVE_CONFIG_PATH" || true)"
    if [[ -n "$live_hostnames" ]]; then
      LIVE_HOSTNAME_COUNT="$(printf '%s\n' "$live_hostnames" | wc -l | tr -d ' ')"
    fi
  else
    LIVE_CONFIG_STATUS="missing_or_unreadable"
  fi
fi

matches() {
  local regex="$1"
  [[ "$CONTENT_LOWER" =~ $regex ]]
}

prod_domains="$(printf '%s\n' "$CONTENT_LOWER" | grep -Eo '([a-z0-9-]+\.)*zeaz\.dev' || true)"
PROD_DOMAIN_COUNT=0
if [[ -n "$prod_domains" ]]; then
  PROD_DOMAIN_COUNT="$(printf '%s\n' "$prod_domains" | sort -u | wc -l | tr -d ' ')"
fi

declare -a DIMENSION_KEYS=(
  "dns_record_changes"
  "worker_route_changes"
  "tunnel_ingress_changes"
  "terraform_ownership_changes"
  "access_policy_changes"
  "secret_config_file_changes"
  "production_domain_changes"
  "rollback_availability"
  "evidence_completeness"
)

declare -A DIMENSION_NAMES=(
  ["dns_record_changes"]="DNS record changes"
  ["worker_route_changes"]="Worker route changes"
  ["tunnel_ingress_changes"]="Tunnel ingress changes"
  ["terraform_ownership_changes"]="Terraform ownership changes"
  ["access_policy_changes"]="Access policy changes"
  ["secret_config_file_changes"]="Secret/config file changes"
  ["production_domain_changes"]="Production domain changes"
  ["rollback_availability"]="Rollback availability"
  ["evidence_completeness"]="Evidence completeness"
)

declare -A DIMENSION_SCORES=()
declare -A DIMENSION_RATIONALES=()

for key in "${DIMENSION_KEYS[@]}"; do
  DIMENSION_SCORES["$key"]=1
  DIMENSION_RATIONALES["$key"]="No higher-risk indicator detected; confirm manually in the scorecard."
done

set_dimension() {
  local key="$1"
  local score="$2"
  local rationale="$3"
  DIMENSION_SCORES["$key"]="$score"
  DIMENSION_RATIONALES["$key"]="$rationale"
}

if [[ -n "$CONTENT_LOWER" ]]; then
  if matches '(dns|cname|record|zone|hostname|domain)'; then
    if matches '(apex|wildcard|\*\.)'; then
      set_dimension "dns_record_changes" 4 "DNS change references apex or wildcard routing."
    elif [[ "$PROD_DOMAIN_COUNT" -gt 0 ]] || matches '(production|prod)'; then
      set_dimension "dns_record_changes" 3 "DNS change references production domain routing."
    elif matches '(non-prod|nonprod|staging|dev|test)'; then
      set_dimension "dns_record_changes" 2 "DNS change appears limited to a non-production domain."
    fi
  fi

  if matches '(worker|wrangler|worker route)'; then
    if matches '(remove|delete|destroy)' && { [[ "$PROD_DOMAIN_COUNT" -gt 0 ]] || matches '(production|prod)'; }; then
      set_dimension "worker_route_changes" 4 "Worker route removal references production."
    elif [[ "$PROD_DOMAIN_COUNT" -gt 0 ]] || matches '(production|prod)'; then
      set_dimension "worker_route_changes" 3 "Worker route update references production."
    elif matches '(update|modify|change|staging|dev|test|non-prod|nonprod)'; then
      set_dimension "worker_route_changes" 2 "Worker route change appears non-production or limited in scope."
    fi
  fi

  if matches '(tunnel|cloudflared|ingress)'; then
    if matches '(remove|delete|destroy)' && { [[ "$PROD_DOMAIN_COUNT" -gt 0 ]] || matches '(production|prod)'; }; then
      set_dimension "tunnel_ingress_changes" 4 "Tunnel ingress removal references production."
    elif [[ "$PROD_DOMAIN_COUNT" -gt 0 ]] || matches '(production|prod)'; then
      set_dimension "tunnel_ingress_changes" 3 "Tunnel ingress modification references production."
    elif matches '(update|modify|change|staging|dev|test|non-prod|nonprod)'; then
      set_dimension "tunnel_ingress_changes" 2 "Tunnel ingress change appears non-production or limited in scope."
    fi
  fi

  if matches '(terraform|opentofu|tofu|\.tf|tfvars|provider|backend|state)'; then
    if matches '(provider|backend|state|terraform init|tofu init)'; then
      set_dimension "terraform_ownership_changes" 4 "IaC change references provider, backend, or state ownership."
    elif matches '(resource|main\.tf|cloudflare_)'; then
      set_dimension "terraform_ownership_changes" 3 "IaC change references Terraform/OpenTofu resources."
    elif matches '(variable|variables\.tf|output|outputs\.tf|tfvars)'; then
      set_dimension "terraform_ownership_changes" 2 "IaC change references variables or outputs."
    fi
  fi

  if matches '(access policy|zero trust|cloudflare access|saml|oidc|rbac|mfa)'; then
    if matches '(remove|delete|destroy)'; then
      set_dimension "access_policy_changes" 4 "Access policy removal requires critical review."
    elif [[ "$PROD_DOMAIN_COUNT" -gt 0 ]] || matches '(production|prod)'; then
      set_dimension "access_policy_changes" 3 "Access policy update references production."
    elif matches '(staging|dev|test|non-prod|nonprod)'; then
      set_dimension "access_policy_changes" 2 "Access policy update appears non-production."
    fi
  fi

  if matches '(direct secret|secret value|credential value|api token|api key|private key|sops_age_key|cloudflare_api_token|cloudflare_tunnel_token|\.env|tfvars)'; then
    set_dimension "secret_config_file_changes" 4 "Change references direct secret, token, credential, private key, env, or tfvars material."
  elif matches '(credentials-file|production config|prod config|origin_hosts|runtime config)'; then
    set_dimension "secret_config_file_changes" 3 "Change references production runtime or credential-adjacent config."
  elif matches '(dev config|staging config|test config|non-prod config|nonprod config)'; then
    set_dimension "secret_config_file_changes" 2 "Change references non-production config."
  fi

  if matches '(apex|wildcard|\*\.zeaz\.dev)' && [[ "$PROD_DOMAIN_COUNT" -gt 0 ]]; then
    set_dimension "production_domain_changes" 4 "Production apex or wildcard domain is referenced."
  elif [[ "$PROD_DOMAIN_COUNT" -gt 1 ]]; then
    set_dimension "production_domain_changes" 3 "Multiple production domains are referenced."
  elif [[ "$PROD_DOMAIN_COUNT" -eq 1 ]]; then
    set_dimension "production_domain_changes" 2 "One production domain is referenced."
  fi

  if matches '(no rollback|without rollback|rollback absent|no rollback plan)'; then
    set_dimension "rollback_availability" 4 "Rollback plan is absent."
  elif matches '(manual rollback|manual only)'; then
    set_dimension "rollback_availability" 3 "Rollback appears manual-only."
  elif matches '(documented rollback|rollback plan|runbook)'; then
    set_dimension "rollback_availability" 2 "Rollback is documented but not explicitly tested."
  elif matches '(tested rollback|validated rollback)'; then
    set_dimension "rollback_availability" 1 "Rollback is explicitly described as tested."
  fi

  if matches '(evidence absent|no evidence|without evidence)'; then
    set_dimension "evidence_completeness" 4 "Evidence is absent."
  elif matches '(missing evidence|some fields missing|incomplete scorecard)'; then
    set_dimension "evidence_completeness" 3 "Evidence or scorecard fields are missing."
  elif matches '(incomplete evidence|partial evidence|most fields complete)'; then
    set_dimension "evidence_completeness" 2 "Evidence is partially complete."
  elif matches '(full evidence|complete evidence|evidence archive)'; then
    set_dimension "evidence_completeness" 1 "Evidence archive is described as complete."
  fi
fi

AGGREGATE_SCORE=1
for key in "${DIMENSION_KEYS[@]}"; do
  score="${DIMENSION_SCORES[$key]}"
  if [[ "$score" -gt "$AGGREGATE_SCORE" ]]; then
    AGGREGATE_SCORE="$score"
  fi
done

AGGREGATE_LEVEL="$(map_level "$AGGREGATE_SCORE")"
REQUIRED_APPROVERS="$(required_approvers_for_score "$AGGREGATE_SCORE")"

declare -a EVIDENCE_CHECKLIST=(
  "Completed risk scorecard with one checked level per dimension"
  "Rollback plan or runbook reference"
  "Phase 16 evidence archive link"
  "Offline validation command output"
  "Secret scan confirmation for changed docs and scripts"
  "Required approval signatures for aggregate risk level"
)

output_human() {
  echo "=============================================="
  echo "         Cloudflare Change Risk Score"
  echo "=============================================="
  echo "Aggregate Risk Level : ${AGGREGATE_LEVEL}"
  echo "Required Approvers   : ${REQUIRED_APPROVERS}"
  echo "Approved             : $([[ "$APPROVED" == true ]] && echo "Yes" || echo "No")"
  echo "Live Config Read     : $([[ "$LIVE" == true ]] && echo "${LIVE_CONFIG_STATUS} (${LIVE_HOSTNAME_COUNT} hostnames)" || echo "No")"
  echo "----------------------------------------------"
  for key in "${DIMENSION_KEYS[@]}"; do
    score="${DIMENSION_SCORES[$key]}"
    printf '%-30s : %s (%s)\n' "${DIMENSION_NAMES[$key]}" "$(map_level "$score")" "$score"
  done
  echo "----------------------------------------------"
  echo "Evidence Checklist:"
  for item in "${EVIDENCE_CHECKLIST[@]}"; do
    echo "- ${item}"
  done
  echo "=============================================="
}

output_markdown() {
  cat <<EOF
# Cloudflare Change Risk Scorecard

| Field | Value |
|---|---|
| Aggregate risk level | ${AGGREGATE_LEVEL} |
| Aggregate risk score | ${AGGREGATE_SCORE} |
| Required approvers | ${REQUIRED_APPROVERS} |
| Approved | $([[ "$APPROVED" == true ]] && echo "Yes" || echo "No") |
| Live config read | $([[ "$LIVE" == true ]] && echo "${LIVE_CONFIG_STATUS} (${LIVE_HOSTNAME_COUNT} hostnames)" || echo "No") |

## Dimension Scores

| Dimension | Score | Level | Rationale |
|---|---:|---|---|
EOF

  for key in "${DIMENSION_KEYS[@]}"; do
    score="${DIMENSION_SCORES[$key]}"
    echo "| ${DIMENSION_NAMES[$key]} | ${score} | $(map_level "$score") | ${DIMENSION_RATIONALES[$key]} |"
  done

  cat <<EOF

## Evidence Checklist

EOF
  for item in "${EVIDENCE_CHECKLIST[@]}"; do
    echo "- [ ] ${item}"
  done
}

output_json() {
  cat <<EOF
{
  "change_file": "$(json_escape "$CHANGE_FILE")",
  "aggregate_risk_score": ${AGGREGATE_SCORE},
  "aggregate_risk_level": "${AGGREGATE_LEVEL}",
  "required_approvers": "$(json_escape "$REQUIRED_APPROVERS")",
  "approved": ${APPROVED},
  "strict": ${STRICT},
  "live": {
    "requested": ${LIVE},
    "config_status": "$(json_escape "$LIVE_CONFIG_STATUS")",
    "hostname_count": ${LIVE_HOSTNAME_COUNT}
  },
  "dimensions": {
EOF

  local idx=0
  local total="${#DIMENSION_KEYS[@]}"
  for key in "${DIMENSION_KEYS[@]}"; do
    idx=$((idx + 1))
    score="${DIMENSION_SCORES[$key]}"
    comma=","
    [[ "$idx" -eq "$total" ]] && comma=""
    cat <<EOF
    "${key}": {
      "name": "$(json_escape "${DIMENSION_NAMES[$key]}")",
      "score": ${score},
      "level": "$(map_level "$score")",
      "rationale": "$(json_escape "${DIMENSION_RATIONALES[$key]}")"
    }${comma}
EOF
  done

  cat <<EOF
  },
  "evidence_checklist": [
EOF

  local checklist_idx=0
  local checklist_total="${#EVIDENCE_CHECKLIST[@]}"
  for item in "${EVIDENCE_CHECKLIST[@]}"; do
    checklist_idx=$((checklist_idx + 1))
    comma=","
    [[ "$checklist_idx" -eq "$checklist_total" ]] && comma=""
    echo "    \"$(json_escape "$item")\"${comma}"
  done

  cat <<EOF
  ]
}
EOF
}

case "$MODE" in
  human) output_human ;;
  markdown) output_markdown ;;
  json) output_json ;;
esac

if [[ "$STRICT" == true && "$AGGREGATE_SCORE" -eq 4 && "$APPROVED" == false ]]; then
  echo "ERROR: Critical unapproved risk detected. Blocked by Phase 17 risk gate policy." >&2
  exit 1
fi
