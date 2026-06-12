#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
# ZEAZ Omega Installer — OpenWork AI OS Extension
# Usage: bash install.sh [--dry-run] [--minimal] [--help]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
OPENWORK_DIR="$REPO_ROOT/apps/openwork"
ZEAZ_DIR="$OPENWORK_DIR/zeaz"
LOG_FILE="${ZEAZ_DIR}/install.log"
DRY_RUN=false
MINIMAL=false

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

log()  { echo -e "${GREEN}[ZEAZ]${NC} $1"; echo "[$(date +%H:%M:%S)] $1" >> "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; echo "[WARN] $1" >> "$LOG_FILE"; }
err()  { echo -e "${RED}[ERROR]${NC} $1"; echo "[ERROR] $1" >> "$LOG_FILE"; }
info() { echo -e "${CYAN}[INFO]${NC} $1"; echo "[INFO] $1" >> "$LOG_FILE"; }

usage() {
  cat <<EOF
ZEAZ Omega Installer — OpenWork AI OS Extension

Usage: bash install.sh [options]

Options:
  --dry-run     Show what would be installed without making changes
  --minimal     Skip desktop app and project dependencies
  --help        Show this help message

Environment:
  PNPM_HOME     pnpm installation directory (default: detected)
  NODE_VERSION  Node.js version requirement (default: 20)
EOF
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --minimal) MINIMAL=true; shift ;;
    --help) usage ;;
    *) err "Unknown option: $1"; usage ;;
  esac
done

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     ZEAZ Omega — AI OS for OpenWork      ║"
echo "╚══════════════════════════════════════════╝"
echo ""

if [ "$DRY_RUN" = true ]; then
  log "DRY RUN — no changes will be made"
fi

# --- Prerequisites ---
log "Checking prerequisites..."

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    err "$1 is required but not installed"
    return 1
  fi
  info "  ✓ $1: $($1 --version 2>&1 | head -1)"
  return 0
}

check_cmd node
check_cmd pnpm
NODE_MAJOR=$(node -e "console.log(process.version.slice(1).split('.')[0])")
if [ "$NODE_MAJOR" -lt 20 ]; then
  warn "Node.js v20+ recommended (current: v$NODE_MAJOR)"
fi

# --- Directory Structure ---
log "Verifying directory structure..."
for dir in agents skills providers runtime memory workflows mcp installer; do
  target="$ZEAZ_DIR/$dir"
  if [ ! -d "$target" ]; then
    if [ "$DRY_RUN" = true ]; then
      info "  would create: $target"
    else
      mkdir -p "$target"
      info "  ✓ created: $dir/"
    fi
  else
    info "  ✓ exists: $dir/"
  fi
done

# --- Dependencies ---
log "Installing dependencies..."
if [ "$DRY_RUN" = false ]; then
  (cd "$ZEAZ_DIR" && pnpm install --frozen-lockfile 2>&1 >> "$LOG_FILE") && log "  ✓ dependencies installed" || warn "  ! pnpm install had issues"
fi

# --- Verify Structure ---
log "Verifying installation..."
required_files=(
  "$ZEAZ_DIR/package.json"
  "$ZEAZ_DIR/tsconfig.json"
  "$ZEAZ_DIR/index.ts"
  "$ZEAZ_DIR/agents/registry.ts"
  "$ZEAZ_DIR/agents/base.ts"
  "$ZEAZ_DIR/providers/router.ts"
  "$ZEAZ_DIR/mcp/server.ts"
  "$ZEAZ_DIR/memory/system.ts"
  "$ZEAZ_DIR/skills/registry.ts"
  "$ZEAZ_DIR/workflows/engine.ts"
  "$ZEAZ_DIR/runtime/orchestrator.ts"
)

all_ok=true
for f in "${required_files[@]}"; do
  if [ -f "$f" ]; then
    info "  ✓ ${f#$ZEAZ_DIR/}"
  else
    warn "  ✗ missing: ${f#$ZEAZ_DIR/}"
    all_ok=false
  fi
done

# --- Environment ---
log "Setting up environment..."
ENV_FILE="$ZEAZ_DIR/.env"
if [ ! -f "$ENV_FILE" ] && [ "$DRY_RUN" = false ]; then
  cat > "$ENV_FILE" << 'EOF'
# ZEAZ Omega Configuration
ZEAZ_LOG_LEVEL=info
ZEAZ_ENABLE_HEALTH_CHECKS=true
ZEAZ_AUTO_SYNC_MCP=true
EOF
  info "  ✓ created .env"
fi

echo ""
if [ "$all_ok" = true ]; then
  log "╔══════════════════════════════════════════╗"
  log "║  ZEAZ Omega installed successfully!     ║"
  log "╚══════════════════════════════════════════╝"
else
  warn "Installation completed with warnings — some files may be missing"
fi

echo ""
info "Next steps:"
info "  1. cd $ZEAZ_DIR"
info "  2. pnpm dev           # Start ZEAZ Omega"
info "  3. pnpm test          # Run test suite"
echo ""
