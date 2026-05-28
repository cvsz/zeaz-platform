#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/cloudflare/lib/env-scope.sh
source "$SCRIPT_DIR/lib/env-scope.sh"
cf_load_cloudflare_env_scope
cd "$PROJECT_ROOT"

API_BASE="${CLOUDFLARE_API_BASE:-https://api.cloudflare.com/client/v4}"
CACHE_DIR="${CACHE_DIR:-./.cache/cloudflare-permissions}"
REFRESH=false

log(){ cf_env_log "$*"; }
warn(){ cf_env_warn "$*"; }
die(){ cf_env_die "$*"; }

contains_arg(){
  local wanted="$1"; shift
  local arg
  for arg in "$@"; do [[ "$arg" == "$wanted" ]] && return 0; done
  return 1
}

for arg in "$@"; do
  [[ "$arg" == "--refresh-permissions" ]] && REFRESH=true
done

if ! contains_arg --regenerate "$@"; then
  exec bash scripts/cloudflare/run-token-rotation.sh "$@"
fi

command -v curl >/dev/null 2>&1 || die "curl is required"
command -v jq >/dev/null 2>&1 || die "jq is required"
cf_require_env CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_BOOTSTRAP_TOKEN || exit 1

mkdir -p "$CACHE_DIR"
cache="$CACHE_DIR/account-token-permission-groups.${CLOUDFLARE_ACCOUNT_ID}.json"
if [[ ! -f "$cache" || "$REFRESH" == "true" ]]; then
  tmp="$(mktemp "${cache}.XXXXXX")"
  http_code="$(curl -sS -o "$tmp" -w '%{http_code}' \
    -H "Authorization: Bearer ${CLOUDFLARE_BOOTSTRAP_TOKEN}" \
    -H "Content-Type: application/json" \
    "${API_BASE}/accounts/${CLOUDFLARE_ACCOUNT_ID}/tokens/permission_groups")"
  if [[ ! "$http_code" =~ ^2[0-9][0-9]$ ]]; then
    if jq -e . "$tmp" >/dev/null 2>&1; then
      err="$(jq -c '{errors:(.errors // []),messages:(.messages // [])}' "$tmp")"
    else
      err="$(cat "$tmp")"
    fi
    rm -f "$tmp"
    die "permission-group discovery failed: http=${http_code} ${err}"
  fi
  mv "$tmp" "$cache"
  chmod 600 "$cache"
  log "permission-group cache refreshed: $cache"
fi

pick_permission(){
  local kind="$1"
  jq -r --arg kind "$kind" '
    def txt: ([.name // "", .description // "", .scope // "", (.scopes // [] | tostring), (.resource_groups // [] | tostring)] | join(" "));
    def has($re): (txt | test($re));
    def score($k):
      if $k == "dns" then
        if has("(?i)^zone dns write$") then 0
        elif has("(?i)zone.*dns.*(write|edit)") then 1
        elif (has("(?i)dns.*(write|edit)|(write|edit).*dns") and (has("(?i)settings") | not) and (has("(?i)account dns") | not)) then 10
        else 999 end
      elif $k == "waf" then
        if has("(?i)^zone.*(waf|rulesets).*write$") then 0
        elif has("(?i)zone.*(waf|web application firewall|rulesets?|firewall rules?).*(write|edit)") then 1
        elif has("(?i)(waf|web application firewall|rulesets?|firewall rules?).*(write|edit)|(write|edit).*(waf|web application firewall|rulesets?|firewall rules?)") then 10
        else 999 end
      elif $k == "zt" then if has("(?i)(zero[ -]?trust|access).*(write|edit)|(write|edit).*(zero[ -]?trust|access)") then 0 else 999 end
      elif $k == "workers" then if has("(?i)(workers?|workers scripts?).*(write|edit)|(write|edit).*(workers?|workers scripts?)") then 0 else 999 end
      elif $k == "pages" then if has("(?i)pages.*(write|edit)|(write|edit).*pages") then 0 else 999 end
      elif $k == "tunnel" then if has("(?i)(cloudflare tunnel|cloudflared|tunnel).*(write|edit)|(write|edit).*(cloudflare tunnel|cloudflared|tunnel)") then 0 else 999 end
      elif $k == "r2" then if has("(?i)(r2|r2 storage|workers r2).*(write|edit)|(write|edit).*(r2|r2 storage|workers r2)") then 0 else 999 end
      elif $k == "d1" then if has("(?i)(d1|workers d1).*(write|edit)|(write|edit).*(d1|workers d1)") then 0 else 999 end
      else 999 end;
    (.result // [])
    | map(. + {__score: score($kind)})
    | map(select(.__score < 999))
    | sort_by(.__score, .name)
    | .[0].id // empty
  ' "$cache"
}

export_if_missing(){
  local key="$1" val="$2" label="$3"
  if [[ -z "${!key:-}" && -n "$val" ]]; then
    export "$key=$val"
    log "resolved $label permission-group override: $val"
  elif [[ -n "${!key:-}" ]]; then
    log "using existing $key override"
  else
    warn "could not resolve $label permission-group override"
  fi
}

export_if_missing CLOUDFLARE_DNS_PERMISSION_GROUP_ID "$(pick_permission dns)" dns
export_if_missing CLOUDFLARE_ZT_PERMISSION_GROUP_ID "$(pick_permission zt)" zt
export_if_missing CLOUDFLARE_WORKERS_PERMISSION_GROUP_ID "$(pick_permission workers)" workers
export_if_missing CLOUDFLARE_PAGES_PERMISSION_GROUP_ID "$(pick_permission pages)" pages
export_if_missing CLOUDFLARE_WAF_PERMISSION_GROUP_ID "$(pick_permission waf)" waf
export_if_missing CLOUDFLARE_TUNNEL_PERMISSION_GROUP_ID "$(pick_permission tunnel)" tunnel
export_if_missing CLOUDFLARE_R2_PERMISSION_GROUP_ID "$(pick_permission r2)" r2
export_if_missing CLOUDFLARE_D1_PERMISSION_GROUP_ID "$(pick_permission d1)" d1

exec bash scripts/cloudflare/run-token-rotation.sh "$@"
