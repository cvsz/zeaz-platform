#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
load_env
require_cmd ps; require_cmd awk; require_cmd date
interval="${WATCHDOG_INTERVAL_SECONDS:-30}"
metrics="${RUNNER_METRICS_FILE:-/var/lib/z-runner/metrics.prom}"
quarantine="${RUNNER_QUARANTINE_DIR:-/var/lib/z-runner/quarantine}"
log_dir="${RUNNER_LOG_DIR:-/var/log/z-runner}"
install -d -m 0700 "$quarantine" "$(dirname "$metrics")"
install -d -m 0750 "$log_dir"

emit_metric() {
  local name="$1" value="$2"
  printf '%s %s\n' "$name" "$value" >> "$metrics.tmp"
}

report_siem() {
  local event="$1"
  [[ -n "${SIEM_WEBHOOK_URL:-}" ]] || return 0
  curl -fsS --max-time 5 -H 'Content-Type: application/json' -d "$event" "$SIEM_WEBHOOK_URL" >/dev/null || true
}

quarantine_runner() {
  local reason="$1" stamp bundle
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  bundle="$quarantine/$stamp-$reason"
  install -d -m 0700 "$bundle"
  ps auxww > "$bundle/ps.txt" || true
  ss -tunap > "$bundle/sockets.txt" 2>/dev/null || true
  if command -v docker >/dev/null 2>&1; then
    docker ps --no-trunc > "$bundle/docker-ps.txt" 2>/dev/null || true
    docker stats --no-stream > "$bundle/docker-stats.txt" 2>/dev/null || true
  fi
  log warn "quarantined runner for $reason; evidence at $bundle"
  report_siem "{\"event\":\"zrunner_quarantine\",\"reason\":\"$reason\",\"bundle\":\"$bundle\"}"
  "$(dirname "${BASH_SOURCE[0]}")/rotate.sh" "$reason" || true
}

scan_once() {
  : > "$metrics.tmp"
  local listener_count cpu mem now suspicious
  now="$(date +%s)"
  listener_count="$( (pgrep -f 'Runner.Listener|run.sh' || true) | wc -l | tr -d ' ')"
  emit_metric zrunner_listener_processes "$listener_count"
  if [[ "$listener_count" -eq 0 ]]; then quarantine_runner no-runner-process; fi

  cpu="$(ps -eo pcpu=,comm= | awk '/Runner|Worker|docker|containerd/ {sum+=$1} END {print sum+0}')"
  mem="$(free | awk '/Mem:/ {printf "%.0f", ($3/$2)*100}')"
  emit_metric zrunner_cpu_percent "${cpu%.*}"
  emit_metric zrunner_memory_percent "$mem"
  if awk -v c="$cpu" -v max="${RUNNER_MAX_CPU_PERCENT:-900}" 'BEGIN{exit !(c>max)}'; then quarantine_runner cpu-abuse; fi
  if [[ "$mem" -gt "${RUNNER_MAX_MEMORY_PERCENT:-90}" ]]; then quarantine_runner memory-abuse; fi

  suspicious="$(ps auxww | { grep -Eiv 'grep -Ei' || true; } | { grep -Ei '(xmrig|stratum|monero|cryptonight|masscan|nmap -s)' || true; } | wc -l | tr -d ' ')"
  emit_metric zrunner_suspicious_processes "$suspicious"
  if [[ "$suspicious" -gt 0 ]]; then quarantine_runner suspicious-process; fi

  if command -v docker >/dev/null 2>&1; then
    local old_containers
    old_containers="$(docker ps --format '{{.ID}} {{.RunningFor}} {{.Labels}}' 2>/dev/null | awk -v max="${RUNNER_MAX_CONTAINER_SECONDS:-21600}" '/zrunner=true/ {print $1}' | wc -l | tr -d ' ')"
    emit_metric zrunner_managed_containers "$old_containers"
  fi
  mv "$metrics.tmp" "$metrics"
}

if [[ "${1:-}" == --once ]]; then
  scan_once
  exit 0
fi
while true; do
  scan_once || log error "watchdog scan failed"
  sleep "$interval"
done
