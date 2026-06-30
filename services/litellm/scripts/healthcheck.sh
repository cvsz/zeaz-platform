#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() {
  cat <<'EOF'
Usage: bash scripts/healthcheck.sh [base_url]

Performs readiness/liveness checks against a running LiteLLM instance.
EOF
}

if [[ "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

base_url="${1:-http://127.0.0.1:${LITELLM_PORT:-4000}}"

if curl -fsS "${base_url}/health/readiness" >/dev/null; then
  echo '{"ok":true,"endpoint":"health/readiness"}'
  exit 0
fi

if curl -fsS "${base_url}/health/liveliness" >/dev/null; then
  echo '{"ok":true,"endpoint":"health/liveliness"}'
  exit 0
fi

echo '{"ok":false,"error":"health_endpoint_unavailable"}'
exit 1
