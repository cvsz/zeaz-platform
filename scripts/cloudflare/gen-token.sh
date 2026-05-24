#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# scripts/cloudflare/gen-token.sh
# Consolidated from previous master-gen-tokens.sh
# Master Cloudflare Token Generator + secure env writer
# Adds: --dry-run to preview changes; audit log at ./.cloudflare-token-audit.log (no secrets)
# Requires: curl, jq, diff (optional for nicer preview)

API_BASE="https://api.cloudflare.com/client/v4"
DEFAULT_OUT=".env.cloudflare"
AUDIT_LOG="./.cloudflare-token-audit.log"

: "${CLOUDFLARE_EMAIL:?Missing CLOUDFLARE_EMAIL}"
: "${CF_GLOBAL_API_KEY:?Missing CF_GLOBAL_API_KEY}"

TYPES_CSV=""
OUT_FILE="${DEFAULT_OUT}"
FORCE_CREATE=false
REVOKE_OLD=false
PERM_ID_OVERRIDE=""
CLEAN_ENV=false
BACKUP_ENV=false
DRY_RUN=false

usage() {
  cat <<USAGE
Usage:
  CLOUDFLARE_EMAIL=you@example.com CF_GLOBAL_API_KEY=xxxx $0 --types <csv|all> [--write <file>] [--force] [--revoke-old] [--perm-id <id>] [--clean] [--backup] [--dry-run]

Options:
  --types <csv>    Comma-separated list of token types: dns,zt,workers,waf,tunnel,r2 or "all"
  --write <file>   Path to env file to write (default: ${DEFAULT_OUT})
  --force          Create new token even if a token with the same name exists
  --revoke-old     Revoke existing token with same name before creating a new one
  --perm-id <id>   Use this permission-group id instead of resolving by name
  --clean          Remove existing token keys from the env file before generating
  --backup         Create a timestamped backup of the env file before modifying it
  --dry-run        Show what would change in the env file and audit log without writing
  --help           Show this help
USAGE
  exit 1
}

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --types) shift; TYPES_CSV="${1:-}"; shift || true ;;
    --write) shift; OUT_FILE="${1:-$DEFAULT_OUT}"; shift || true ;;
    --force) FORCE_CREATE=true; shift || true ;;
    --revoke-old) REVOKE_OLD=true; shift || true ;;
    --perm-id) shift; PERM_ID_OVERRIDE="${1:-}"; shift || true ;;
    --clean) CLEAN_ENV=true; shift || true ;;
    --backup) BACKUP_ENV=true; shift || true ;;
    --dry-run) DRY_RUN=true; shift || true ;;
    --help|-h) usage ;;
    *) shift || true ;;
  esac
done

if [[ -z "${TYPES_CSV}" ]]; then
  echo "ERROR: --types is required (e.g., --types dns,zt or --types all)" >&2
  usage
fi

# Stable token names
declare -A TOKEN_NAME_MAP=(
  [dns]="zeaz-dns-token"
  [zt]="zeaz-zt-token"
  [workers]="zeaz-workers-token"
  [waf]="zeaz-waf-token"
  [tunnel]="zeaz-tunnel-token"
  [r2]="zeaz-r2-token"
)

# Default permission-group IDs observed in your account listing
declare -A PERM_ID_MAP=(
  [dns]="4755a26eedb94da69e1066d98aa820be"        # DNS Write
  [zt]="b33f02c6f7284e05a6f20741c0bb0567"         # Zero Trust Write
  [workers]="e086da7e2179491d91ee5f35b3ca210a"    # Workers Scripts Write
  [waf]="fb6778dc191143babbfaa57993f1d275"        # Zone WAF Write
  [tunnel]="c07321b023e944ff818fec44d8203567"     # Cloudflare Tunnel Write
  [r2]="bf7481a1826f439697cb59a20b22293e"         # Workers R2 Storage Write
)

# Resource patterns
declare -A RESOURCE_MAP=(
  [dns]="com.cloudflare.api.account.zone.*"
  [zt]="com.cloudflare.api.account.*"
  [workers]="com.cloudflare.api.account.*"
  [waf]="com.cloudflare.api.account.*"
  [tunnel]="com.cloudflare.api.account.*"
  [r2]="com.cloudflare.api.account.*"
)

# Keys we manage in the env file
MANAGED_KEYS=(CF_DNS_TOKEN CF_ZT_TOKEN CF_WORKERS_TOKEN CF_WAF_TOKEN CF_TUNNEL_TOKEN CF_R2_TOKEN CF_ACCOUNT_ID CF_ZONE_ID CLOUDFLARE_API_TOKEN)

log() { printf '[%s] %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$*"; }

cf_api() {
  local method="$1"; local endpoint="$2"; local payload="${3:-}"
  if [[ -n "${payload}" ]]; then
    curl -sS -X "${method}" "${API_BASE}${endpoint}" \
      -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
      -H "X-Auth-Key: ${CF_GLOBAL_API_KEY}" \
      -H "Content-Type: application/json" \
      --data "${payload}"
  else
    curl -sS -X "${method}" "${API_BASE}${endpoint}" \
      -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
      -H "X-Auth-Key: ${CF_GLOBAL_API_KEY}" \
      -H "Content-Type: application/json"
  fi
}

verify_auth() {
  log "Verifying Cloudflare authentication"
  local resp success
  resp="$(cf_api GET "/user")"
  success="$(echo "${resp}" | jq -r '.success')"
  if [[ "${success}" != "true" ]]; then
    echo "${resp}" | jq
    log "Authentication failed"
    exit 1
  fi
  log "Authentication OK"
}

# Tolerant resolver (exact -> fuzzy)
get_permission_id_by_name() {
  local exact_name="$1"
  local resp success id
  resp="$(cf_api GET "/user/tokens/permission_groups")"
  success="$(echo "${resp}" | jq -r '.success')"
  if [[ "${success}" != "true" ]]; then
    echo "${resp}" | jq
    log "Failed to fetch permission groups"
    exit 1
  fi

  id="$(echo "${resp}" | jq -r --arg NAME "${exact_name}" '.result[] | select(.name == $NAME) | .id' | head -n1)"
  if [[ -n "${id}" ]]; then
    printf '%s' "${id}"
    return 0
  fi

  id="$(echo "${resp}" | jq -r --arg NAME "${exact_name}" '.result[] | select(.name | test($NAME; "i")) | .id' | head -n1)"
  if [[ -n "${id}" ]]; then
    log "Using fuzzy match for permission group: ${exact_name} -> id ${id}"
    printf '%s' "${id}"
    return 0
  fi

  log "Permission not found: ${exact_name}"
  log "Available permission groups (name -> id):"
  echo "${resp}" | jq -r '.result[] | "\(.name) -> \(.id)"'
  return 1
}

find_existing_token_id() {
  local name="$1"
  local resp
  resp="$(cf_api GET "/user/tokens")"
  echo "${resp}" | jq -r --arg NAME "${name}" '.result[] | select(.name == $NAME) | .id' | head -n1
}

revoke_token_by_id() {
  local id="$1"
  local resp
  resp="$(cf_api DELETE "/user/tokens/${id}")"
  echo "${resp}" | jq -r '.success'
}

build_payload() {
  local token_name="$1"
  local resource="$2"
  local perm_id="$3"
  jq -n --arg name "$token_name" --arg resource "$resource" --arg perm "$perm_id" '{
    name: $name,
    policies: [
      {
        effect: "allow",
        resources: ( { ($resource): "*" } ),
        permission_groups: [ { id: $perm } ]
      }
    ]
  }'
}

create_token() {
  local payload="$1"
  local resp
  resp="$(cf_api POST "/user/tokens" "${payload}")"
  echo "${resp}" | jq -r '.result.value // empty'
}

# Backup existing env file
backup_env_file() {
  local file="$1"
  if [[ -f "${file}" && "${BACKUP_ENV}" == "true" ]]; then
    local ts
    ts="$(date -u +"%Y%m%dT%H%M%SZ")"
    cp -p "${file}" "${file}.bak.${ts}"
    chmod 600 "${file}.bak.${ts}" || true
    log "Backed up ${file} -> ${file}.bak.${ts}"
  fi
}

# Clean managed keys from env file
clean_env_keys() {
  local file="$1"
  if [[ ! -f "${file}" ]]; then
    log "No env file to clean: ${file}"
    return 0
  fi

  backup_env_file "${file}"

  local tmp
  tmp="$(mktemp "${file}.clean.XXXXXX")"
  chmod 600 "${tmp}"

  while IFS= read -r line; do
    if [[ -z "${line}" || "${line}" =~ ^[[:space:]]*# ]]; then
      printf '%s\n' "${line}" >> "${tmp}"
      continue
    fi
    key="$(echo "${line}" | sed -E 's/^([A-Za-z0-9_]+)=.*/\1/')"
    skip=false
    for k in "${MANAGED_KEYS[@]}"; do
      if [[ "${key}" == "${k}" ]]; then
        skip=true
        break
      fi
    done
    if [[ "${skip}" == "true" ]]; then
      continue
    fi
    printf '%s\n' "${line}" >> "${tmp}"
  done < "${file}"

  mv "${tmp}" "${file}"
  chmod 600 "${file}"
  log "Cleaned managed keys from ${file}"
}

# Check existing keys
check_existing_keys() {
  local file="$1"
  declare -A present
  for k in "${MANAGED_KEYS[@]}"; do present["$k"]=false; done

  if [[ -f "${file}" ]]; then
    while IFS= read -r line; do
      key="$(echo "${line}" | sed -E 's/^([A-Za-z0-9_]+)=.*/\1/')"
      if [[ -n "${key}" && -n "${present[$key]+_}" ]]; then
        present["$key"]=true
      fi
    done < "${file}"
  fi

  log "Existing managed keys in ${file}:"
  for k in "${MANAGED_KEYS[@]}"; do
    if [[ "${present[$k]}" == "true" ]]; then
      printf '  %s: present\n' "${k}"
    else
      printf '  %s: missing\n' "${k}"
    fi
  done
}

# Audit: append metadata (no token secrets)
audit_record() {
  local token_type="$1"
  local token_name="$2"
  local perm_id="$3"
  local action="$4"   # created|skipped|revoked|written
  local actor
  actor="$(whoami 2>/dev/null || echo "${USER:-unknown}")"
  local ts
  ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  mkdir -p "$(dirname "${AUDIT_LOG}")" 2>/dev/null || true
  touch "${AUDIT_LOG}"
  chmod 600 "${AUDIT_LOG}" || true
  printf '%s\t%s\t%s\tperm:%s\taction:%s\tuser:%s\n' "${ts}" "${token_type}" "${token_name}" "${perm_id}" "${action}" "${actor}" >> "${AUDIT_LOG}"
}

# Prepare types array
if [[ "${TYPES_CSV}" == "all" ]]; then
  TYPES_CSV="dns,zt,workers,waf,tunnel,r2"
fi
IFS=',' read -r -a TYPES_ARR <<< "${TYPES_CSV}"

# Prereqs
command -v jq >/dev/null 2>&1 || { echo "ERROR: jq is required" >&2; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "ERROR: curl is required" >&2; exit 1; }

verify_auth

# If requested, check and optionally clean env file before generation
if [[ -n "${OUT_FILE:-}" ]]; then
  log "Target env file: ${OUT_FILE}"
  check_existing_keys "${OUT_FILE}"
  if [[ "${CLEAN_ENV}" == "true" ]]; then
    log "--clean specified: removing managed keys from ${OUT_FILE} before generation"
    clean_env_keys "${OUT_FILE}"
  fi
fi

declare -A GENERATED_TOKENS=()

for t in "${TYPES_ARR[@]}"; do
  t="$(echo -n "${t}" | tr -d '[:space:]')"
  if [[ -z "${t}" ]]; then continue; fi
  if [[ -z "${TOKEN_NAME_MAP[$t]:-}" ]]; then log "Unknown type: ${t}"; continue; fi

  TOKEN_NAME="${TOKEN_NAME_MAP[$t]}"
  RESOURCE="${RESOURCE_MAP[$t]}"

  log "Processing type: ${t} (token name: ${TOKEN_NAME})"

  # Resolve permission id: override > map default > name lookup
  if [[ -n "${PERM_ID_OVERRIDE}" ]]; then
    PERM_ID="${PERM_ID_OVERRIDE}"
    log "Using overridden permission id: ${PERM_ID}"
  elif [[ -n "${PERM_ID_MAP[$t]:-}" ]]; then
    PERM_ID="${PERM_ID_MAP[$t]}"
    log "Using default account permission id for ${t}: ${PERM_ID}"
  else
    PERM_NAME="${PERM_NAME_MAP[$t]:-}"
    if ! PERM_ID="$(get_permission_id_by_name "${PERM_NAME}")"; then
      log "Failed to resolve permission group for ${PERM_NAME}. To diagnose, run:"
      log "  curl -sS -X GET \"${API_BASE}/user/tokens/permission_groups\" -H \"X-Auth-Email: \${CLOUDFLARE_EMAIL}\" -H \"X-Auth-Key: \${CF_GLOBAL_API_KEY}\" | jq -r '.result[] | \"\\(.name)\\t\\(.id)\"'"
      exit 1
    fi
    log "Resolved permission id: ${PERM_ID}"
  fi

  # Check existing token
  EXISTING_ID="$(find_existing_token_id "${TOKEN_NAME}")"
  if [[ -n "${EXISTING_ID}" ]]; then
    if [[ "${REVOKE_OLD}" == "true" ]]; then
      log "Revoking existing token ${TOKEN_NAME} (id: ${EXISTING_ID})"
      if [[ "$(revoke_token_by_id "${EXISTING_ID}")" == "true" ]]; then
        log "Revoked ${EXISTING_ID}"
        audit_record "${t}" "${TOKEN_NAME}" "${PERM_ID}" "revoked"
      else
        log "Failed to revoke ${EXISTING_ID}"
        exit 1
      fi
    elif [[ "${FORCE_CREATE}" != "true" ]]; then
      log "Token ${TOKEN_NAME} already exists (id: ${EXISTING_ID}); skipping creation. Use --force or --revoke-old to replace."
      GENERATED_TOKENS["${t}"]=""
      audit_record "${t}" "${TOKEN_NAME}" "${PERM_ID}" "skipped"
      continue
    else
      log "--force specified: creating additional token (existing id: ${EXISTING_ID})"
    fi
  fi

  PAYLOAD="$(build_payload "${TOKEN_NAME}" "${RESOURCE}" "${PERM_ID}")"
  log "Creating token for ${TOKEN_NAME}"
  TOKEN_VALUE="$(create_token "${PAYLOAD}")"
  if [[ -z "${TOKEN_VALUE}" ]]; then
    log "Token creation failed for ${TOKEN_NAME}"
    exit 1
  fi
  GENERATED_TOKENS["${t}"]="${TOKEN_VALUE}"
  # Print token value to stdout (one line) for automation capture
  printf '%s\n' "${TOKEN_VALUE}"
  log "Created token for ${TOKEN_NAME} (value length: ${#TOKEN_VALUE})"
  audit_record "${t}" "${TOKEN_NAME}" "${PERM_ID}" "created"
done

# Prepare new env content in TMP (atomic)
if [[ -n "${OUT_FILE:-}" ]]; then
  TMP="$(mktemp "${OUT_FILE}.XXXXXX")"
  chmod 600 "${TMP}"

  # Backup if requested
  if [[ "${BACKUP_ENV}" == "true" ]]; then
    backup_env_file "${OUT_FILE}"
  fi

  declare -A NEW_VALUES=()
  for k in "${!GENERATED_TOKENS[@]}"; do
    case "$k" in
      dns) NEW_VALUES[CF_DNS_TOKEN]="${GENERATED_TOKENS[$k]}" ;;
      zt) NEW_VALUES[CF_ZT_TOKEN]="${GENERATED_TOKENS[$k]}" ;;
      workers) NEW_VALUES[CF_WORKERS_TOKEN]="${GENERATED_TOKENS[$k]}" ;;
      waf) NEW_VALUES[CF_WAF_TOKEN]="${GENERATED_TOKENS[$k]}" ;;
      tunnel) NEW_VALUES[CF_TUNNEL_TOKEN]="${GENERATED_TOKENS[$k]}" ;;
      r2) NEW_VALUES[CF_R2_TOKEN]="${GENERATED_TOKENS[$k]}" ;;
    esac
  done

  # Preserve existing lines except keys we will overwrite
  if [[ -f "${OUT_FILE}" ]]; then
    while IFS= read -r line; do
      if [[ -z "${line}" || "${line}" =~ ^[[:space:]]*# ]]; then
        printf '%s\n' "${line}" >> "${TMP}"
        continue
      fi
      key="$(echo "${line}" | sed -E 's/^([A-Za-z0-9_]+)=.*/\1/')"
      if [[ -n "${NEW_VALUES[$key]:-}" ]]; then
        continue
      fi
      printf '%s\n' "${line}" >> "${TMP}"
    done < "${OUT_FILE}"
  fi

  # Ensure account-level keys (preserve env values if set)
  {
    printf 'CF_ACCOUNT_ID="%s"\n' "${CF_ACCOUNT_ID:-}"
    printf 'CF_ZONE_ID="%s"\n' "${CF_ZONE_ID:-}"
    printf 'CLOUDFLARE_API_TOKEN="%s"\n\n' "${CLOUDFLARE_API_TOKEN:-}"
  } >> "${TMP}"

  # Append token keys (use generated values, else preserve env or template value)
  for key in CF_DNS_TOKEN CF_ZT_TOKEN CF_WORKERS_TOKEN CF_WAF_TOKEN CF_TUNNEL_TOKEN CF_R2_TOKEN; do
    if [[ -n "${NEW_VALUES[$key]:-}" ]]; then
      printf '%s="%s"\n' "${key}" "${NEW_VALUES[$key]}" >> "${TMP}"
    else
      existing_env_val="${!key:-}"
      if [[ -n "${existing_env_val}" ]]; then
        printf '%s="%s"\n' "${key}" "${existing_env_val}" >> "${TMP}"
      else
        printf '%s="%s"\n' "${key}" "replace-with-${key,,}" >> "${TMP}"
      fi
    fi
  done

  # DRY RUN: show diff/preview and exit without writing
  if [[ "${DRY_RUN}" == "true" ]]; then
    log "--dry-run specified: showing preview of changes (no files will be written)"
    if command -v diff >/dev/null 2>&1 && [[ -f "${OUT_FILE}" ]]; then
      diff -u "${OUT_FILE}" "${TMP}" || true
    else
      echo "----- NEW .env content preview -----"
      cat "${TMP}"
      echo "----- end preview -----"
    fi
    # show what would be appended to audit log
    echo
    echo "----- Audit log preview (would append) -----"
    for t in "${!GENERATED_TOKENS[@]}"; do
      token_name="${TOKEN_NAME_MAP[$t]}"
      perm_id="${PERM_ID_MAP[$t]:-${PERM_ID_OVERRIDE:-unknown}}"
      ts="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
      actor="$(whoami 2>/dev/null || echo "${USER:-unknown}")"
      printf '%s\t%s\t%s\tperm:%s\taction:%s\tuser:%s\n' "${ts}" "${t}" "${token_name}" "${perm_id}" "created" "${actor}"
    done
    echo "----- end audit preview -----"
    rm -f "${TMP}"
    exit 0
  fi

  # Move TMP -> OUT_FILE (atomic)
  mv "${TMP}" "${OUT_FILE}"
  chmod 600 "${OUT_FILE}"
  log "Wrote ${OUT_FILE} with permissions 600"

  # Record audit entries for writes
  for t in "${!GENERATED_TOKENS[@]}"; do
    token_name="${TOKEN_NAME_MAP[$t]}"
    perm_id="${PERM_ID_MAP[$t]:-${PERM_ID_OVERRIDE:-unknown}}"
    audit_record "${t}" "${token_name}" "${perm_id}" "written"
  done
fi

# Summary
printf '\n'
printf '=========================================\n'
printf 'SUMMARY\n'
printf '=========================================\n'
for t in "${TYPES_ARR[@]}"; do
  t="$(echo -n "${t}" | tr -d '[:space:]')"
  case "$t" in
    dns) key=CF_DNS_TOKEN ;;
    zt) key=CF_ZT_TOKEN ;;
    workers) key=CF_WORKERS_TOKEN ;;
    waf) key=CF_WAF_TOKEN ;;
    tunnel) key=CF_TUNNEL_TOKEN ;;
    r2) key=CF_R2_TOKEN ;;
    *) key="" ;;
  esac

  if [[ -z "${key}" ]]; then
    printf '%s: skipped (unknown type)\n' "${t}"
    continue
  fi

  val="${GENERATED_TOKENS[$t]:-}"
  if [[ -n "${val}" ]]; then
    printf '%s: created%s\n' "${key}" "${OUT_FILE:+ and will be written to ${OUT_FILE}}"
  else
    printf '%s: not created (existing token preserved or skipped)\n' "${key}"
  fi
done

printf '\nDone.\n'
exit 0
