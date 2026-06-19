#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
mask(){ local v="${1:-}"; if [[ -z "$v" ]]; then printf '<missing>'; elif [[ ${#v} -le 8 ]]; then printf '<set>'; else printf '%s...%s len=%s' "${v:0:4}" "${v: -4}" "${#v}"; fi; }

PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
BASE_URL="${SUPABASE_MCP_BASE_URL:-https://mcp.supabase.com/mcp}"
OUT_FILE="${SUPABASE_MCP_CONFIG_OUT:-.agent/supabase-mcp.json}"
TOKEN="${SUPABASE_ACCESS_TOKEN:-}"

ok=true

if [[ -z "$PROJECT_REF" ]]; then
  log "WARN: SUPABASE_PROJECT_REF missing"
  ok=false
else
  log "SUPABASE_PROJECT_REF=$(mask "$PROJECT_REF")"
fi

log "SUPABASE_MCP_BASE_URL=$BASE_URL"
log "SUPABASE_MCP_CONFIG_OUT=$OUT_FILE"

if [[ -z "$TOKEN" ]]; then
  log "WARN: SUPABASE_ACCESS_TOKEN missing; required only for live MCP client use"
else
  log "SUPABASE_ACCESS_TOKEN=$(mask "$TOKEN")"
fi

if [[ "$ok" == "true" ]]; then
  log "Supabase MCP environment check passed"
  exit 0
fi

log "Supabase MCP environment check incomplete"
exit 1
