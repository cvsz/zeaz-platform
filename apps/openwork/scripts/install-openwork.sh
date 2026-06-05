#!/usr/bin/env bash
# =============================================================================
# OpenWork one-shot installer
# -----------------------------------------------------------------------------
# Installs: opencode CLI, pnpm, uv, the opencode-chrome-devtools plugin,
# the OpenWork user-level harness (60+ agents, 75+ commands, 4 skill paths,
# 46 MCP servers), the OpenWork desktop app, and the local repo deps.
#
# Idempotent: safe to re-run. Skips steps that are already done.
# Cross-platform: Linux, macOS, WSL2. Use install-openwork.ps1 for native Windows.
#
# Usage:
#   ./install-openwork.sh                    # full install
#   ./install-openwork.sh --minimal          # CLI + harness only (no desktop app)
#   ./install-openwork.sh --verify           # check what's installed, no changes
#   ./install-openwork.sh --dry-run          # show what would be done
#   ./install-openwork.sh --uninstall        # remove what this script installed
#   ./install-openwork.sh --harness-source=DIR   # override agent/command source
#   ./install-openwork.sh --config-only      # only sync opencode.jsonc
#   OPENWORK_NONINTERACTIVE=1 ./install-openwork.sh   # skip confirmations
# =============================================================================
set -euo pipefail

# ---- paths -------------------------------------------------------------------
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." &>/dev/null && pwd)"

# XDG defaults (overridable via env)
: "${XDG_CONFIG_HOME:=$HOME/.config}"
: "${OPENCODE_CONFIG_DIR:=$XDG_CONFIG_HOME/opencode}"
: "${OPENCODE_BIN_DIR:=$HOME/.local/bin}"

OPENCODE_JSON="$OPENCODE_CONFIG_DIR/opencode.jsonc"
OPENCODE_AGENTS_DIR="$OPENCODE_CONFIG_DIR/agents"
OPENCODE_COMMANDS_DIR="$OPENCODE_CONFIG_DIR/commands"
HARNESS_STAMP="$OPENCODE_CONFIG_DIR/.openwork-harness-stamp"
STATE_LOG="$OPENCODE_CONFIG_DIR/.openwork-install.log"

# ---- defaults ----------------------------------------------------------------
MINIMAL=0
VERIFY=0
DRY_RUN=0
UNINSTALL=0
CONFIG_ONLY=0
HARNESS_SOURCE=""
SKIP_SYSTEM=0
SKIP_CLI=0
SKIP_PLUGIN=0
SKIP_HARNESS=0
SKIP_DESKTOP=0
SKIP_PROJECT=0
NONINTERACTIVE="${OPENWORK_NONINTERACTIVE:-0}"
OPENCODE_VERSION="${OPENCODE_VERSION:-1.16.1}"
TURBO_VERSION="${TURBO_VERSION:-2.9.16}"

# ---- colors ------------------------------------------------------------------
if [[ -t 1 ]] && command -v tput >/dev/null 2>&1 && [[ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]]; then
  C_RESET=$'\033[0m'
  C_BOLD=$'\033[1m'
  C_DIM=$'\033[2m'
  C_RED=$'\033[31m'
  C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'
  C_BLUE=$'\033[34m'
  C_MAGENTA=$'\033[35m'
  C_CYAN=$'\033[36m'
else
  C_RESET="" C_BOLD="" C_DIM="" C_RED="" C_GREEN="" C_YELLOW="" C_BLUE="" C_MAGENTA="" C_CYAN=""
fi

# ---- helpers -----------------------------------------------------------------
log()  { printf '%b\n' "$*" | tee -a "$STATE_LOG" ; }
info() { log "${C_CYAN}▸${C_RESET} $*"; }
ok()   { log "${C_GREEN}✓${C_RESET} $*"; }
warn() { log "${C_YELLOW}⚠${C_RESET} $*"; }
err()  { log "${C_RED}✗${C_RESET} $*" >&2; }
hdr()  { log ""; log "${C_BOLD}${C_MAGENTA}═══ $* ═══${C_RESET}"; }
step() { log "${C_BLUE}───${C_RESET} ${C_BOLD}$*${C_RESET}"; }
dim()  { log "${C_DIM}  $*${C_RESET}"; }
have() { command -v "$1" >/dev/null 2>&1; }
run()  { if [[ $DRY_RUN -eq 1 ]]; then dim "[dry-run] $*"; else "$@"; fi; }
ask()  {
  local prompt="$1" default="${2:-n}"
  if [[ $NONINTERACTIVE -eq 1 ]]; then REPLY="$default"; return; fi
  local yn
  if [[ "$default" == "y" ]]; then yn="Y/n"; else yn="y/N"; fi
  read -r -p "$(printf '%b' "${C_CYAN}?${C_RESET} $prompt [$yn] ")" REPLY
  REPLY="${REPLY:-$default}"
  [[ "$REPLY" =~ ^[Yy]$ ]]
}

usage() {
  cat <<EOF
${C_BOLD}OpenWork installer${C_RESET}

${C_BOLD}USAGE${C_RESET}
  $(basename "$0") [OPTIONS]

${C_BOLD}OPTIONS${C_RESET}
  --minimal              CLI + harness only (skip desktop app + project deps)
  --verify               Check what is installed; no changes
  --dry-run              Print actions without executing
  --uninstall            Remove user-level harness + symlinks
  --config-only          Only sync opencode.jsonc (skip everything else)
  --harness-source=DIR   Override source for agents/commands
                         (default: $OPENCODE_AGENTS_DIR, then ~/ecc/{agents,commands})
  --skip-system          Don't install system packages (apt/brew)
  --skip-cli             Don't install/upgrade opencode CLI
  --skip-plugin          Don't install opencode-chrome-devtools plugin
  --skip-harness         Don't install agents/commands/skill paths
  --skip-desktop         Don't install OpenWork desktop app
  --skip-project         Don't run pnpm install in the repo
  --noninteractive       Same as OPENWORK_NONINTERACTIVE=1
  --opencode-version=V   Pin opencode CLI version (default: $OPENCODE_VERSION)
  -h, --help             Show this help

${C_BOLD}ENV${C_RESET}
  OPENWORK_NONINTERACTIVE=1   Skip all confirmations
  XDG_CONFIG_HOME             Override config base (default: ~/.config)
  OPENCODE_VERSION            Pin CLI version

${C_BOLD}EXAMPLES${C_RESET}
  ${C_DIM}# full install with defaults${C_RESET}
  $(basename "$0")

  ${C_DIM}# quick check of current state${C_RESET}
  $(basename "$0") --verify

  ${C_DIM}# automated CI-style install, no prompts${C_RESET}
  OPENWORK_NONINTERACTIVE=1 $(basename "$0") --minimal

  ${C_DIM}# preview what would change${C_RESET}
  $(basename "$0") --dry-run

${C_BOLD}FILES${C_RESET}
  Config:    $OPENCODE_JSON
  Agents:    $OPENCODE_AGENTS_DIR/
  Commands:  $OPENCODE_COMMANDS_DIR/
  Log:       $STATE_LOG
EOF
}

# ---- arg parse ---------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --minimal)            MINIMAL=1 ;;
    --verify)             VERIFY=1 ;;
    --dry-run)            DRY_RUN=1 ;;
    --uninstall)          UNINSTALL=1 ;;
    --config-only)        CONFIG_ONLY=1; SKIP_SYSTEM=1; SKIP_CLI=1; SKIP_PLUGIN=1; SKIP_DESKTOP=1; SKIP_PROJECT=1 ;;
    --harness-source=*)   HARNESS_SOURCE="${1#*=}" ;;
    --skip-system)        SKIP_SYSTEM=1 ;;
    --skip-cli)           SKIP_CLI=1 ;;
    --skip-plugin)        SKIP_PLUGIN=1 ;;
    --skip-harness)       SKIP_HARNESS=1 ;;
    --skip-desktop)       SKIP_DESKTOP=1 ;;
    --skip-project)       SKIP_PROJECT=1 ;;
    --noninteractive)     NONINTERACTIVE=1 ;;
    --opencode-version=*) OPENCODE_VERSION="${1#*=}" ;;
    -h|--help)            usage; exit 0 ;;
    *) err "unknown flag: $1"; usage; exit 2 ;;
  esac
  shift
done

# ---- preflight ---------------------------------------------------------------
mkdir -p "$OPENCODE_CONFIG_DIR" "$OPENCODE_BIN_DIR"
: > "$STATE_LOG"

# ---- OS detection ------------------------------------------------------------
detect_os() {
  OS="unknown"; ARCH="$(uname -m 2>/dev/null || echo unknown)"
  case "$(uname -s 2>/dev/null || echo Windows)" in
    Linux)   OS="linux" ;;
    Darwin)  OS="macos" ;;
    MINGW*|MSYS*|CYGWIN*) OS="windows-bash" ;;
    *)       OS="unknown" ;;
  esac
  case "$ARCH" in
    x86_64|amd64) ARCH="x64" ;;
    aarch64|arm64) ARCH="arm64" ;;
  esac
}
detect_os
hdr "OpenWork installer"
log "  ${C_DIM}os=$OS  arch=$ARCH  dry=$DRY_RUN  verify=$VERIFY${C_RESET}"
if [[ $OS == "windows-bash" ]]; then
  warn "Bash-on-Windows detected (Git Bash / MSYS). For native Windows, run scripts/install-openwork.ps1."
fi
if [[ $OS == "unknown" ]]; then
  err "Unsupported OS. Use scripts/install-openwork.ps1 on native Windows."
  exit 1
fi

# ---- report helpers ----------------------------------------------------------
report_installed() {
  hdr "Current state"
  printf '  %-26s ' "opencode CLI"
  if have opencode; then
    v=$(opencode --version 2>/dev/null || echo "?")
    if [[ "$v" == "$OPENCODE_VERSION" ]]; then ok "v$v"; else warn "v$v (want v$OPENCODE_VERSION)"; fi
  else err "missing"; fi

  printf '  %-26s ' "node"
  if have node; then ok "$(node --version 2>/dev/null)"; else err "missing"; fi

  printf '  %-26s ' "pnpm"
  if have pnpm; then ok "v$(pnpm --version 2>/dev/null)"; else err "missing"; fi

  printf '  %-26s ' "uv / uvx"
  if have uvx; then ok "$(uvx --version 2>/dev/null)"; else warn "missing (needed for aws-documentation MCP)"; fi

  printf '  %-26s ' "opencode config"
  if [[ -f "$OPENCODE_JSON" ]]; then
    n=$(grep -cE '^\s*"[a-z-]+":\s*\{' "$OPENCODE_JSON" 2>/dev/null || echo 0)
    ok "$OPENCODE_JSON ($n MCPs/entries)"
  else err "missing"; fi

  printf '  %-26s ' "agent files"
  if [[ -d "$OPENCODE_AGENTS_DIR" ]]; then
    n=$(find "$OPENCODE_AGENTS_DIR" -name '*.md' -type f 2>/dev/null | wc -l)
    ok "$n .md files"
  else err "missing"; fi

  printf '  %-26s ' "command files"
  if [[ -d "$OPENCODE_COMMANDS_DIR" ]]; then
    n=$(find "$OPENCODE_COMMANDS_DIR" -name '*.md' -type f 2>/dev/null | wc -l)
    ok "$n .md files"
  else err "missing"; fi

  printf '  %-26s ' "opencode-chrome-devtools"
  if [[ -d "$REPO_ROOT/.opencode/node_modules/opencode-chrome-devtools" ]]; then
    v=$(grep version "$REPO_ROOT/.opencode/node_modules/opencode-chrome-devtools/package.json" 2>/dev/null | head -1 | sed 's/[^0-9.]//g')
    ok "v$v"
  elif have opencode-chrome-devtools; then
    ok "$(opencode-chrome-devtools --version 2>/dev/null || echo installed)"
  else warn "not installed"; fi

  printf '  %-26s ' "OpenWork desktop app"
  if command -v openwork >/dev/null 2>&1; then ok "in PATH"; elif [[ -d "/Applications/OpenWork.app" || -d "$HOME/Applications/OpenWork.app" ]]; then ok "installed"; else warn "not detected"; fi
}

# ---- system package manager --------------------------------------------------
install_system_deps() {
  if [[ $SKIP_SYSTEM -eq 1 || $VERIFY -eq 1 ]]; then return; fi
  step "system packages"
  case "$OS" in
    macos)
      if ! have brew; then
        info "installing Homebrew"
        run /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
      else
        ok "brew present"
      fi
      run brew install node@22 git curl jq 2>/dev/null || true
      if [[ -f /opt/homebrew/opt/node@22/bin/node ]]; then
        run brew link --overwrite --force node@22 2>/dev/null || true
      fi
      ;;
    linux)
      if have apt-get; then
        if ! ask "run apt-get update + install (sudo)?" y; then warn "skipped apt"; return; fi
        run sudo apt-get update -y
        run sudo apt-get install -y nodejs npm git curl jq python3 python3-pip
      elif have dnf; then
        if ! ask "run dnf install (sudo)?" y; then warn "skipped dnf"; return; fi
        run sudo dnf install -y nodejs npm git curl jq python3 python3-pip
      elif have pacman; then
        if ! ask "run pacman -S (sudo)?" y; then warn "skipped pacman"; return; fi
        run sudo pacman -S --noconfirm --needed nodejs npm git curl jq python python-pip
      else
        warn "no known package manager; you'll need node, npm, git, jq, python3 manually"
      fi
      ;;
  esac
}

# ---- node version check ------------------------------------------------------
ensure_node() {
  step "node check"
  if ! have node; then
    err "node is required. Install Node 22+ and re-run."
    if [[ $OS == "macos" && $SKIP_SYSTEM -eq 0 ]]; then
      info "tip: brew install node@22"
    fi
    exit 1
  fi
  v=$(node --version | sed 's/v\([0-9]*\)\..*/\1/')
  if [[ "$v" -lt 22 ]]; then
    warn "node $(node --version) detected. opencode wants node >= 22.22.2 / 24.15.0."
    if ! ask "continue anyway?" y; then exit 1; fi
  else ok "node $(node --version)"; fi
}

# ---- pnpm --------------------------------------------------------------------
ensure_pnpm() {
  step "pnpm"
  if have pnpm; then
    ok "pnpm v$(pnpm --version)"
    return
  fi
  if ! ask "install pnpm globally?" y; then warn "skipped pnpm"; return; fi
  case "$OS" in
    macos)
      run brew install pnpm 2>/dev/null || run npm install -g pnpm@latest
      ;;
    linux)
      run npm install -g pnpm@latest
      run sudo corepack enable pnpm 2>/dev/null || true
      ;;
  esac
  if have pnpm; then ok "pnpm v$(pnpm --version)"; else err "pnpm install failed"; fi
}

# ---- uv / uvx ---------------------------------------------------------------
ensure_uv() {
  step "uv / uvx"
  if have uvx; then ok "uvx present"; return; fi
  if ! ask "install uv (for uvx-based MCPs like aws-documentation)?" y; then warn "skipped uv"; return; fi
  case "$OS" in
    macos)  run brew install uv 2>/dev/null || run curl -LsSf https://astral.sh/uv/install.sh | sh ;;
    linux)  run curl -LsSf https://astral.sh/uv/install.sh | sh ;;
  esac
  export PATH="$HOME/.local/bin:$PATH"
  if have uvx; then ok "uvx v$(uvx --version)"; else warn "uvx not on PATH yet — restart shell or: export PATH=\"\$HOME/.local/bin:\$PATH\""; fi
}

# ---- opencode CLI ------------------------------------------------------------
install_opencode_cli() {
  if [[ $SKIP_CLI -eq 1 || $VERIFY -eq 1 ]]; then return; fi
  step "opencode CLI (target v$OPENCODE_VERSION)"
  if have opencode; then
    v=$(opencode --version 2>/dev/null || echo "0")
    if [[ "$v" == "$OPENCODE_VERSION" ]]; then
      ok "already at v$v"
      return
    fi
    info "upgrading v$v -> v$OPENCODE_VERSION"
  else
    info "installing opencode-ai@$OPENCODE_VERSION"
  fi
  if ! ask "install/upgrade opencode CLI globally?" y; then warn "skipped CLI install"; return; fi
  case "$OS" in
    macos|linux)
      run npm install -g "opencode-ai@$OPENCODE_VERSION"
      # opencode's installer may drop a shim into nvm's path. The user's PATH may have
      # another symlink in front (e.g. ~/.local/npm/bin). Detect and repoint.
      local target
      target=$(npm root -g)/opencode-ai/bin/opencode.exe
      if [[ ! -e "$target" && -e "$(npm root -g)/opencode-ai/bin/opencode" ]]; then
        target="$(npm root -g)/opencode-ai/bin/opencode"
      fi
      for shim in "$HOME/.local/npm/bin/opencode" "$HOME/.local/bin/opencode"; do
        if [[ -L "$shim" ]] && [[ -e "$target" ]]; then
          run ln -sfn "$target" "$shim"
          dim "repointed $shim -> $target"
        fi
      done
      ;;
  esac
  if have opencode; then ok "opencode v$(opencode --version)"; else err "opencode not on PATH after install"; fi
}

# ---- MCP/agent/command JSON config ------------------------------------------
write_opencode_jsonc() {
  if [[ $VERIFY -eq 1 ]]; then return; fi
  step "opencode.jsonc (user-level config with skills + MCPs)"
  mkdir -p "$OPENCODE_CONFIG_DIR"
  local tmp="$OPENCODE_JSON.tmp"
  cat > "$tmp" <<'JSONC'
{
  "$schema": "https://opencode.ai/config.json",
  "skills": {
    "paths": [
      "../../ecc/skills"
    ,
      "/home/zeazdev/ecc/skills",
      "/home/zeazdev/.agents/skills",
      "/home/zeazdev/.claude/skills"]
  },
  "mcp": {
    "jira": {
      "type": "local",
      "command": ["uvx", "mcp-atlassian==0.21.0"],
      "environment": {
        "JIRA_URL": "${JIRA_URL}",
        "JIRA_EMAIL": "${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
      },
      "enabled": true
    },
    "github": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
      "environment": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      },
      "enabled": true
    },
    "firecrawl": {
      "type": "local",
      "command": ["npx", "-y", "firecrawl-mcp"],
      "environment": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      },
      "enabled": true
    },
    "supabase": {
      "type": "local",
      "command": ["npx", "-y", "@supabase/mcp-server-supabase@latest"],
      "enabled": true
    },
    "memory": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-memory"],
      "enabled": true
    },
    "omega-memory": {
      "type": "local",
      "command": ["uvx", "omega-memory", "serve"],
      "enabled": true
    },
    "longhand": {
      "type": "local",
      "command": ["longhand", "mcp-server"],
      "enabled": true
    },
    "sequential-thinking": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-sequential-thinking"],
      "enabled": true
    },
    "vercel": {
      "type": "remote",
      "url": "https://mcp.vercel.com",
      "enabled": true
    },
    "railway": {
      "type": "local",
      "command": ["npx", "-y", "@railway/mcp-server"],
      "enabled": true
    },
    "cloudflare-docs": {
      "type": "remote",
      "url": "https://docs.mcp.cloudflare.com/mcp",
      "enabled": true
    },
    "cloudflare-workers-builds": {
      "type": "remote",
      "url": "https://builds.mcp.cloudflare.com/mcp",
      "enabled": true
    },
    "cloudflare-workers-bindings": {
      "type": "remote",
      "url": "https://bindings.mcp.cloudflare.com/mcp",
      "enabled": true
    },
    "cloudflare-observability": {
      "type": "remote",
      "url": "https://observability.mcp.cloudflare.com/mcp",
      "enabled": true
    },
    "clickhouse": {
      "type": "remote",
      "url": "https://mcp.clickhouse.cloud/mcp",
      "enabled": true
    },
    "exa-web-search": {
      "type": "local",
      "command": ["npx", "-y", "exa-mcp-server"],
      "environment": {
        "EXA_API_KEY": "${EXA_API_KEY}"
      },
      "enabled": true
    },
    "context7": {
      "type": "local",
      "command": ["npx", "-y", "@upstash/context7-mcp@latest"],
      "enabled": true
    },
    "magic": {
      "type": "local",
      "command": ["npx", "-y", "@magicuidesign/mcp@latest"],
      "enabled": true
    },
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem"],
      "enabled": true
    },
    "playwright": {
      "type": "local",
      "command": ["npx", "-y", "@playwright/mcp", "--browser", "chrome"],
      "enabled": true
    },
    "fal-ai": {
      "type": "local",
      "command": ["npx", "-y", "fal-ai-mcp-server"],
      "environment": {
        "FAL_KEY": "${FAL_KEY}"
      },
      "enabled": true
    },
    "browserbase": {
      "type": "local",
      "command": ["npx", "-y", "@browserbasehq/mcp-server-browserbase"],
      "environment": {
        "BROWSERBASE_API_KEY": "${BROWSERBASE_API_KEY}"
      },
      "enabled": true
    },
    "browser-use": {
      "type": "remote",
      "url": "https://api.browser-use.com/mcp",
      "enabled": true
    },
    "devfleet": {
      "type": "remote",
      "url": "http://localhost:18801/mcp",
      "enabled": true
    },
    "token-optimizer": {
      "type": "local",
      "command": ["npx", "-y", "token-optimizer-mcp"],
      "enabled": true
    },
    "laraplugins": {
      "type": "remote",
      "url": "https://laraplugins.io/mcp/plugins",
      "enabled": true
    },
    "confluence": {
      "type": "local",
      "command": ["npx", "-y", "confluence-mcp-server"],
      "environment": {
        "CONFLUENCE_BASE_URL": "${CONFLUENCE_BASE_URL}",
        "CONFLUENCE_EMAIL": "${CONFLUENCE_EMAIL}",
        "CONFLUENCE_API_TOKEN": "${CONFLUENCE_API_TOKEN}"
      },
      "enabled": true
    },
    "evalview": {
      "type": "local",
      "command": ["python3", "-m", "evalview", "mcp", "serve"],
      "enabled": true
    },
    "squish": {
      "type": "local",
      "command": ["npx", "-y", "squish-memory"],
      "enabled": true
    },
    "git": {
      "type": "local",
      "command": ["npx", "-y", "mcp-server-git"],
      "enabled": true
    },
    "fetch": {
      "type": "local",
      "command": ["npx", "-y", "mcp-server-fetch"],
      "enabled": true
    },
    "time": {
      "type": "local",
      "command": ["npx", "-y", "time-mcp"],
      "enabled": true
    },
    "mcp-everything": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-everything"],
      "enabled": true
    },
    "docker": {
      "type": "local",
      "command": ["npx", "-y", "mcp-server-docker"],
      "enabled": true
    },
    "sqlite": {
      "type": "local",
      "command": ["npx", "-y", "mcp-sqlite"],
      "enabled": true
    },
    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "environment": {
        "POSTGRES_CONNECTION_STRING": "${POSTGRES_CONNECTION_STRING}"
      },
      "enabled": true
    },
    "puppeteer": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-puppeteer"],
      "enabled": true
    },
    "duckduckgo": {
      "type": "local",
      "command": ["npx", "-y", "duckduckgo-mcp-server"],
      "enabled": true
    },
    "weather": {
      "type": "local",
      "command": ["npx", "-y", "@dangahagan/weather-mcp"],
      "enabled": true
    },
    "omnisearch": {
      "type": "local",
      "command": ["npx", "-y", "mcp-omnisearch"],
      "enabled": true
    },
    "aws-knowledge": {
      "type": "remote",
      "url": "https://knowledge-mcp.global.api.aws",
      "enabled": true
    },
    "aws-documentation": {
      "type": "local",
      "command": ["uvx", "awslabs.aws-documentation-mcp-server@latest"],
      "environment": {
        "FASTMCP_LOG_LEVEL": "ERROR",
        "AWS_DOCUMENTATION_PARTITION": "aws"
      },
      "enabled": true
    },
    "cloudflare": {
      "type": "remote",
      "url": "https://mcp.cloudflare.com/mcp",
      "enabled": true
    },
    "pubmed": {
      "type": "local",
      "command": ["npx", "-y", "pubmed-mcp"],
      "enabled": true
    },
    "biomcp": {
      "type": "local",
      "command": ["npx", "-y", "biomcp"],
      "enabled": true
    },
    "wikipedia": {
      "type": "local",
      "command": ["npx", "-y", "@mikechao/wikipedia-mcp"],
      "enabled": true
    }
  }
}
JSONC
  if [[ -e "$OPENCODE_JSON" ]] && ! ask "$OPENCODE_JSON exists. Overwrite?" n; then
    warn "kept existing opencode.jsonc"
    rm -f "$tmp"
    return
  fi
  run mv "$tmp" "$OPENCODE_JSON"
  ok "wrote $OPENCODE_JSON"
}

# ---- harness (agents + commands) --------------------------------------------
resolve_harness_source() {
  step "harness source"
  if [[ -n "$HARNESS_SOURCE" ]]; then
    if [[ -d "$HARNESS_SOURCE/agents" && -d "$HARNESS_SOURCE/commands" ]]; then
      ok "$HARNESS_SOURCE (explicit)"
      HARNESS_SOURCE_DIR="$HARNESS_SOURCE"
    else
      err "--harness-source must contain agents/ and commands/ subdirs"
      exit 1
    fi
    return
  fi
  # try in order:
  local candidates=(
    "$REPO_ROOT/harness"
    "$REPO_ROOT/dist/harness"
    "$HOME/ecc"
    "$HOME/ecc/harness"
    "$OPENCODE_AGENTS_DIR/.."   # if user already has files, use parent
  )
  for c in "${candidates[@]}"; do
    if [[ -d "$c/agents" && -d "$c/commands" ]]; then
      HARNESS_SOURCE_DIR="$c"
      ok "$HARNESS_SOURCE_DIR (auto-detected)"
      return
    fi
  done
  # fallback: stage from already-installed files
  if [[ -d "$OPENCODE_AGENTS_DIR" && -d "$OPENCODE_COMMANDS_DIR" ]]; then
    HARNESS_SOURCE_DIR="$OPENCODE_CONFIG_DIR"
    warn "no source dir found; using already-installed files as source: $HARNESS_SOURCE_DIR"
    return
  fi
  err "no harness source found. Pass --harness-source=DIR"
  exit 1
}

install_harness() {
  if [[ $SKIP_HARNESS -eq 1 || $VERIFY -eq 1 ]]; then return; fi
  step "harness (agents + commands)"
  resolve_harness_source
  mkdir -p "$OPENCODE_AGENTS_DIR" "$OPENCODE_COMMANDS_DIR"
  local stamp_new="$OPENCODE_CONFIG_DIR/.harness-$(date +%s)"
  local a=0 c=0
  if [[ -d "$HARNESS_SOURCE_DIR/agents" ]]; then
    for f in "$HARNESS_SOURCE_DIR/agents"/*.md; do
      [[ -f "$f" ]] || continue
      run cp -n "$f" "$OPENCODE_AGENTS_DIR/"
      a=$((a+1))
    done
  fi
  if [[ -d "$HARNESS_SOURCE_DIR/commands" ]]; then
    for f in "$HARNESS_SOURCE_DIR/commands"/*.md; do
      [[ -f "$f" ]] || continue
      run cp -n "$f" "$OPENCODE_COMMANDS_DIR/"
      c=$((c+1))
    done
  fi
  date -Iseconds > "$HARNESS_STAMP"
  ok "agents: $a | commands: $c"
}

# ---- chrome devtools plugin (project-local) ---------------------------------
install_chrome_plugin() {
  if [[ $SKIP_PLUGIN -eq 1 || $VERIFY -eq 1 ]]; then return; fi
  step "opencode-chrome-devtools plugin (project-local)"
  if [[ ! -d "$REPO_ROOT/.opencode" ]]; then
    dim "no .opencode/ in repo; skipping project plugin"
    return
  fi
  if [[ -d "$REPO_ROOT/.opencode/node_modules/opencode-chrome-devtools" ]]; then
    ok "already installed"
    return
  fi
  if ! ask "install opencode-chrome-devtools plugin in $REPO_ROOT/.opencode?" y; then warn "skipped"; return; fi
  if have pnpm; then
    run pnpm --dir "$REPO_ROOT/.opencode" add -D opencode-chrome-devtools@latest
  else
    run npm install --prefix "$REPO_ROOT/.opencode" --save-dev opencode-chrome-devtools@latest
  fi
  ok "installed"
}

# ---- OpenWork desktop app ---------------------------------------------------
install_desktop_app() {
  if [[ $SKIP_DESKTOP -eq 1 || $MINIMAL -eq 1 || $VERIFY -eq 1 ]]; then return; fi
  step "OpenWork desktop app"
  if command -v openwork >/dev/null 2>&1; then ok "already in PATH"; return; fi
  if ! ask "install OpenWork desktop app?" y; then warn "skipped desktop app"; return; fi
  case "$OS" in
    macos)
      if have brew; then
        info "tip: brew install --cask openwork (if available)"
      fi
      info "otherwise: open $REPO_ROOT in Xcode-compatible tool, or grab the dmg from Releases"
      ;;
    linux)
      info "Linux builds: check Releases for AppImage / .deb / .rpm"
      info "or build locally: pnpm --filter @opencode-ai/desktop package"
      ;;
  esac
}

# ---- project deps ------------------------------------------------------------
install_project_deps() {
  if [[ $SKIP_PROJECT -eq 1 || $MINIMAL -eq 1 || $VERIFY -eq 1 ]]; then return; fi
  step "openwork repo deps"
  if [[ ! -f "$REPO_ROOT/package.json" ]]; then
    dim "no package.json in $REPO_ROOT; skipping"
    return
  fi
  if [[ -d "$REPO_ROOT/node_modules" ]]; then
    ok "node_modules already present"
    if ! ask "run pnpm install anyway to refresh?" n; then return; fi
  fi
  if ! have pnpm; then err "pnpm missing; cannot install project deps"; return; fi
  run pnpm install --dir "$REPO_ROOT"
  ok "pnpm install complete"
}

# ---- post-install warmup -----------------------------------------------------
warm_mcp_cache() {
  step "MCP cold-start warmup"
  if [[ $VERIFY -eq 1 || $DRY_RUN -eq 1 ]]; then return; fi
  if ! ask "pre-warm npx cache for the 14 npx-based MCPs? (3-5 min, prevents 30s+ first connect)" n; then
    dim "skipped warmup"
    return
  fi
  local pkgs=(
    "mcp-server-git" "mcp-server-fetch" "@modelcontextprotocol/server-everything"
    "mcp-server-docker" "mcp-sqlite" "@modelcontextprotocol/server-puppeteer"
    "duckduckgo-mcp-server" "@dangahagan/weather-mcp" "mcp-omnisearch"
    "pubmed-mcp" "biomcp" "@mikechao/wikipedia-mcp" "time-mcp"
  )
  local p
  for p in "${pkgs[@]}"; do
    printf '  %-55s ' "$p"
    if timeout 60 npx -yq "$p" --help </dev/null >/dev/null 2>&1 || \
       timeout 10 npx -yq "$p" </dev/null >/dev/null 2>&1; then
      ok "cached"
    else
      warn "skipped"
    fi
  done
}

# ---- uninstall ---------------------------------------------------------------
do_uninstall() {
  hdr "Uninstalling"
  if [[ -d "$OPENCODE_AGENTS_DIR" ]]; then
    run rm -rf "$OPENCODE_AGENTS_DIR"
    ok "removed $OPENCODE_AGENTS_DIR"
  fi
  if [[ -d "$OPENCODE_COMMANDS_DIR" ]]; then
    run rm -rf "$OPENCODE_COMMANDS_DIR"
    ok "removed $OPENCODE_COMMANDS_DIR"
  fi
  [[ -f "$HARNESS_STAMP" ]] && run rm -f "$HARNESS_STAMP" && ok "removed stamp"
  if [[ -f "$OPENCODE_JSON" ]] && ask "remove $OPENCODE_JSON? (you'll lose MCP + skill config)" n; then
    run rm -f "$OPENCODE_JSON"
    ok "removed"
  fi
  if have npm && ask "uninstall opencode-ai CLI globally?" n; then
    run npm uninstall -g opencode-ai
  fi
  if [[ -d "$REPO_ROOT/.opencode/node_modules/opencode-chrome-devtools" ]] && ask "uninstall opencode-chrome-devtools plugin?" n; then
    if have pnpm; then
      run pnpm --dir "$REPO_ROOT/.opencode" remove opencode-chrome-devtools
    else
      run npm uninstall --prefix "$REPO_ROOT/.opencode" opencode-chrome-devtools
    fi
  fi
  log ""
  log "${C_GREEN}done${C_RESET}"
}

# ---- main --------------------------------------------------------------------
main() {
  if [[ $UNINSTALL -eq 1 ]]; then
    do_uninstall
    exit 0
  fi

  if [[ $VERIFY -eq 1 ]]; then
    report_installed
    exit 0
  fi

  hdr "Preflight"
  ensure_node
  ensure_pnpm
  ensure_uv
  report_installed

  install_system_deps
  install_opencode_cli
  write_opencode_jsonc
  install_harness
  install_chrome_plugin
  install_project_deps
  install_desktop_app
  warm_mcp_cache

  hdr "Done"
  report_installed
  log ""
  log "${C_BOLD}Next steps:${C_RESET}"
  log "  ${C_DIM}cd $REPO_ROOT && pnpm dev:ui${C_RESET}     # start the Vite dev UI on :5173"
  log "  ${C_DIM}cd $REPO_ROOT && pnpm dev:server${C_RESET}  # start the OpenWork server"
  log "  ${C_DIM}cd $REPO_ROOT && pnpm dev${C_RESET}         # both"
  log "  ${C_DIM}openwork${C_RESET}                          # launch the desktop app (if installed)"
  log "  ${C_DIM}opencode${C_RESET}                          # launch the opencode CLI"
  log ""
  log "${C_DIM}log: $STATE_LOG${C_RESET}"
}

main "$@"
