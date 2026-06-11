#!/usr/bin/env bash
set -Eeuo pipefail

# scan-runtime-governance.sh
# Read local runtime metadata safely without exposing secrets.

show_help() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  --help                  Show this help message"
  echo "  --strict                Fail on high risk issues"
  echo "  --json                  Output in JSON format"
  echo "  --markdown              Output in Markdown format"
  echo "  --runtime-config <path> Path to cloudflared config (default: /etc/cloudflared/config.yml)"
  echo "  --systemd-unit <path>   Path to systemd unit (default: /etc/systemd/system/cloudflared.service)"
  exit 0
}

STRICT=false
MODE="text"
RUNTIME_CONFIG="/etc/cloudflared/config.yml"
SYSTEMD_UNIT="/etc/systemd/system/cloudflared.service"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help ;;
    --strict) STRICT=true ;;
    --json) MODE="json" ;;
    --markdown) MODE="markdown" ;;
    --runtime-config) RUNTIME_CONFIG="$2"; shift ;;
    --systemd-unit) SYSTEMD_UNIT="$2"; shift ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

declare -a KNOWN_LIVE_HOSTNAMES=("office.zeaz.dev" "zveo.zeaz.dev" "cctv.zeaz.dev" "api.zveo.zeaz.dev" "app.zeaz.dev" "admin-wallet.zeaz.dev" "zcloud.zeaz.dev" "ztest.zeaz.dev")

config_exists=false
config_readable=false
host_count=0
service_count=0
has_catch_all=false
has_tunnel_id=false
has_token_auth=false
has_cred_auth=false
has_cred_keys=false
declare -a redacted_hostnames=()
declare -a service_schemes=()
missing_live_hostnames=()
risk="OK"
blocker_reason=""

if [[ -f "$RUNTIME_CONFIG" ]]; then
  config_exists=true
  if [[ -r "$RUNTIME_CONFIG" ]]; then
    config_readable=true
  fi
fi

if [[ "$config_readable" == "true" ]]; then
  while IFS= read -r line; do
    # check for tunnel id
    if echo "$line" | grep -qE "^tunnel:[[:space:]]+[a-f0-9-]{36}"; then
      has_tunnel_id=true
    fi
    # check for credentials-file
    if echo "$line" | grep -qE "^credentials-file:"; then
      has_cred_auth=true
    fi
    # check for secret-like keys
    if echo "$line" | grep -qE "(secret|token|password|key):"; then
      has_cred_keys=true
    fi
    # count hostnames
    if echo "$line" | grep -qE "^[[:space:]]+-[[:space:]]+hostname:"; then
      ((host_count++))
      hostname=$(echo "$line" | sed -E 's/.*hostname:[[:space:]]+(.*)/\1/' | tr -d '"'\'' ')
      redacted_hostnames+=("$hostname")
    fi
    # count services and schemas
    if echo "$line" | grep -qE "^[[:space:]]+service:"; then
      ((service_count++))
      service=$(echo "$line" | sed -E 's/.*service:[[:space:]]+(.*)/\1/' | tr -d '"'\'' ')
      if [[ "$service" == "http_status:404" ]]; then
        has_catch_all=true
        service_schemes+=("http_status")
      elif [[ "$service" == http* ]]; then
        scheme=$(echo "$service" | cut -d: -f1)
        service_schemes+=("$scheme")
      elif [[ "$service" == tcp* || "$service" == ssh* ]]; then
        scheme=$(echo "$service" | cut -d: -f1)
        service_schemes+=("$scheme")
      else
        service_schemes+=("unknown")
      fi
    fi
  done < "$RUNTIME_CONFIG"

  # check known live hostnames
  for known in "${KNOWN_LIVE_HOSTNAMES[@]}"; do
    found=false
    for actual in "${redacted_hostnames[@]}"; do
      if [[ "$known" == "$actual" ]]; then
        found=true
        break
      fi
    done
    if [[ "$found" == "false" ]]; then
      missing_live_hostnames+=("$known")
    fi
  done
fi

if [[ -f "$SYSTEMD_UNIT" && -r "$SYSTEMD_UNIT" ]]; then
  if grep -qE "\-\-token[[:space:]=]+[A-Za-z0-9_-]+" "$SYSTEMD_UNIT"; then
    has_token_auth=true
  fi
fi

repo_stale=false
# rough heuristic: compare host count with infra/cloudflare/config.yml if it exists
if [[ -f "$REPO_ROOT/infra/cloudflare/config.yml" ]]; then
  repo_host_count=$(grep -cE "^[[:space:]]+-[[:space:]]+hostname:" "$REPO_ROOT/infra/cloudflare/config.yml" || true)
  if [[ "$config_readable" == "true" && "$repo_host_count" != "$host_count" ]]; then
    repo_stale=true
    if [[ "$risk" == "OK" ]]; then risk="REVIEW"; fi
  fi
fi

if [[ "$has_cred_keys" == "true" ]]; then
  risk="BLOCKER"
  blocker_reason="Readable secret-bearing config risk"
elif [[ "$config_readable" == "true" && ${#missing_live_hostnames[@]} -gt 0 ]]; then
  risk="BLOCKER"
  blocker_reason="Missing known live hostnames from runtime config"
elif [[ "$config_readable" == "true" && "$has_catch_all" == "false" ]]; then
  risk="BLOCKER"
  blocker_reason="Missing catch-all 404 rule"
fi

if [[ "$MODE" == "json" ]]; then
  cat <<EOF
{
  "config_exists": $config_exists,
  "config_readable": $config_readable,
  "host_count": $host_count,
  "service_count": $service_count,
  "has_catch_all": $has_catch_all,
  "has_tunnel_id": $has_tunnel_id,
  "has_token_auth": $has_token_auth,
  "has_cred_auth": $has_cred_auth,
  "has_cred_keys": $has_cred_keys,
  "repo_stale": $repo_stale,
  "risk": "$risk",
  "blocker_reason": "$blocker_reason"
}
EOF
elif [[ "$MODE" == "markdown" ]]; then
  echo "## Runtime Governance Scan"
  echo ""
  echo "- Config exists: $config_exists"
  echo "- Config readable: $config_readable"
  echo "- Host count: $host_count"
  echo "- Service count: $service_count"
  echo "- Has catch-all: $has_catch_all"
  echo "- Has tunnel ID: $has_tunnel_id"
  echo "- Has token auth: $has_token_auth"
  echo "- Has credential file auth: $has_cred_auth"
  echo "- Repo tunnel config may be stale: $repo_stale"
  echo "- Overall Risk: **$risk**"
  if [[ -n "$blocker_reason" ]]; then
    echo "- Blocker reason: $blocker_reason"
  fi
  echo ""
  echo "### Redacted Hostnames"
  for h in "${redacted_hostnames[@]}"; do
    echo "- $h"
  done
else
  echo "Runtime config: $RUNTIME_CONFIG"
  echo "Config exists: $config_exists"
  echo "Config readable: $config_readable"
  echo "Host count: $host_count"
  echo "Service count: $service_count"
  echo "Has catch-all: $has_catch_all"
  echo "Has token auth: $has_token_auth"
  echo "Has cred auth: $has_cred_auth"
  echo "Risk: $risk"
  if [[ -n "$blocker_reason" ]]; then echo "Blocker: $blocker_reason"; fi
fi

if [[ "$STRICT" == "true" && "$risk" == "BLOCKER" ]]; then
  exit 1
fi
exit 0
