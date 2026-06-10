#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
load_env
require_cmd kubectl
ns="${KUBERNETES_NAMESPACE:-z-runner}"
min="${MIN_RUNNERS:-1}"
max="${MAX_RUNNERS:-20}"
target="${ARC_SCALE_TARGET_NAME:-z-runner-scale-set}"
queued="${QUEUED_JOBS:-0}"
if [[ -n "${GITHUB_OWNER:-}" ]]; then
  # Best-effort queue signal from GitHub API; falls back to QUEUED_JOBS for locked-down installations.
  queued="$(github_api GET "$(api_path_prefix | sed 's#/actions/runners##')/actions/runs?status=queued&per_page=1" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("total_count", 0))' 2>/dev/null || printf '%s' "$queued")"
fi
desired=$(( queued / ${TARGET_QUEUED_JOBS_PER_RUNNER:-1} + min ))
(( desired < min )) && desired="$min"
(( desired > max )) && desired="$max"
kubectl -n "$ns" scale autoscalingrunnerset.actions.github.com/"$target" --replicas="$desired"
log info "scaled $target to $desired replicas from queued_jobs=$queued"
