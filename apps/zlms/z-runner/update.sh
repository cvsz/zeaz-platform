#!/usr/bin/env bash
set -Eeuo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"
load_env
require_cmd curl; require_cmd tar; require_cmd python3
install_dir="${RUNNER_INSTALL_DIR:-/opt/z-runner}"
arch="$(uname -m)"
case "$arch" in x86_64) runner_arch=x64 ;; aarch64|arm64) runner_arch=arm64 ;; *) fatal "unsupported architecture: $arch" ;; esac
version="${RUNNER_VERSION:-latest}"
if [[ "$version" == latest ]]; then
  version="$(curl -fsS https://api.github.com/repos/actions/runner/releases/latest | python3 -c 'import json,sys; print(json.load(sys.stdin)["tag_name"].lstrip("v"))')"
fi
[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || fatal "invalid runner version: $version"
runner_dir="$install_dir/actions-runner"
marker="$runner_dir/.zrunner-version"
if [[ -f "$marker" && "$(cat "$marker")" == "$version" ]]; then
  log info "actions runner already at $version"
  exit 0
fi
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
url="https://github.com/actions/runner/releases/download/v${version}/actions-runner-linux-${runner_arch}-${version}.tar.gz"
log info "downloading actions runner $version"
curl -fL --proto '=https' --tlsv1.2 -o "$tmp/runner.tgz" "$url"
install -d -m 0755 "$runner_dir"
tar -xzf "$tmp/runner.tgz" -C "$runner_dir"
printf '%s' "$version" > "$marker"
if [[ -x "$runner_dir/bin/installdependencies.sh" && "${SKIP_RUNNER_DEPENDENCIES:-false}" != true ]]; then
  "$runner_dir/bin/installdependencies.sh" || log warn "runner dependency installer returned non-zero"
fi
log info "actions runner updated to $version"
