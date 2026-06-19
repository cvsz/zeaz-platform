#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
load_env
require_cmd curl; require_cmd python3
install_dir="${RUNNER_INSTALL_DIR:-/opt/z-runner}"
runner_dir="$install_dir/actions-runner"
workdir="${RUNNER_WORKDIR:-/var/lib/z-runner/work}"
log_dir="${RUNNER_LOG_DIR:-/var/log/z-runner}"
install -d -m 0700 "$workdir" "$log_dir"

if [[ "${RUNNER_DISABLE_AUTO_UPDATE:-false}" != true ]]; then
  "$install_dir/update.sh"
elif [[ ! -x "$runner_dir/config.sh" ]]; then
  fatal "actions runner missing and auto-update disabled"
fi

cd "$runner_dir"
name="${RUNNER_NAME:-$(safe_runner_name)}"
labels="$(labels_csv)"
token="$(registration_token)"
url="$(runner_url)"
args=(--unattended --url "$url" --token "$token" --name "$name" --labels "$labels" --work "$workdir")
[[ "${RUNNER_EPHEMERAL:-true}" == true ]] && args+=(--ephemeral)
[[ -n "${RUNNER_GROUP:-}" ]] && args+=(--runnergroup "$RUNNER_GROUP")
if [[ "${RUNNER_REPLACE_EXISTING:-true}" == true ]]; then args+=(--replace); fi

cleanup() {
  set +e
  local remove
  remove="$(removal_token 2>/dev/null)"
  if [[ -n "$remove" && -x ./config.sh ]]; then
    ./config.sh remove --unattended --token "$remove" >/dev/null 2>&1
  fi
}
trap cleanup EXIT INT TERM

log info "configuring ephemeral runner $name for $url"
./config.sh "${args[@]}"
log info "starting runner $name"
./run.sh 2>&1 | tee -a "$log_dir/runner.log"
