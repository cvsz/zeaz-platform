#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

install_root="${RUNNER_INSTALL_DIR:-/opt/z-runner}"
config_root="${ZR_CONFIG_DIR:-/etc/z-runner}"
state_root="${ZR_STATE_DIR:-/var/lib/z-runner}"
log_root="${ZR_LOG_DIR:-/var/log/z-runner}"

resolve_repo_root() {
  if [[ -n "${BASH_SOURCE:-}" ]] && [[ -f "${BASH_SOURCE[0]}" ]]; then
    cd "$(dirname "${BASH_SOURCE[0]}")" && pwd
    return
  fi

  local temp_root
  temp_root="$(mktemp -d /tmp/z-runner-bootstrap.XXXXXX)"

  echo "[z-runner] detected streamed install mode"
  echo "[z-runner] downloading runtime bundle into ${temp_root}"

  curl -fsSL https://github.com/cvsz/zlms/archive/refs/heads/main.tar.gz \
    | tar -xz --strip-components=1 -C "${temp_root}"

  echo "${temp_root}/z-runner"
}

repo_root="$(resolve_repo_root)"

if [[ ! -d "${repo_root}" ]]; then
  echo "unable to resolve z-runner repository root" >&2
  exit 1
fi

if [[ "${EUID}" -ne 0 ]]; then
  echo "install.sh must run as root" >&2
  exit 1
fi

need() { command -v "$1" >/dev/null 2>&1 || missing+=("$1"); }
missing=()
for cmd in curl tar gzip openssl python3 id useradd install systemctl; do need "$cmd"; done
if ((${#missing[@]})); then
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    tar \
    gzip \
    openssl \
    python3 \
    jq \
    iproute2 \
    procps \
    coreutils
fi

if ! id runner >/dev/null 2>&1; then
  useradd --system --create-home --home-dir /var/lib/z-runner --shell /usr/sbin/nologin runner
fi

install -d -m 0755 \
  "$install_root" \
  "$install_root/systemd" \
  "$install_root/docker" \
  "$install_root/kubernetes" \
  "$install_root/security" \
  "$install_root/telemetry" \
  "$install_root/docs"

install -d -m 0700 -o runner -g runner \
  "$state_root" \
  "$state_root/work" \
  "$state_root/quarantine"

install -d -m 0750 -o runner -g runner "$log_root"
install -d -m 0750 "$config_root"

cp -a "$repo_root"/. "$install_root"/

chown -R root:root "$install_root"
chmod 0755 "$install_root"/*.sh "$install_root/common.sh"

if [[ ! -f "$config_root/runner.env" ]]; then
  install -m 0600 "$repo_root/config/runner.env" "$config_root/runner.env"
fi

if [[ ! -f "$config_root/labels.json" ]]; then
  install -m 0644 "$repo_root/config/labels.json" "$config_root/labels.json"
fi

install -m 0644 "$repo_root/systemd/zrunner.service" /etc/systemd/system/zrunner.service
install -m 0644 "$repo_root/systemd/zrunner-watchdog.service" /etc/systemd/system/zrunner-watchdog.service

systemctl daemon-reload
systemctl enable zrunner.service zrunner-watchdog.service

echo "z-runner installed successfully"
echo "install root: $install_root"
echo "config root: $config_root"
echo "state root: $state_root"
echo "configure: $config_root/runner.env"
echo "start services: systemctl start zrunner.service zrunner-watchdog.service"
