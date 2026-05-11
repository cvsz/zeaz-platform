#!/usr/bin/env bash
# =============================================================================
# scripts/cloudflare/clean-and-regenerate-tokens.sh
#
# Revoke duplicate and stale Cloudflare API tokens, then optionally regenerate.
#
# Requirements : bash >= 4.0, curl, jq
# Auth         : CF_EMAIL + CF_GLOBAL_API_KEY (Global API Key, not a token)
#
# Usage examples
# --------------
# 1. Preview only (dry-run):
#    CF_EMAIL=you@example.com CF_GLOBAL_API_KEY=xxxx \
#      ./clean-and-regenerate-tokens.sh --keep-most 1 --unused-days 90 --dry-run
#
# 2. Backup, revoke interactively:
#    CF_EMAIL=you@example.com CF_GLOBAL_API_KEY=xxxx \
#      ./clean-and-regenerate-tokens.sh --keep-most 1 --unused-days 90 --backup
#
# 3. Non-interactive revoke + regenerate DNS token, write env:
#    CF_EMAIL=you@example.com CF_GLOBAL_API_KEY=xxxx \
#      ./clean-and-regenerate-tokens.sh \
#        --keep-most 1 --unused-days 90 --backup --yes \
#        --regenerate --types dns --write .env.cloudflare \
#        --perm-id b33f02c6f7284e05a6f20741c0bb0567
# =============================================================================
set -Eeuo pipefail
IFS=$'\n\t'

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
readonly API_BASE="https://api.cloudflare.com/client/v4"
readonly AUDIT_LOG="./.cloudflare-token-audit.log"
readonly BACKUP_DIR="./.cloudflare-backups"
readonly DEFAULT_OUT=".env.cloudflare"
readonly TOKEN_QUOTA=50

# ---------------------------------------------------------------------------
# Credential validation (fail fast before any work)
# ---------------------------------------------------------------------------
: "${CF_EMAIL:?CF_EMAIL must be exported (e.g. export CF_EMAIL=you@example.com)}"
: "${CF_GLOBAL_API_KEY:?CF_GLOBAL_API_KEY must be exported}"

# ---------------------------------------------------------------------------
# Option defaults
# ---------------------------------------------------------------------------
NAME_FILTER=""
UNUSED_DAYS=0
KEEP_MOST=1
DO_BACKUP=false
DRY_RUN=false
ASSUME_YES=false
REGENERATE=false
TYPES_CSV=""
OUT_FILE="${DEFAULT_OUT}"
PERM_ID_OVERRIDE=""

# ---------------------------------------------------------------------------
# Usage
# ---------------------------------------------------------------------------
usage() {
  cat <<USAGE
Usage: CF_EMAIL=<email> CF_GLOBAL_API_KEY=<key> $(basename "$0") [options]

Cleaning options:
  --name <token-name>    Restrict to tokens whose name matches exactly
  --unused-days <N>      Revoke tokens last used (or created) more than N days
                         ago; 0 = disabled (default: 0)
  --keep-most <N>        Keep the N newest tokens per name; revoke the rest
                         (default: 1)

Safety options:
  --backup               Save the token list JSON before making any changes
  --dry-run              Print candidates; make no API calls
  --yes                  Skip interactive confirmation prompt

Regeneration options:
  --regenerate           After cleaning, create new tokens for --types
  --types <csv|all>      Comma-separated types: dns,zt,workers,waf,tunnel,r2
  --write <file>         Env file to (re)write with new token values
                         (default: ${DEFAULT_OUT})
  --perm-id <id>         Override the permission-group ID for all created tokens

  --help, -h             Show this message
USAGE
  exit 0
}

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)         shift; NAME_FILTER="${1:-}";          shift || true ;;
    --unused-days)  shift; UNUSED_DAYS="${1:-0}";         shift || true ;;
    --keep-most)    shift; KEEP_MOST="${1:-1}";           shift || true ;;
    --backup)       DO_BACKUP=true;                       shift ;;
    --dry-run)      DRY_RUN=true;                         shift ;;
    --yes)          ASSUME_YES=true;                      shift ;;
    --regenerate)   REGENERATE=true;                      shift ;;
    --types)        shift; TYPES_CSV="${1:-}";            shift || true ;;
    --write)        shift; OUT_FILE="${1:-$DEFAULT_OUT}"; shift || true ;;
    --perm-id)      shift; PERM_ID_OVERRIDE="${1:-}";    shift || true ;;
    --help|-h)      usage ;;
    *)              echo "WARN: Unknown option '$1' — ignoring"; shift ;;
  esac
done

# ---------------------------------------------------------------------------
# Dependency check
# ---------------------------------------------------------------------------
_require() { command -v "$1" >/dev/null 2>&1 || { echo "ERROR: '$1' is required but not found in PATH"; exit 1; }; }
_require curl
_require jq

# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------
log()   { printf '[%s] %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$*"; }
warn()  { log "WARN  $*" >&2; }
die()   { log "ERROR $*" >&2; exit 1; }
audit() {
  # audit <name> <id> <action> [extra_kv...]
  local name="$1" id="$2" action="$3"; shift 3
  touch "${AUDIT_LOG}"; chmod 600 "${AUDIT_LOG}"
  printf '%s\tname:%s\tid:%s\taction:%s\tuser:%s%s\n' \
    "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    "${name}" "${id}" "${action}" \
    "$(whoami 2>/dev/null || echo "${USER:-unknown}")" \
    "${*:+ $*}" \
    >> "${AUDIT_LOG}"
}

# ---------------------------------------------------------------------------
# Cloudflare API helper — always returns raw JSON; caller checks .success
# ---------------------------------------------------------------------------
cf_api() {
  local method="$1" endpoint="$2" payload="${3:-}"
  local args=(-sS -X "${method}" "${API_BASE}${endpoint}"
    -H "X-Auth-Email: ${CF_EMAIL}"
    -H "X-Auth-Key: ${CF_GLOBAL_API_KEY}"
    -H "Content-Type: application/json")
  [[ -n "${payload}" ]] && args+=(--data "${payload}")
  curl "${args[@]}"
}

# ---------------------------------------------------------------------------
# Fetch token list (shared; used in multiple sections)
# ---------------------------------------------------------------------------
_fetch_token_list() {
  local json
  json="$(cf_api GET "/user/tokens")" || die "curl failed while fetching token list"
  [[ -z "${json}" ]]     && die "Empty response from Cloudflare API"
  local ok
  ok="$(printf '%s' "${json}" | jq -r '.success // false')"
  [[ "${ok}" != "true" ]] && die "Cloudflare API error: $(printf '%s' "${json}" | jq -c '.errors')"
  printf '%s' "${json}"
}

# ---------------------------------------------------------------------------
# Optional backup
# ---------------------------------------------------------------------------
_backup() {
  local json="$1" label="${2:-tokens}"
  mkdir -p "${BACKUP_DIR}"
  local ts file
  ts="$(date -u +"%Y%m%dT%H%M%SZ")"
  file="${BACKUP_DIR}/${label}.${ts}.json"
  printf '%s\n' "${json}" > "${file}"
  chmod 600 "${file}"
  log "Backup saved: ${file}"
}

# ===========================================================================
# PHASE 1 — BUILD CANDIDATE LISTS
# ===========================================================================
log "Fetching token list …"
TOKEN_LIST_JSON="$(_fetch_token_list)"

[[ "${DO_BACKUP}" == "true" ]] && _backup "${TOKEN_LIST_JSON}" "tokens"

# Parse every token into a flat array: "id\tname\tcreated_at\tlast_used_at"
mapfile -t _ALL_TOKENS < <(
  printf '%s' "${TOKEN_LIST_JSON}" \
    | jq -r '.result[] | "\(.id)\t\(.name)\t\(.created_at // "")\t\(.last_used_at // "")"'
)

now_epoch=$(date -u +%s)
cutoff_epoch=0
if [[ "${UNUSED_DAYS}" -gt 0 ]]; then
  cutoff_epoch=$(( now_epoch - UNUSED_DAYS * 24 * 3600 ))
fi

# Group tokens by name: GROUPS[name] = "epoch:id||epoch:id||…"
declare -A _GROUPS=()
# Flat list for unused-age check: "id|name|last_epoch|created_at|last_used_at"
declare -a _CANDIDATES=()

_epoch_of() {
  # Best-effort parse of an ISO-8601 timestamp to Unix epoch; returns 0 on failure
  local ts="${1:-}"
  [[ -z "${ts}" ]] && echo 0 && return
  date -u -d "${ts}" +%s 2>/dev/null || echo 0
}

for _line in "${_ALL_TOKENS[@]}"; do
  IFS=$'\t' read -r _id _name _created _last_used <<< "${_line}"

  # Apply optional name filter
  [[ -n "${NAME_FILTER}" && "${_name}" != "${NAME_FILTER}" ]] && continue

  # Compute last activity epoch (prefer last_used_at, fall back to created_at)
  _last_epoch=0
  if [[ -n "${_last_used}" ]]; then
    _last_epoch="$(_epoch_of "${_last_used}")"
  fi
  if [[ "${_last_epoch}" -eq 0 && -n "${_created}" ]]; then
    _last_epoch="$(_epoch_of "${_created}")"
  fi

  _GROUPS["${_name}"]+="${_last_epoch}:${_id}||"
  _CANDIDATES+=("${_id}|${_name}|${_last_epoch}|${_created}|${_last_used}")
done

# ---------------------------------------------------------------------------
# Determine tokens to revoke
# ---------------------------------------------------------------------------
declare -a _TO_REVOKE=()

# 1) Duplicates: keep newest KEEP_MOST per name
for _name in "${!_GROUPS[@]}"; do
  declare -a _pairs=()
  IFS='||' read -r -a _raw <<< "${_GROUPS[$_name]}"
  for _e in "${_raw[@]}"; do
    [[ -z "${_e}" ]] && continue
    _pairs+=("${_e}")
  done

  # Sort descending (newest first)
  IFS=$'\n' _sorted=($(printf '%s\n' "${_pairs[@]}" | sort -rn))
  _idx=0
  for _p in "${_sorted[@]}"; do
    _rid="${_p#*:}"
    [[ "${_idx}" -ge "${KEEP_MOST}" ]] && _TO_REVOKE+=("${_rid}")
    _idx=$(( _idx + 1 ))
  done
  unset _pairs _sorted
done

# 2) Stale tokens: last activity older than cutoff_epoch
if [[ "${cutoff_epoch}" -gt 0 ]]; then
  for _entry in "${_CANDIDATES[@]}"; do
    IFS='|' read -r _id _name _last_epoch _created _last_used <<< "${_entry}"
    if [[ "${_last_epoch}" -gt 0 && "${_last_epoch}" -lt "${cutoff_epoch}" ]]; then
      _TO_REVOKE+=("${_id}")
    fi
  done
fi

# Deduplicate final revocation list (preserve first-seen order)
declare -A _seen=()
declare -a FINAL_REVOKE=()
for _id in "${_TO_REVOKE[@]}"; do
  [[ -z "${_id}" ]] && continue
  if [[ -z "${_seen[$_id]:-}" ]]; then
    FINAL_REVOKE+=("${_id}")
    _seen[$_id]=1
  fi
done

# Helper: look up a field for a given token ID from the cached list
_token_field() { printf '%s' "${TOKEN_LIST_JSON}" | jq -r --arg ID "$1" --arg F "$2" '.result[] | select(.id==$ID) | .[$F]'; }

# ===========================================================================
# PHASE 2 — REVOCATION
# ===========================================================================
if [[ "${DRY_RUN}" == "true" ]]; then
  log "DRY-RUN: ${#FINAL_REVOKE[@]} token(s) would be revoked (no API calls made)"
  for _id in "${FINAL_REVOKE[@]}"; do
    _n="$(_token_field "${_id}" "name")"
    _c="$(_token_field "${_id}" "created_at")"
    _u="$(_token_field "${_id}" "last_used_at")"
    printf '  %-38s  name=%-30s  created=%s  last_used=%s\n' "${_id}" "${_n}" "${_c}" "${_u:-never}"
  done
else
  if [[ "${#FINAL_REVOKE[@]}" -eq 0 ]]; then
    log "No tokens matched revocation criteria."
  else
    log "${#FINAL_REVOKE[@]} token(s) selected for revocation:"
    for _id in "${FINAL_REVOKE[@]}"; do
      _n="$(_token_field "${_id}" "name")"
      _c="$(_token_field "${_id}" "created_at")"
      _u="$(_token_field "${_id}" "last_used_at")"
      printf '  %-38s  name=%-30s  created=%s  last_used=%s\n' "${_id}" "${_n}" "${_c}" "${_u:-never}"
    done

    if [[ "${ASSUME_YES}" != "true" ]]; then
      read -r -p "Proceed to revoke these ${#FINAL_REVOKE[@]} token(s)? [y/N] " _ans
      case "${_ans}" in y|Y|yes|Yes) : ;; *) log "Aborted by user."; exit 0 ;; esac
    fi

    [[ "${DO_BACKUP}" == "true" ]] && _backup "${TOKEN_LIST_JSON}" "tokens.pre-revoke"

    for _id in "${FINAL_REVOKE[@]}"; do
      _n="$(_token_field "${_id}" "name")"
      log "Revoking: id=${_id}  name=${_n}"
      _resp="$(cf_api DELETE "/user/tokens/${_id}")"
      _ok="$(printf '%s' "${_resp}" | jq -r '.success // false')"
      if [[ "${_ok}" == "true" ]]; then
        log "  ✓ Revoked ${_id} (${_n})"
        audit "${_n}" "${_id}" "revoked"
      else
        _errs="$(printf '%s' "${_resp}" | jq -c '.errors')"
        warn "  ✗ Failed to revoke ${_id} (${_n}): ${_errs}"
        audit "${_n}" "${_id}" "revoke_failed" "errors:${_errs}"
      fi
    done
  fi
fi

# ===========================================================================
# PHASE 3 — REGENERATION (optional)
# ===========================================================================
[[ "${REGENERATE}" != "true" ]] && { log "Done."; exit 0; }

if [[ -z "${TYPES_CSV}" ]]; then
  warn "--regenerate was set but --types was not provided; skipping regeneration."
  exit 0
fi

# ---------------------------------------------------------------------------
# Known defaults (account-specific permission-group IDs — override with --perm-id)
# ---------------------------------------------------------------------------
declare -A _PERM_ID_MAP=(
  [dns]="4755a26eedb94da69e1066d98aa820be"
  [zt]="b33f02c6f7284e05a6f20741c0bb0567"
  [workers]="e086da7e2179491d91ee5f35b3ca210a"
  [waf]="fb6778dc191143babbfaa57993f1d275"
  [tunnel]="c07321b023e944ff818fec44d8203567"
  [r2]="bf7481a1826f439697cb59a20b22293e"
)
declare -A _TOKEN_NAME_MAP=(
  [dns]="zeaz-dns-token"
  [zt]="zeaz-zt-token"
  [workers]="zeaz-workers-token"
  [waf]="zeaz-waf-token"
  [tunnel]="zeaz-tunnel-token"
  [r2]="zeaz-r2-token"
)
declare -A _RESOURCE_MAP=(
  [dns]="com.cloudflare.api.account.zone.*"
  [zt]="com.cloudflare.api.account.*"
  [workers]="com.cloudflare.api.account.*"
  [waf]="com.cloudflare.api.account.*"
  [tunnel]="com.cloudflare.api.account.*"
  [r2]="com.cloudflare.api.account.*"
)
# Maps token type to the env-file key name
declare -A _ENV_KEY_MAP=(
  [dns]="CF_DNS_TOKEN"
  [zt]="CF_ZT_TOKEN"
  [workers]="CF_WORKERS_TOKEN"
  [waf]="CF_WAF_TOKEN"
  [tunnel]="CF_TUNNEL_TOKEN"
  [r2]="CF_R2_TOKEN"
)

[[ "${TYPES_CSV}" == "all" ]] && TYPES_CSV="dns,zt,workers,waf,tunnel,r2"
IFS=',' read -r -a _TYPES_ARR <<< "${TYPES_CSV}"

declare -A _GENERATED=()

for _t in "${_TYPES_ARR[@]}"; do
  _t="${_t// /}"
  [[ -z "${_t}" ]] && continue

  if [[ -z "${_PERM_ID_MAP[$_t]:-}" ]]; then
    warn "Unknown token type '${_t}' — skipping. Valid types: ${!_PERM_ID_MAP[*]}"
    continue
  fi

  _tok_name="${_TOKEN_NAME_MAP[$_t]}"
  _resource="${_RESOURCE_MAP[$_t]}"
  _perm="${PERM_ID_OVERRIDE:-${_PERM_ID_MAP[$_t]}}"

  log "Regenerating: type=${_t}  name=${_tok_name}  perm=${_perm}"

  # Re-fetch the current count each iteration (prior revocations freed slots)
  _current_count="$(cf_api GET "/user/tokens" | jq '.result | length')"
  if [[ "${_current_count}" -ge "${TOKEN_QUOTA}" ]]; then
    die "Token quota reached (${_current_count}/${TOKEN_QUOTA}). Revoke more tokens before regenerating."
  fi

  _payload="$(jq -n \
    --arg name     "${_tok_name}" \
    --arg resource "${_resource}" \
    --arg perm     "${_perm}" \
    '{
      name: $name,
      policies: [{
        effect: "allow",
        resources: { ($resource): "*" },
        permission_groups: [{ id: $perm }]
      }]
    }')"

  if [[ "${DRY_RUN}" == "true" ]]; then
    log "  DRY-RUN: would create '${_tok_name}' with perm=${_perm}"
    audit "${_tok_name}" "n/a" "dry-run-create" "type:${_t}" "perm:${_perm}"
    _GENERATED["${_t}"]=""
    continue
  fi

  _resp="$(cf_api POST "/user/tokens" "${_payload}")"
  _val="$(printf '%s' "${_resp}" | jq -r '.result.value // empty')"

  if [[ -z "${_val}" ]]; then
    _errs="$(printf '%s' "${_resp}" | jq -c '.errors')"
    audit "${_tok_name}" "n/a" "create_failed" "type:${_t}" "perm:${_perm}" "errors:${_errs}"
    die "Token creation failed for '${_tok_name}': ${_errs}"
  fi

  _GENERATED["${_t}"]="${_val}"
  audit "${_tok_name}" "$(printf '%s' "${_resp}" | jq -r '.result.id // "unknown"')" "created" "type:${_t}" "perm:${_perm}"
  log "  ✓ Created '${_tok_name}' (value length: ${#_val})"
done

# ---------------------------------------------------------------------------
# Write env file (atomic replace)
# ---------------------------------------------------------------------------
if [[ -z "${OUT_FILE:-}" ]]; then
  log "No --write target specified; skipping env file update."
  log "Done."
  exit 0
fi

_MANAGED_KEYS=(CF_DNS_TOKEN CF_ZT_TOKEN CF_WORKERS_TOKEN CF_WAF_TOKEN CF_TUNNEL_TOKEN CF_R2_TOKEN)

_tmp="$(mktemp "${OUT_FILE}.XXXXXX")"
chmod 600 "${_tmp}"

# Preserve existing lines that are not managed by this script
if [[ -f "${OUT_FILE}" ]]; then
  while IFS= read -r _line || [[ -n "${_line}" ]]; do
    _key="$(printf '%s' "${_line}" | sed -E 's/^([A-Za-z0-9_]+)=.*/\1/')"
    _skip=false
    for _k in "${_MANAGED_KEYS[@]}"; do
      [[ "${_key}" == "${_k}" ]] && _skip=true && break
    done
    "${_skip}" || printf '%s\n' "${_line}" >> "${_tmp}"
  done < "${OUT_FILE}"
fi

# Write Cloudflare account-level variables (values come from env if already set)
printf 'CF_ACCOUNT_ID="%s"\n' "${CF_ACCOUNT_ID:-}"  >> "${_tmp}"
printf 'CF_ZONE_ID="%s"\n'    "${CF_ZONE_ID:-}"     >> "${_tmp}"
printf 'CF_API_TOKEN="%s"\n'  "${CF_API_TOKEN:-}"   >> "${_tmp}"
printf '\n' >> "${_tmp}"

# Write token values
for _k in "${_MANAGED_KEYS[@]}"; do
  # Derive the type key (CF_DNS_TOKEN → dns)
  _type_key="$(printf '%s' "${_k}" | sed -E 's/^CF_//; s/_TOKEN$//; s/ZT$/zt/' | tr '[:upper:]' '[:lower:]')"
  _new_val="${_GENERATED[$_type_key]:-}"

  if [[ -n "${_new_val}" ]]; then
    printf '%s="%s"\n' "${_k}" "${_new_val}" >> "${_tmp}"
  else
    # Preserve existing env value if present, else write a placeholder
    _existing="${!_k:-}"
    if [[ -n "${_existing}" ]]; then
      printf '%s="%s"\n' "${_k}" "${_existing}" >> "${_tmp}"
    else
      printf '%s="replace-with-%s"\n' "${_k}" "${_k,,}" >> "${_tmp}"
    fi
  fi
done

# Dry-run: show diff and clean up
if [[ "${DRY_RUN}" == "true" ]]; then
  log "DRY-RUN: preview of ${OUT_FILE}"
  if command -v diff >/dev/null 2>&1 && [[ -f "${OUT_FILE}" ]]; then
    diff -u "${OUT_FILE}" "${_tmp}" || true
  else
    cat "${_tmp}"
  fi
  rm -f "${_tmp}"
  log "Done (dry-run)."
  exit 0
fi

mv "${_tmp}" "${OUT_FILE}"
chmod 600 "${OUT_FILE}"
log "Wrote ${OUT_FILE} (mode 600)"

log "Done."
exit 0
