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
cp -f tunnels/cloudflared/config.yml.example tunnels/cloudflared/config.yml

echo "Bootstrap complete"
