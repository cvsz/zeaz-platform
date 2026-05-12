#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

API_BASE="${CF_API_BASE:-https://api.cloudflare.com/client/v4}"
AUDIT_LOG="${AUDIT_LOG:-./.cloudflare-token-audit.log}"
BACKUP_DIR="${BACKUP_DIR:-./.cloudflare-backups}"
DEFAULT_OUT="${DEFAULT_OUT:-.env.cloudflare}"
TOKEN_QUOTA="${TOKEN_QUOTA:-50}"
PRESERVE_TOKEN_NAME_REGEX="${PRESERVE_TOKEN_NAME_REGEX:-(^|[-_])(audit|ai[-_]?gateway)([-_]|$)}"

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

usage(){
  cat <<USAGE
Usage: CF_EMAIL=<email> CF_GLOBAL_API_KEY=<key> $0 [options]

Cleaning:
  --name <token-name>    Restrict cleanup to an exact token name
  --unused-days <N>      Revoke tokens inactive for more than N days; 0 disables
  --keep-most <N>        Keep N newest tokens per name; revoke older duplicates

Safety:
  --backup               Save token list before mutations
  --dry-run              Preview only; no API mutations
  --yes                  Required for live revocation/regeneration

Regeneration:
  --regenerate           Create replacement tokens for --types
  --types <csv|all>      dns,zt,workers,waf,tunnel,r2 or all
  --write <file>         Write generated tokens to env file
  --perm-id <id>         Override permission-group ID for every generated token

Notes:
  CF_AUDIT_TOKEN and CF_AI_GATEWAY_TOKEN are preserved from the environment or existing output file.
  Tokens with names matching PRESERVE_TOKEN_NAME_REGEX are never revoked by cleanup.
  CF_AI_GATEWAY_SLUG defaults to zeaz when unset.

  --help, -h             Show help
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) shift; NAME_FILTER="${1:-}"; shift || true ;;
    --unused-days) shift; UNUSED_DAYS="${1:-0}"; shift || true ;;
    --keep-most) shift; KEEP_MOST="${1:-1}"; shift || true ;;
    --backup) DO_BACKUP=true; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    --yes) ASSUME_YES=true; shift ;;
    --regenerate) REGENERATE=true; shift ;;
    --types) shift; TYPES_CSV="${1:-}"; shift || true ;;
    --write) shift; OUT_FILE="${1:-$DEFAULT_OUT}"; shift || true ;;
    --perm-id) shift; PERM_ID_OVERRIDE="${1:-}"; shift || true ;;
    --help|-h) usage; exit 0 ;;
    *) echo "WARN: unknown option: $1" >&2; shift ;;
  esac
done

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
warn(){ log "WARN: $*" >&2; }
die(){ log "ERROR: $*" >&2; exit 1; }
has(){ command -v "$1" >/dev/null 2>&1; }

has curl || die "curl is required"
has jq || die "jq is required"
[[ "$UNUSED_DAYS" =~ ^[0-9]+$ ]] || die "--unused-days must be a non-negative integer"
[[ "$KEEP_MOST" =~ ^[0-9]+$ ]] || die "--keep-most must be a non-negative integer"
[[ "$TOKEN_QUOTA" =~ ^[0-9]+$ ]] || die "TOKEN_QUOTA must be a non-negative integer"

: "${CF_EMAIL:?CF_EMAIL must be exported}"
: "${CF_GLOBAL_API_KEY:?CF_GLOBAL_API_KEY must be exported}"

cf_api(){
  local method="$1" endpoint="$2" payload="${3:-}"
  local args=(-sS -X "$method" "${API_BASE}${endpoint}"
    -H "X-Auth-Email: ${CF_EMAIL}"
    -H "X-Auth-Key: ${CF_GLOBAL_API_KEY}"
    -H "Content-Type: application/json")
  [[ -n "$payload" ]] && args+=(--data "$payload")
  curl "${args[@]}"
}

fetch_token_list(){
  local json ok
  json="$(cf_api GET /user/tokens)" || die "curl failed while fetching token list"
  [[ -n "$json" ]] || die "empty response from Cloudflare API"
  ok="$(printf '%s' "$json" | jq -r '.success // false')" || die "invalid JSON from Cloudflare API"
  [[ "$ok" == "true" ]] || die "Cloudflare API error: $(printf '%s' "$json" | jq -c '.errors // []')"
  printf '%s' "$json"
}

backup_json(){
  local json="$1" label="${2:-tokens}" ts file
  mkdir -p "$BACKUP_DIR"
  ts="$(date -u +%Y%m%dT%H%M%SZ)"
  file="$BACKUP_DIR/${label}.${ts}.json"
  printf '%s\n' "$json" > "$file"
  chmod 600 "$file"
  log "backup saved: $file"
}

audit(){
  local name="$1" id="$2" action="$3"; shift 3
  touch "$AUDIT_LOG"
  chmod 600 "$AUDIT_LOG"
  printf '%s\tname:%s\tid:%s\taction:%s%s\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$name" "$id" "$action" "${*:+ $*}" >> "$AUDIT_LOG"
}

env_file_value(){
  local file="$1" key="$2"
  [[ -f "$file" ]] || return 0
  awk -F= -v k="$key" '$1 == k {v=$0; sub(/^[^=]*=/, "", v); gsub(/^"|"$/, "", v); print v}' "$file" | tail -n 1
}

epoch_of(){
  local ts="${1:-}"
  [[ -z "$ts" || "$ts" == "null" ]] && { echo 0; return; }
  date -u -d "$ts" +%s 2>/dev/null || echo 0
}

log "fetching token list"
TOKEN_LIST_JSON="$(fetch_token_list)"
$DO_BACKUP && backup_json "$TOKEN_LIST_JSON" tokens

mapfile -t ALL_TOKENS < <(
  printf '%s' "$TOKEN_LIST_JSON" | jq -r '(.result // [])[] | [(.id // ""), (.name // ""), (.created_at // ""), (.last_used_at // "")] | @tsv'
)

now_epoch="$(date -u +%s)"
cutoff_epoch=0
if [[ "$UNUSED_DAYS" -gt 0 ]]; then
  cutoff_epoch=$(( now_epoch - UNUSED_DAYS * 24 * 3600 ))
fi

declare -a CANDIDATES=()
declare -a TO_REVOKE=()

for line in "${ALL_TOKENS[@]}"; do
  IFS=$'\t' read -r id name created last_used <<< "$line"
  [[ -z "$id" ]] && continue
  [[ -n "$NAME_FILTER" && "$name" != "$NAME_FILTER" ]] && continue
  if [[ -n "$name" ]] && [[ "$name" =~ $PRESERVE_TOKEN_NAME_REGEX ]]; then
    log "preserving token from cleanup by name policy: $name"
    continue
  fi
  last_epoch=0
  [[ -n "$last_used" && "$last_used" != "null" ]] && last_epoch="$(epoch_of "$last_used")"
  [[ "$last_epoch" -eq 0 && -n "$created" && "$created" != "null" ]] && last_epoch="$(epoch_of "$created")"
  CANDIDATES+=("$id|$name|$last_epoch|$created|$last_used")
done

mapfile -t NAMES < <(printf '%s\n' "${CANDIDATES[@]}" | awk -F'|' '{print $2}' | sort -u)
for name in "${NAMES[@]}"; do
  mapfile -t sorted_ids < <(
    printf '%s\n' "${CANDIDATES[@]}" | awk -F'|' -v name="$name" '$2 == name { print $3 "\t" $1 }' | sort -k1,1rn | awk -F'\t' '{print $2}'
  )
  idx=0
  for rid in "${sorted_ids[@]}"; do
    [[ "$idx" -ge "$KEEP_MOST" ]] && TO_REVOKE+=("$rid")
    idx=$((idx + 1))
  done
done

if [[ "$cutoff_epoch" -gt 0 ]]; then
  for entry in "${CANDIDATES[@]}"; do
    IFS='|' read -r id name last_epoch created last_used <<< "$entry"
    [[ "$last_epoch" -gt 0 && "$last_epoch" -lt "$cutoff_epoch" ]] && TO_REVOKE+=("$id")
  done
fi

declare -A seen=()
declare -a FINAL_REVOKE=()
for id in "${TO_REVOKE[@]}"; do
  [[ -z "$id" ]] && continue
  if [[ -z "${seen[$id]:-}" ]]; then
    FINAL_REVOKE+=("$id")
    seen[$id]=1
  fi
done

token_field(){
  printf '%s' "$TOKEN_LIST_JSON" | jq -r --arg ID "$1" --arg F "$2" '(.result // [])[] | select(.id == $ID) | .[$F] // ""'
}

if $DRY_RUN; then
  log "DRY-RUN: ${#FINAL_REVOKE[@]} token(s) would be revoked"
  for id in "${FINAL_REVOKE[@]}"; do
    printf '  %-38s name=%-30s created=%s last_used=%s\n' "$id" "$(token_field "$id" name)" "$(token_field "$id" created_at)" "$(token_field "$id" last_used_at)"
  done
else
  if [[ "${#FINAL_REVOKE[@]}" -gt 0 ]]; then
    log "${#FINAL_REVOKE[@]} token(s) selected for revocation"
    for id in "${FINAL_REVOKE[@]}"; do
      printf '  %-38s name=%-30s created=%s last_used=%s\n' "$id" "$(token_field "$id" name)" "$(token_field "$id" created_at)" "$(token_field "$id" last_used_at)"
    done
    [[ "$ASSUME_YES" == "true" ]] || die "refusing live revocation without --yes"
    $DO_BACKUP && backup_json "$TOKEN_LIST_JSON" tokens.pre-revoke
    for id in "${FINAL_REVOKE[@]}"; do
      name="$(token_field "$id" name)"
      resp="$(cf_api DELETE "/user/tokens/${id}")"
      ok="$(printf '%s' "$resp" | jq -r '.success // false')"
      if [[ "$ok" == "true" ]]; then
        log "revoked $id ($name)"
        audit "$name" "$id" revoked
      else
        errs="$(printf '%s' "$resp" | jq -c '.errors // []')"
        warn "failed to revoke $id ($name): $errs"
        audit "$name" "$id" revoke_failed "errors:$errs"
      fi
    done
  else
    log "no tokens matched revocation criteria"
  fi
fi

$REGENERATE || { log "done"; exit 0; }
[[ -n "$TYPES_CSV" ]] || { warn "--regenerate set but --types missing; skipping"; exit 0; }
[[ "$ASSUME_YES" == "true" || "$DRY_RUN" == "true" ]] || die "refusing token regeneration without --yes"

if [[ "$TYPES_CSV" == "all" ]]; then
  TYPES_CSV="dns,zt,workers,waf,tunnel,r2"
fi

declare -A PERM_ID_MAP=(
  [dns]="4755a26eedb94da69e1066d98aa820be"
  [zt]="b33f02c6f7284e05a6f20741c0bb0567"
  [workers]="e086da7e2179491d91ee5f35b3ca210a"
  [waf]="fb6778dc191143babbfaa57993f1d275"
  [tunnel]="c07321b023e944ff818fec44d8203567"
  [r2]="bf7481a1826f439697cb59a20b22293e"
)

declare -A TOKEN_NAME_MAP=(
  [dns]="zeaz-dns-token"
  [zt]="zeaz-zt-token"
  [workers]="zeaz-workers-token"
  [waf]="zeaz-waf-token"
  [tunnel]="zeaz-tunnel-token"
  [r2]="zeaz-r2-token"
)

declare -A RESOURCE_MAP=(
  [dns]="com.cloudflare.api.account.zone.*"
  [zt]="com.cloudflare.api.account.*"
  [workers]="com.cloudflare.api.account.*"
  [waf]="com.cloudflare.api.account.*"
  [tunnel]="com.cloudflare.api.account.*"
  [r2]="com.cloudflare.api.account.*"
)

declare -A ENV_KEY_MAP=(
  [dns]="CF_DNS_TOKEN"
  [zt]="CF_ZT_TOKEN"
  [workers]="CF_WORKERS_TOKEN"
  [waf]="CF_WAF_TOKEN"
  [tunnel]="CF_TUNNEL_TOKEN"
  [r2]="CF_R2_TOKEN"
)

IFS=',' read -r -a TYPES_ARR <<< "$TYPES_CSV"
declare -A GENERATED=()

for t in "${TYPES_ARR[@]}"; do
  t="${t// /}"
  [[ -z "$t" ]] && continue

  if [[ "$t" == "audit" || "$t" == "ai-gateway" ]]; then
    warn "$t token is preserved only; automatic regeneration is skipped"
    warn "set CF_AUDIT_TOKEN or CF_AI_GATEWAY_TOKEN manually, or generate a dedicated token in Cloudflare Dashboard"
    continue
  fi

  [[ -n "${TOKEN_NAME_MAP[$t]:-}" ]] || { warn "unknown token type: $t"; continue; }
  perm="${PERM_ID_OVERRIDE:-${PERM_ID_MAP[$t]:-}}"
  [[ -n "$perm" ]] || { warn "missing permission-group ID for $t; pass --perm-id or update PERM_ID_MAP"; continue; }

  count_resp="$(cf_api GET /user/tokens)"
  count_ok="$(printf '%s' "$count_resp" | jq -r '.success // false')"
  [[ "$count_ok" == "true" ]] || die "failed checking token quota: $(printf '%s' "$count_resp" | jq -c '.errors // []')"
  current_count="$(printf '%s' "$count_resp" | jq '(.result // []) | length')"
  [[ "$current_count" -lt "$TOKEN_QUOTA" ]] || die "token quota reached ($current_count/$TOKEN_QUOTA)"

  payload="$(jq -n --arg name "${TOKEN_NAME_MAP[$t]}" --arg resource "${RESOURCE_MAP[$t]}" --arg perm "$perm" '{name:$name, policies:[{effect:"allow", resources:{($resource):"*"}, permission_groups:[{id:$perm}]}]}')"

  if $DRY_RUN; then
    log "DRY-RUN: would create ${TOKEN_NAME_MAP[$t]}"
    GENERATED[$t]=""
    continue
  fi

  resp="$(cf_api POST /user/tokens "$payload")"
  ok="$(printf '%s' "$resp" | jq -r '.success // false')"
  [[ "$ok" == "true" ]] || die "token creation failed for ${TOKEN_NAME_MAP[$t]}: $(printf '%s' "$resp" | jq -c '.errors // []')"
  value="$(printf '%s' "$resp" | jq -r '.result.value // empty')"
  [[ -n "$value" ]] || die "token creation succeeded but no value was returned for ${TOKEN_NAME_MAP[$t]}"
  GENERATED[$t]="$value"
  audit "${TOKEN_NAME_MAP[$t]}" "$(printf '%s' "$resp" | jq -r '.result.id // "unknown"')" created "type:$t"
  log "created ${TOKEN_NAME_MAP[$t]}"
done

[[ -n "$OUT_FILE" ]] || { log "no output file requested"; exit 0; }

tmp="$(mktemp "${OUT_FILE}.XXXXXX")"
chmod 600 "$tmp"

MANAGED_KEYS=(CF_DNS_TOKEN CF_ZT_TOKEN CF_WORKERS_TOKEN CF_WAF_TOKEN CF_TUNNEL_TOKEN CF_R2_TOKEN CF_AUDIT_TOKEN CF_AI_GATEWAY_TOKEN CF_AI_GATEWAY_SLUG)
if [[ -f "$OUT_FILE" ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    key="$(printf '%s' "$line" | sed -E 's/^([A-Za-z0-9_]+)=.*/\1/')"
    skip=false
    for k in "${MANAGED_KEYS[@]}"; do [[ "$key" == "$k" ]] && skip=true && break; done
    $skip || printf '%s\n' "$line" >> "$tmp"
  done < "$OUT_FILE"
fi

printf 'CF_ACCOUNT_ID="%s"\n' "${CF_ACCOUNT_ID:-$(env_file_value "$OUT_FILE" CF_ACCOUNT_ID)}" >> "$tmp"
printf 'CF_ZONE_ID="%s"\n' "${CF_ZONE_ID:-$(env_file_value "$OUT_FILE" CF_ZONE_ID)}" >> "$tmp"
printf 'CF_AI_GATEWAY_SLUG="%s"\n' "${CF_AI_GATEWAY_SLUG:-$(env_file_value "$OUT_FILE" CF_AI_GATEWAY_SLUG || true)}" | sed 's/=""$/="zeaz"/' >> "$tmp"
printf '\n' >> "$tmp"

for t in dns zt workers waf tunnel r2; do
  key="${ENV_KEY_MAP[$t]}"
  val="${GENERATED[$t]:-}"
  if [[ -n "$val" ]]; then
    printf '%s="%s"\n' "$key" "$val" >> "$tmp"
  else
    existing="${!key:-$(env_file_value "$OUT_FILE" "$key")}" 
    printf '%s="%s"\n' "$key" "$existing" >> "$tmp"
  fi
done

printf 'CF_AUDIT_TOKEN="%s"\n' "${CF_AUDIT_TOKEN:-$(env_file_value "$OUT_FILE" CF_AUDIT_TOKEN)}" >> "$tmp"
printf 'CF_AI_GATEWAY_TOKEN="%s"\n' "${CF_AI_GATEWAY_TOKEN:-$(env_file_value "$OUT_FILE" CF_AI_GATEWAY_TOKEN)}" >> "$tmp"

if $DRY_RUN; then
  log "DRY-RUN: preview of $OUT_FILE"
  cat "$tmp"
  rm -f "$tmp"
  exit 0
fi

mv "$tmp" "$OUT_FILE"
chmod 600 "$OUT_FILE"
log "wrote $OUT_FILE"
log "done"
