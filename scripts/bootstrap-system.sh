#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

STRICT_TOOLS="${STRICT_TOOLS:-false}"
CODEX_CLOUD="${CODEX_CLOUD:-false}"
SKIP_CORE="${SKIP_CORE:-false}"
SKIP_TERRAFORM="${SKIP_TERRAFORM:-false}"
SKIP_TFLINT="${SKIP_TFLINT:-false}"
SKIP_CLOUDFLARED="${SKIP_CLOUDFLARED:-false}"
SKIP_GH="${SKIP_GH:-false}"
SKIP_PYTHON_DEPS="${SKIP_PYTHON_DEPS:-false}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
PYTHON_VENV_DIR="${PYTHON_VENV_DIR:-.venv}"
USE_SYSTEM_PIP="${USE_SYSTEM_PIP:-false}"
TFLINT_VERSION="${TFLINT_VERSION:-latest}"

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
info(){ log "INFO: $*"; }
warn(){ log "WARN: $*" >&2; }
die(){ log "ERROR: $*" >&2; exit 1; }
has(){ command -v "$1" >/dev/null 2>&1; }

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$ARCH" in
  x86_64|amd64) ARCH_CANON="amd64" ;;
  aarch64|arm64) ARCH_CANON="arm64" ;;
  armv7l) ARCH_CANON="armv7" ;;
  *) ARCH_CANON="$ARCH" ;;
esac

find_root(){
  local d="${PROJECT_ROOT:-${PWD}}"
  while [[ "$d" != "/" ]]; do
    if [[ -d "$d/.git" ]] || [[ -f "$d/.env.example" ]] || [[ -d "$d/terraform" ]] || [[ -f "$d/README.md" ]]; then
      printf '%s\n' "$d"
      return 0
    fi
    d="$(dirname "$d")"
  done
  printf '%s\n' "$PWD"
}

PROJECT_ROOT="$(find_root)"

SUDO=""
if [[ "${EUID:-$(id -u)}" -ne 0 ]] && has sudo; then
  SUDO="sudo"
fi

run_root(){
  if [[ -n "$SUDO" ]]; then sudo "$@"; else "$@"; fi
}

strict_skip(){
  local msg="$1"
  [[ "$STRICT_TOOLS" == "true" ]] && die "$msg"
  warn "$msg"
  return 0
}

pkg_manager(){
  if has apt-get; then echo apt; return; fi
  if has dnf; then echo dnf; return; fi
  if has yum; then echo yum; return; fi
  if has apk; then echo apk; return; fi
  if has brew; then echo brew; return; fi
  echo none
}

PKG_MANAGER="$(pkg_manager)"

install_packages(){
  [[ $# -gt 0 ]] || return 0
  case "$PKG_MANAGER" in
    apt)
      run_root apt-get update || strict_skip "apt-get update failed"
      run_root apt-get install -y "$@" || strict_skip "apt-get install failed: $*"
      ;;
    dnf) run_root dnf install -y "$@" || strict_skip "dnf install failed: $*" ;;
    yum) run_root yum install -y "$@" || strict_skip "yum install failed: $*" ;;
    apk) run_root apk add --no-cache "$@" || strict_skip "apk add failed: $*" ;;
    brew) brew install "$@" || strict_skip "brew install failed: $*" ;;
    *) strict_skip "no supported package manager found; skipped install: $*" ;;
  esac
}

install_core(){
  [[ "$SKIP_CORE" == "true" ]] && { warn "SKIP_CORE=true; skipped core install"; return 0; }
  info "installing core dependencies via $PKG_MANAGER"
  case "$PKG_MANAGER" in
    apt) install_packages curl wget unzip jq git make python3 python3-pip python3-venv ca-certificates gnupg lsb-release software-properties-common ripgrep ;;
    dnf|yum) install_packages curl wget unzip jq git make python3 python3-pip ca-certificates gnupg2 ripgrep ;;
    apk) install_packages curl wget unzip jq git make python3 py3-pip ca-certificates gnupg bash ripgrep ;;
    brew) install_packages curl wget jq git make python ca-certificates gnupg unzip ripgrep ;;
    *) strict_skip "core dependency install unavailable on this platform" ;;
  esac
}

install_terraform_apt(){
  has wget || install_packages wget
  has gpg || install_packages gnupg
  has lsb_release || install_packages lsb-release
  wget -O- https://apt.releases.hashicorp.com/gpg | run_root gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
  echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | run_root tee /etc/apt/sources.list.d/hashicorp.list >/dev/null
  run_root apt-get update
  run_root apt-get install -y terraform
}

install_terraform_brew(){
  brew tap hashicorp/tap || true
  brew install hashicorp/tap/terraform || brew install terraform
}

install_terraform(){
  [[ "$SKIP_TERRAFORM" == "true" ]] && { warn "SKIP_TERRAFORM=true; skipped Terraform install"; return 0; }
  has terraform && { info "terraform already installed: $(terraform version | head -n 1 || true)"; return 0; }
  info "installing Terraform for $OS/$ARCH_CANON"
  case "$PKG_MANAGER" in
    apt) install_terraform_apt || strict_skip "Terraform install failed" ;;
    brew) install_terraform_brew || strict_skip "Terraform install failed" ;;
    dnf|yum) install_packages yum-utils || true; run_root "$PKG_MANAGER" config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo || true; install_packages terraform ;;
    apk) install_packages terraform ;;
    *) strict_skip "Terraform install unavailable: no supported package manager" ;;
  esac
  if has terraform; then terraform version | head -n 1 || true; else strict_skip "terraform verification failed"; fi
}

install_tflint(){
  [[ "$SKIP_TFLINT" == "true" ]] && { warn "SKIP_TFLINT=true; skipped tflint install"; return 0; }
  has tflint && { info "tflint already installed: $(tflint --version | head -n 1 || true)"; return 0; }

  info "installing tflint for $OS/$ARCH_CANON"
  case "$PKG_MANAGER" in
    brew)
      brew install tflint || strict_skip "tflint install failed"
      return 0
      ;;
    apk)
      install_packages tflint || true
      has tflint && return 0
      ;;
  esac

  has curl || install_packages curl
  has unzip || install_packages unzip

  local os_name versioned_url tmp_dir zip_path
  case "$OS" in
    linux) os_name="linux" ;;
    darwin) os_name="darwin" ;;
    *) strict_skip "tflint auto-install unsupported for OS: $OS"; return 0 ;;
  esac

  case "$ARCH_CANON" in
    amd64|arm64) ;;
    *) strict_skip "tflint auto-install unsupported for architecture: $ARCH_CANON"; return 0 ;;
  esac

  if [[ "$TFLINT_VERSION" == "latest" ]]; then
    versioned_url="https://github.com/terraform-linters/tflint/releases/latest/download/tflint_${os_name}_${ARCH_CANON}.zip"
  else
    versioned_url="https://github.com/terraform-linters/tflint/releases/download/${TFLINT_VERSION}/tflint_${os_name}_${ARCH_CANON}.zip"
  fi

  tmp_dir="$(mktemp -d)"
  zip_path="$tmp_dir/tflint.zip"
  curl -fsSL "$versioned_url" -o "$zip_path" || { rm -rf "$tmp_dir"; strict_skip "tflint download failed"; return 0; }
  unzip -q "$zip_path" -d "$tmp_dir" || { rm -rf "$tmp_dir"; strict_skip "tflint unzip failed"; return 0; }
  run_root install -m 0755 "$tmp_dir/tflint" /usr/local/bin/tflint || { rm -rf "$tmp_dir"; strict_skip "tflint install failed"; return 0; }
  rm -rf "$tmp_dir"

  if has tflint; then
    tflint --version | head -n 1 || true
  else
    strict_skip "tflint verification failed"
  fi
}

venv_python(){ printf '%s/bin/python' "$PROJECT_ROOT/$PYTHON_VENV_DIR"; }
venv_pip(){ printf '%s/bin/pip' "$PROJECT_ROOT/$PYTHON_VENV_DIR"; }

install_python_deps(){
  [[ "$SKIP_PYTHON_DEPS" == "true" ]] && { warn "SKIP_PYTHON_DEPS=true; skipped Python deps"; return 0; }
  has "$PYTHON_BIN" || { warn "$PYTHON_BIN missing; attempting core install"; install_core; }
  has "$PYTHON_BIN" || return 0

  if [[ "$USE_SYSTEM_PIP" == "true" ]]; then
    info "installing Python test dependencies with system pip"
    "$PYTHON_BIN" -m pip install --user --upgrade pip || warn "pip upgrade failed"
    "$PYTHON_BIN" -m pip install --user pytest pytest-cov requests pyyaml || warn "Python dependency install failed"
    return 0
  fi

  info "installing Python test dependencies in virtualenv: $PROJECT_ROOT/$PYTHON_VENV_DIR"
  "$PYTHON_BIN" -m venv "$PROJECT_ROOT/$PYTHON_VENV_DIR" || { warn "venv creation failed"; return 0; }
  "$(venv_python)" -m pip install --upgrade pip || warn "venv pip upgrade failed"
  "$(venv_pip)" install pytest pytest-cov requests pyyaml || warn "venv Python dependency install failed"
}

install_cloudflared(){
  [[ "$SKIP_CLOUDFLARED" == "true" ]] && { warn "SKIP_CLOUDFLARED=true; skipped cloudflared install"; return 0; }
  has cloudflared && { info "cloudflared already installed: $(cloudflared --version 2>/dev/null | head -n 1 || true)"; return 0; }
  info "installing cloudflared for $OS/$ARCH_CANON"
  case "$PKG_MANAGER" in
    brew) brew install cloudflare/cloudflare/cloudflared || strict_skip "cloudflared install failed" ;;
    apt)
      has wget || install_packages wget
      local deb="/tmp/cloudflared-linux-${ARCH_CANON}.deb"
      wget -q -O "$deb" "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH_CANON}.deb" || { warn "cloudflared download failed"; return 0; }
      run_root dpkg -i "$deb" || warn "cloudflared install failed"
      ;;
    *) strict_skip "cloudflared auto-install unsupported for package manager: $PKG_MANAGER" ;;
  esac
}

install_gh(){
  [[ "$SKIP_GH" == "true" ]] && { warn "SKIP_GH=true; skipped GitHub CLI install"; return 0; }
  has gh && { info "gh already installed: $(gh --version | head -n 1 || true)"; return 0; }
  info "installing GitHub CLI via $PKG_MANAGER"
  case "$PKG_MANAGER" in
    brew) brew install gh || strict_skip "GitHub CLI install failed" ;;
    apt)
      has curl || install_packages curl
      curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | run_root dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg status=none || { warn "GitHub CLI key download failed"; return 0; }
      run_root chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | run_root tee /etc/apt/sources.list.d/github-cli.list >/dev/null
      run_root apt-get update
      run_root apt-get install -y gh
      ;;
    dnf|yum|apk) install_packages gh ;;
    *) strict_skip "GitHub CLI install unavailable: no supported package manager" ;;
  esac
}

print_versions(){
  echo
  echo "========================================="
  echo "Bootstrap Summary"
  echo "========================================="
  echo "PROJECT_ROOT: $PROJECT_ROOT"
  echo "OS: $OS"
  echo "ARCH: $ARCH_CANON"
  echo "PACKAGE_MANAGER: $PKG_MANAGER"
  echo "CODEX_CLOUD: $CODEX_CLOUD"
  echo "STRICT_TOOLS: $STRICT_TOOLS"

  if has terraform; then terraform version | head -n 1 || true; else warn "terraform not installed"; fi
  if has tflint; then tflint --version | head -n 1 || true; else warn "tflint not installed"; fi
  if has "$PYTHON_BIN"; then "$PYTHON_BIN" --version || true; else warn "$PYTHON_BIN not installed"; fi
  if [[ -x "$(venv_python)" ]]; then "$(venv_python)" --version || true; fi
  if [[ -x "$(venv_pip)" ]]; then "$(venv_pip)" --version || true; fi

  if [[ -x "$PROJECT_ROOT/$PYTHON_VENV_DIR/bin/pytest" ]]; then
    "$PROJECT_ROOT/$PYTHON_VENV_DIR/bin/pytest" --version || true
  else
    warn "pytest not installed in venv"
  fi

  if has cloudflared; then cloudflared --version || true; else warn "cloudflared not installed"; fi
  if has gh; then gh --version | head -n 1 || true; else warn "gh not installed"; fi
  echo
}

main(){
  info "bootstrap-system start"
  [[ "$CODEX_CLOUD" == "true" ]] && info "CODEX_CLOUD=true"
  install_core
  install_terraform
  install_tflint
  install_python_deps
  install_cloudflared
  install_gh
  print_versions
  info "bootstrap complete"
}

main "$@"
