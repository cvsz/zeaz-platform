#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

log(){ printf '{"ts":"%s","level":"%s","msg":"%s"}\n' "$(date -Iseconds)" "$1" "$2"; }

declare -A minimum_lengths=(
  [CF_API_TOKEN]=30
  [CF_DNS_TOKEN]=30
  [CF_ZT_TOKEN]=30
  [CF_WORKERS_TOKEN]=30
  [CF_WAF_TOKEN]=30
  [CF_TUNNEL_TOKEN]=30
  [CF_R2_TOKEN]=30
)

for k in "${!minimum_lengths[@]}"; do
  v="${!k:-}"
  [[ -n "$v" ]] || { log ERROR "$k is unset"; exit 1; }
  [[ "${#v}" -ge "${minimum_lengths[$k]}" ]] || { log ERROR "$k is too short"; exit 1; }
  [[ "$v" != "$CF_API_TOKEN" || "$k" == "CF_API_TOKEN" ]] || { log ERROR "$k must be segmented and unique"; exit 1; }
done

log INFO "token segmentation checks passed"
