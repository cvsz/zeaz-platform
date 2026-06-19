#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=../lib/gemini-sandbox.sh
source "${PROJECT_ROOT}/scripts/lib/gemini-sandbox.sh"
gemini_init_sandbox_paths "${PROJECT_ROOT}"

cleanup() {
  local ec=$?
  if [[ $ec -ne 0 ]]; then
    gemini_log ERROR "bootstrap failed with exit code ${ec}"
  else
    gemini_log INFO "bootstrap complete"
  fi
}
trap cleanup EXIT

gemini_start_file_log "${GEMINI_LOG_DIR}/bootstrap-agent.log"

bash "${PROJECT_ROOT}/scripts/ai/validate-agent-env.sh"

# Create preferred project-local runtime directories when writable. In a Gemini
# sandbox or other read-only checkout, create matching fallback paths under
# GEMINI_PACK_ROOT so the script can still render generated files safely.
for dir in \
  "tunnels/cloudflared" \
  "monitoring/prometheus" \
  "monitoring/loki" \
  "monitoring/grafana/dashboards"; do
  gemini_get_writable_dir "${PROJECT_ROOT}/${dir}" "${GEMINI_PACK_ROOT}/${dir}" >/dev/null
done

tunnel_dir="$(gemini_get_writable_dir "${PROJECT_ROOT}/tunnels/cloudflared" "${GEMINI_PACK_ROOT}/tunnels/cloudflared")"
target="${tunnel_dir}/config.yml"
source_template="${PROJECT_ROOT}/tunnels/cloudflared/config.yml.example"

if [[ ! -f "${source_template}" ]]; then
  gemini_log ERROR "missing template: ${source_template}"
  exit 1
fi

if [[ ! -f "${target}" ]]; then
  if command -v envsubst >/dev/null 2>&1; then
    envsubst < "${source_template}" > "${target}"
  else
    cp "${source_template}" "${target}"
    gemini_log WARN "envsubst missing; copied template without variable interpolation"
  fi
  chmod 600 "${target}"
  gemini_log INFO "rendered tunnel config: ${target}"
else
  gemini_log INFO "tunnel config already exists: ${target}"
fi
