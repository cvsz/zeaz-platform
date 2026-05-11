#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

cleanup() {
  local ec=$?
  if [[ $ec -ne 0 ]]; then
    echo "[ERROR] bootstrap failed with exit code ${ec}"
  fi
}
trap cleanup EXIT

./scripts/ai/validate-agent-env.sh

mkdir -p tunnels/cloudflared monitoring/prometheus monitoring/loki monitoring/grafana/dashboards
target="tunnels/cloudflared/config.yml"
source_template="tunnels/cloudflared/config.yml.example"
if [[ ! -f "$target" ]]; then
  envsubst < "$source_template" > "$target"
  chmod 600 "$target"
fi

echo "Bootstrap complete"
