#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

log() {
  printf '[+] %s\n' "$1"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    printf '[-] Required command missing: %s\n' "$1" >&2
    exit 1
  }
}

main() {
  require_cmd sudo
  require_cmd apt-get
  require_cmd wget
  require_cmd gpg
  require_cmd lsb_release
  require_cmd curl
  require_cmd python3

  log "Updating packages"
  sudo apt-get update

  log "Installing core dependencies"
  sudo apt-get install -y \
    curl \
    wget \
    unzip \
    jq \
    git \
    make \
    python3 \
    python3-pip \
    python3-venv \
    ca-certificates \
    gnupg \
    lsb-release

  log "Installing Terraform"
  wget -O- https://apt.releases.hashicorp.com/gpg \
    | gpg --dearmor \
    | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg >/dev/null

  echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" \
    | sudo tee /etc/apt/sources.list.d/hashicorp.list >/dev/null

  sudo apt-get update
  sudo apt-get install -y terraform

  log "Verifying Terraform"
  terraform version

  log "Installing pytest and Python test dependencies"
  python3 -m pip install --upgrade pip
  pip3 install \
    pytest \
    pytest-cov \
    requests \
    pyyaml

  log "Installing cloudflared"
  wget -q -O /tmp/cloudflared-linux-amd64.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
  sudo dpkg -i /tmp/cloudflared-linux-amd64.deb

  log "Installing GitHub CLI"
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg status=none

  sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null

  sudo apt-get update
  sudo apt-get install -y gh

  echo
  echo "========================================="
  echo "Installed Versions"
  echo "========================================="

  terraform version
  python3 --version
  pytest --version
  cloudflared --version
  gh --version

  echo
  log "Bootstrap complete"
}

main "$@"
