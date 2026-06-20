#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

REPO_ROOT="${REPO_ROOT:-${DEFAULT_REPO_ROOT}}"
PACK_ROOT="${PACK_ROOT:-${DEFAULT_REPO_ROOT}}"
PREFIX="${PREFIX:-/usr/local/bin}"
GLOBAL_INSTALL="${GLOBAL_INSTALL:-0}"
GLOBAL_BIN="${GLOBAL_BIN:-0}"
DRY_RUN=0
YES=0

if [[ -t 1 ]]; then
  bold="$(printf '\033[1m')"
  green="$(printf '\033[32m')"
  yellow="$(printf '\033[33m')"
  red="$(printf '\033[31m')"
  reset="$(printf '\033[0m')"
else
  bold=""
  green=""
  yellow=""
  red=""
  reset=""
fi

log() { printf '%s\n' "${bold}==>${reset} $*"; }
ok() { printf '%s\n' "${green}OK${reset} $*"; }
warn() { printf '%s\n' "${yellow}WARN${reset} $*" >&2; }
die() { printf '%s\n' "${red}ERR${reset} $*" >&2; exit 1; }

usage() {
  cat <<'USAGE'
Usage:
  scripts/omega/install-omega-addons.sh [options]

Install Omega Master Advanced Professional addon assets into a ZeaZ Platform
checkout. Defaults are repo-local and non-destructive.

Options:
  --repo PATH             Target repository root. Default: current repo root.
  --source PATH           Omega pack/source root. Default: current repo root.
  --prefix PATH           Global binary prefix. Default: /usr/local/bin.
  --global-install        Also install Gemini commands and Hermes skills to $HOME.
  --global-bin            Also install omegactl to --prefix, using sudo only when needed.
  --no-global-bin         Do not install omegactl globally. Default.
  --dry-run               Print actions without writing files.
  -y, --yes               Allow sudo for --global-bin when --prefix is not writable.
  -h, --help              Show this help.

Environment:
  REPO_ROOT               Same as --repo.
  PACK_ROOT               Same as --source.
  GLOBAL_INSTALL=1        Same as --global-install.
  GLOBAL_BIN=1            Same as --global-bin.
  PREFIX                  Same as --prefix.

Examples:
  scripts/omega/install-omega-addons.sh --dry-run
  scripts/omega/install-omega-addons.sh
  scripts/omega/install-omega-addons.sh --global-install
  scripts/omega/install-omega-addons.sh --global-bin --yes
USAGE
}

run() {
  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run]'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

require_dir() {
  local path="$1"
  [[ -d "$path" ]] || die "directory not found: $path"
}

maybe_mkdir() {
  local path="$1"
  run mkdir -p "$path"
}

copy_dir_contents() {
  local src="$1"
  local dst="$2"
  local label="$3"

  if [[ ! -d "$src" ]]; then
    warn "skip ${label}; source directory not found: ${src}"
    return 0
  fi

  maybe_mkdir "$dst"
  log "Copying ${label}"
  if command -v rsync >/dev/null 2>&1; then
    run rsync -a --delete-after --exclude '.git' "${src%/}/" "${dst%/}/"
  else
    run cp -a "${src%/}/." "$dst/"
  fi
}

install_file() {
  local src="$1"
  local dst="$2"
  local mode="${3:-0644}"
  local label="$4"

  if [[ ! -f "$src" ]]; then
    warn "skip ${label}; source file not found: ${src}"
    return 0
  fi

  maybe_mkdir "$(dirname "$dst")"
  log "Installing ${label}"
  run install -m "$mode" "$src" "$dst"
}

append_gemini_instructions() {
  local template="$PACK_ROOT/.omega/templates/GEMINI_OMEGA_APPEND.md"
  local gemini_file="$REPO_ROOT/GEMINI.md"
  local marker="OMEGA_MASTER_ADVANCED_PROFESSIONAL_START"

  if [[ ! -f "$template" ]]; then
    warn "skip GEMINI.md append; template not found: ${template}"
    return 0
  fi

  if [[ "$DRY_RUN" == "1" ]]; then
    if [[ ! -f "$gemini_file" ]]; then
      printf '[dry-run] install GEMINI template to %q\n' "$gemini_file"
    elif ! grep -q "$marker" "$gemini_file"; then
      printf '[dry-run] append Omega GEMINI instructions to %q\n' "$gemini_file"
    else
      printf '[dry-run] GEMINI.md already contains Omega marker\n'
    fi
    return 0
  fi

  if [[ ! -f "$gemini_file" ]]; then
    cp "$template" "$gemini_file"
    ok "Created GEMINI.md from Omega template"
  elif ! grep -q "$marker" "$gemini_file"; then
    printf '\n\n' >> "$gemini_file"
    cat "$template" >> "$gemini_file"
    ok "Appended Omega instructions to GEMINI.md"
  else
    ok "GEMINI.md already contains Omega instructions"
  fi
}

install_global_bin() {
  local src="$PACK_ROOT/scripts/omega/omegactl"
  local dst="$PREFIX/omegactl"

  if [[ ! -f "$src" ]]; then
    warn "skip global omegactl; source file not found: ${src}"
    return 0
  fi

  if [[ "$GLOBAL_BIN" != "1" ]]; then
    warn "skip global omegactl; pass --global-bin to install ${dst}"
    return 0
  fi

  if [[ -w "$PREFIX" || "$PREFIX" != "/usr/local/bin" ]]; then
    maybe_mkdir "$PREFIX"
    install_file "$src" "$dst" 0755 "global omegactl"
    ok "Global omegactl installed: ${dst}"
    return 0
  fi

  if [[ "$YES" != "1" ]]; then
    warn "skip global omegactl; ${PREFIX} is not writable. Re-run with --global-bin --yes to allow sudo."
    return 0
  fi

  log "Installing global omegactl with sudo"
  if [[ "$DRY_RUN" == "1" ]]; then
    printf '[dry-run] sudo mkdir -p %q\n' "$PREFIX"
    printf '[dry-run] sudo install -m 0755 %q %q\n' "$src" "$dst"
  else
    sudo mkdir -p "$PREFIX"
    sudo install -m 0755 "$src" "$dst"
  fi
  ok "Global omegactl installed: ${dst}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      shift
      REPO_ROOT="${1:?missing --repo value}"
      ;;
    --source)
      shift
      PACK_ROOT="${1:?missing --source value}"
      ;;
    --prefix)
      shift
      PREFIX="${1:?missing --prefix value}"
      ;;
    --global-install)
      GLOBAL_INSTALL=1
      ;;
    --global-bin)
      GLOBAL_BIN=1
      ;;
    --no-global-bin)
      GLOBAL_BIN=0
      ;;
    --dry-run)
      DRY_RUN=1
      ;;
    -y|--yes)
      YES=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "unknown argument: $1"
      ;;
  esac
  shift
done

REPO_ROOT="$(cd "$REPO_ROOT" && pwd)"
PACK_ROOT="$(cd "$PACK_ROOT" && pwd)"

require_dir "$REPO_ROOT"
require_dir "$PACK_ROOT"

log "Installing Omega Master Advanced Professional addons"
log "Repo: ${REPO_ROOT}"
log "Source: ${PACK_ROOT}"
log "Dry run: ${DRY_RUN}"

maybe_mkdir "$REPO_ROOT/.agents/agents"
maybe_mkdir "$REPO_ROOT/.skills"
maybe_mkdir "$REPO_ROOT/.gemini/commands"
maybe_mkdir "$REPO_ROOT/.omega/plugins"
maybe_mkdir "$REPO_ROOT/.omega/templates"
maybe_mkdir "$REPO_ROOT/docs/omega"
maybe_mkdir "$REPO_ROOT/scripts/omega"

copy_dir_contents "$PACK_ROOT/.agents/agents" "$REPO_ROOT/.agents/agents" "Omega agents"
copy_dir_contents "$PACK_ROOT/.skills" "$REPO_ROOT/.skills" "Omega skills"
copy_dir_contents "$PACK_ROOT/.gemini/commands" "$REPO_ROOT/.gemini/commands" "Gemini commands"
copy_dir_contents "$PACK_ROOT/.omega/plugins" "$REPO_ROOT/.omega/plugins" "Omega plugins"
copy_dir_contents "$PACK_ROOT/.omega/templates" "$REPO_ROOT/.omega/templates" "Omega templates"
copy_dir_contents "$PACK_ROOT/docs/omega" "$REPO_ROOT/docs/omega" "Omega docs"
install_file "$PACK_ROOT/scripts/omega/omegactl" "$REPO_ROOT/scripts/omega/omegactl" 0755 "repo-local omegactl"

append_gemini_instructions

if [[ "$GLOBAL_INSTALL" == "1" ]]; then
  copy_dir_contents "$PACK_ROOT/.gemini/commands" "$HOME/.gemini/commands" "global Gemini commands"
  copy_dir_contents "$PACK_ROOT/.skills" "$HOME/.hermes/skills" "global Hermes skills"
  ok "Global Gemini commands and Hermes skills installed"
else
  warn "skip global Gemini/Hermes install; pass --global-install to enable"
fi

install_global_bin

ok "Omega addon installation finished"

cat <<EOF

Next:

  cd "${REPO_ROOT}"
  scripts/omega/omegactl status
  scripts/omega/omegactl list
  scripts/omega/omegactl doctor

Gemini CLI commands, if installed in .gemini/commands:

  /omega:master
  /repo:deep-scan
  /repo:e2e-implement
  /security:harden

EOF
