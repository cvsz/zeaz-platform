#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# ==============================================================================
# ZEAZ Platform — Master Omega AI Assets Installer
# Advanced Professional Configuration — Final Release Complete
#
# Purpose:
#   Scan /home/zeazdev for AI agents, skills, plugins, extensions, Gemini commands,
#   and MCP configs, then install them safely into /home/zeazdev/zeaz-platform.
#
# Safety:
#   - Dry-run by default.
#   - Requires --apply to copy files.
#   - Backs up existing destination folders before apply.
#   - Does not run plugin/extension code.
#   - Does not commit anything.
#   - Never stages git files.
#   - Skips secrets, keys, env files, node_modules, build caches, and huge dirs.
# ==============================================================================

SCRIPT_NAME="$(basename "$0")"

SOURCE_ROOT="/home/zeazdev"
DEST_REPO="/home/zeazdev/zeaz-platform"
APPLY=false
VERIFY_ONLY=false
MAX_DIR_MIB=80
NO_BACKUP=false
VERBOSE=false

TS="$(date +%Y%m%d-%H%M%S)"
REPORT_ROOT=""
BACKUP_ROOT=""

log()  { printf '[%s] %s\n' "$SCRIPT_NAME" "$*"; }
warn() { printf '[%s] WARN: %s\n' "$SCRIPT_NAME" "$*" >&2; }
err()  { printf '[%s] ERROR: %s\n' "$SCRIPT_NAME" "$*" >&2; }

usage() {
  cat <<'USAGE'
Usage:
  scripts/omega/install-ai-assets-master.sh [options]

Options:
  --apply                    Actually install assets. Default is dry-run.
  --verify                   Verify installed asset layout only.
  --source-root PATH          Source root to scan. Default: /home/zeazdev
  --dest-repo PATH            Destination repo. Default: /home/zeazdev/zeaz-platform
  --max-dir-mib N             Skip candidate dirs larger than N MiB. Default: 80
  --no-backup                 Do not backup destination folders before apply.
  --verbose                   Print more scan details.
  -h, --help                  Show help.

Examples:
  # Dry-run scan
  bash scripts/omega/install-ai-assets-master.sh

  # Apply install
  bash scripts/omega/install-ai-assets-master.sh --apply

  # Verify installed result
  bash scripts/omega/install-ai-assets-master.sh --verify
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply) APPLY=true ;;
    --verify) VERIFY_ONLY=true ;;
    --source-root) SOURCE_ROOT="${2:-}"; shift ;;
    --dest-repo) DEST_REPO="${2:-}"; shift ;;
    --max-dir-mib) MAX_DIR_MIB="${2:-80}"; shift ;;
    --no-backup) NO_BACKUP=true ;;
    --verbose) VERBOSE=true ;;
    -h|--help) usage; exit 0 ;;
    *) err "unknown option: $1"; usage; exit 2 ;;
  esac
  shift
done

if [[ ! -d "$SOURCE_ROOT" ]]; then
  err "source root not found: $SOURCE_ROOT"
  exit 1
fi

if [[ ! -d "$DEST_REPO" ]]; then
  err "destination repo not found: $DEST_REPO"
  exit 1
fi

DEST_REPO="$(cd "$DEST_REPO" && pwd)"
SOURCE_ROOT="$(cd "$SOURCE_ROOT" && pwd)"

REPORT_ROOT="$DEST_REPO/reports/omega/ai-assets-$TS"
BACKUP_ROOT="$SOURCE_ROOT/omega-ai-assets-backup-$TS"

DEST_AGENTS="$DEST_REPO/.agents/agents"
DEST_SKILLS="$DEST_REPO/.skills"
DEST_PLUGINS="$DEST_REPO/.plugins"
DEST_EXTENSIONS="$DEST_REPO/.extensions"
DEST_GEMINI_COMMANDS="$DEST_REPO/.gemini/commands"
DEST_MCP="$DEST_REPO/.gemini/mcp-configs"
DEST_OMEGA="$DEST_REPO/.omega/ai-assets"
DEST_DOCS="$DEST_REPO/docs/omega"

INVENTORY_JSONL="$REPORT_ROOT/inventory.jsonl"
INVENTORY_MD="$REPORT_ROOT/inventory.md"
INSTALL_LOG="$REPORT_ROOT/install.log"
VERIFY_MD="$REPORT_ROOT/verify.md"

mkdir -p "$REPORT_ROOT"

touch "$INVENTORY_JSONL" "$INSTALL_LOG"

run() {
  if [[ "$APPLY" == "true" ]]; then
    log "RUN: $*" | tee -a "$INSTALL_LOG"
    "$@"
  else
    log "DRY-RUN: $*" | tee -a "$INSTALL_LOG"
  fi
}

json_escape() {
  python3 -c 'import json,sys; print(json.dumps(sys.stdin.read())[1:-1])'
}

safe_name() {
  local raw="$1"
  raw="$(basename "$raw")"
  printf '%s' "$raw" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9._-]+/-/g; s/^-+//; s/-+$//; s/-+/-/g'
}

is_sensitive_path() {
  local p="$1"
  case "$p" in
    *"/.git/"*|*"/node_modules/"*|*"/.next/"*|*"/dist/"*|*"/build/"*|*"/coverage/"*) return 0 ;;
    *"/.venv/"*|*"/venv/"*|*"/__pycache__/"*|*"/.pytest_cache/"*|*"/.turbo/"*) return 0 ;;
    *"/.cache/"*|*"/.pnpm-store/"*|*"/.npm/"*|*"/.yarn/"*) return 0 ;;
    *"/.ssh/"*|*"/.gnupg/"*|*"/.kube/"*|*"/.terraform/"*|*"/.wrangler/"*) return 0 ;;
    *"/secrets/"*|*"/secret/"*|*"/credentials/"*|*"/tokens/"*|*"/token/"*) return 0 ;;
    *".env"|*".env."*|*"env.local"|*"settings.local.json") return 0 ;;
    *"creds.json"|*"credentials.json"|*"credential.json"|*"token.json") return 0 ;;
    *".pem"|*".key"|*".p12"|*".pfx"|*"id_rsa"|*"id_ed25519") return 0 ;;
    *".tfstate"|*".tfvars") return 0 ;;
  esac
  return 1
}

dir_size_mib() {
  local d="$1"
  du -sm "$d" 2>/dev/null | awk '{print $1}' || echo 999999
}

record_inventory() {
  local type="$1"
  local src="$2"
  local dest="$3"
  local marker="$4"
  local size_mib="$5"

  local esc_type esc_src esc_dest esc_marker
  esc_type="$(printf '%s' "$type" | json_escape)"
  esc_src="$(printf '%s' "$src" | json_escape)"
  esc_dest="$(printf '%s' "$dest" | json_escape)"
  esc_marker="$(printf '%s' "$marker" | json_escape)"

  printf '{"type":"%s","source":"%s","destination":"%s","marker":"%s","size_mib":%s}\n' \
    "$esc_type" "$esc_src" "$esc_dest" "$esc_marker" "$size_mib" >> "$INVENTORY_JSONL"
}

copy_asset_dir() {
  local type="$1"
  local src_dir="$2"
  local dest_parent="$3"
  local marker="$4"

  if is_sensitive_path "$src_dir/"; then
    warn "skip sensitive path: $src_dir" | tee -a "$INSTALL_LOG"
    return 0
  fi

  if [[ "$src_dir" == "$DEST_REPO"* ]]; then
    warn "skip destination repo source: $src_dir" | tee -a "$INSTALL_LOG"
    return 0
  fi

  local size_mib
  size_mib="$(dir_size_mib "$src_dir")"

  if [[ "$size_mib" =~ ^[0-9]+$ ]] && (( size_mib > MAX_DIR_MIB )); then
    warn "skip too large ${size_mib}MiB > ${MAX_DIR_MIB}MiB: $src_dir" | tee -a "$INSTALL_LOG"
    return 0
  fi

  local name dest_dir
  name="$(safe_name "$src_dir")"
  [[ -n "$name" ]] || name="$(safe_name "$(dirname "$src_dir")")"
  dest_dir="$dest_parent/$name"

  record_inventory "$type" "$src_dir" "$dest_dir" "$marker" "$size_mib"

  mkdir -p "$dest_parent"

  run rsync -a \
    --exclude '.git/' \
    --exclude 'node_modules/' \
    --exclude '.next/' \
    --exclude 'dist/' \
    --exclude 'build/' \
    --exclude 'coverage/' \
    --exclude '.venv/' \
    --exclude 'venv/' \
    --exclude '__pycache__/' \
    --exclude '.pytest_cache/' \
    --exclude '.turbo/' \
    --exclude '.cache/' \
    --exclude '.env' \
    --exclude '.env.*' \
    --exclude '*.pem' \
    --exclude '*.key' \
    --exclude '*.p12' \
    --exclude '*.pfx' \
    --exclude '*.tfstate' \
    --exclude '*.tfvars' \
    --exclude 'creds.json' \
    --exclude 'credentials.json' \
    --exclude 'secrets/' \
    --exclude 'secret/' \
    --exclude 'tokens/' \
    --exclude 'token/' \
    "$src_dir/" "$dest_dir/"
}

copy_asset_file() {
  local type="$1"
  local src_file="$2"
  local dest_parent="$3"
  local marker="$4"

  if is_sensitive_path "$src_file"; then
    warn "skip sensitive file: $src_file" | tee -a "$INSTALL_LOG"
    return 0
  fi

  if [[ "$src_file" == "$DEST_REPO"* ]]; then
    warn "skip destination repo source file: $src_file" | tee -a "$INSTALL_LOG"
    return 0
  fi

  local name dest_file
  name="$(basename "$src_file")"
  dest_file="$dest_parent/$name"

  record_inventory "$type" "$src_file" "$dest_file" "$marker" 0

  mkdir -p "$dest_parent"
  run cp -a "$src_file" "$dest_file"
}

backup_destinations() {
  if [[ "$NO_BACKUP" == "true" ]]; then
    warn "backup disabled by --no-backup"
    return 0
  fi

  log "backup destination folders to: $BACKUP_ROOT"
  mkdir -p "$BACKUP_ROOT"

  for d in \
    "$DEST_AGENTS" \
    "$DEST_SKILLS" \
    "$DEST_PLUGINS" \
    "$DEST_EXTENSIONS" \
    "$DEST_GEMINI_COMMANDS" \
    "$DEST_MCP" \
    "$DEST_OMEGA"
  do
    if [[ -e "$d" ]]; then
      local rel
      rel="${d#$DEST_REPO/}"
      mkdir -p "$BACKUP_ROOT/$(dirname "$rel")"
      run cp -a "$d" "$BACKUP_ROOT/$rel"
    fi
  done
}

write_markdown_inventory() {
  {
    echo "# ZEAZ Omega AI Assets Inventory"
    echo
    echo "- Generated: $TS"
    echo "- Source root: \`$SOURCE_ROOT\`"
    echo "- Destination repo: \`$DEST_REPO\`"
    echo "- Apply mode: \`$APPLY\`"
    echo "- Max dir MiB: \`$MAX_DIR_MIB\`"
    echo
    echo "## Installed / Candidate Assets"
    echo
    echo "| Type | Source | Destination | Marker | Size MiB |"
    echo "|---|---|---|---|---:|"
    python3 - "$INVENTORY_JSONL" <<'PY'
import json, sys
path = sys.argv[1]
try:
    rows = [json.loads(line) for line in open(path, encoding="utf-8") if line.strip()]
except FileNotFoundError:
    rows = []
for r in rows:
    def esc(x):
        return str(x).replace("|", "\\|")
    print(f"| {esc(r['type'])} | `{esc(r['source'])}` | `{esc(r['destination'])}` | `{esc(r['marker'])}` | {r['size_mib']} |")
PY
  } > "$INVENTORY_MD"

  mkdir -p "$DEST_DOCS"
  if [[ "$APPLY" == "true" ]]; then
    cp -a "$INVENTORY_MD" "$DEST_DOCS/ai-assets-inventory.md"
    cp -a "$INVENTORY_JSONL" "$DEST_DOCS/ai-assets-inventory.jsonl"
  fi
}

verify_install() {
  mkdir -p "$REPORT_ROOT"

  {
    echo "# ZEAZ Omega AI Assets Verification"
    echo
    echo "- Timestamp: $TS"
    echo "- Repo: \`$DEST_REPO\`"
    echo
    echo "## Counts"
    echo
    printf -- "- Agents: "
    find "$DEST_AGENTS" -mindepth 2 -maxdepth 3 -name agent.json 2>/dev/null | wc -l
    printf -- "- Skills: "
    find "$DEST_SKILLS" -mindepth 2 -maxdepth 3 -name SKILL.md 2>/dev/null | wc -l
    printf -- "- Plugins: "
    find "$DEST_PLUGINS" -mindepth 2 -maxdepth 4 \( -name plugin.json -o -name plugin.yaml -o -name plugin.yml -o -name plugin.toml \) 2>/dev/null | wc -l
    printf -- "- Extensions: "
    find "$DEST_EXTENSIONS" -mindepth 2 -maxdepth 4 \( -name extension.json -o -name extension.yaml -o -name extension.yml -o -name manifest.json \) 2>/dev/null | wc -l
    printf -- "- Gemini commands: "
    find "$DEST_GEMINI_COMMANDS" -type f 2>/dev/null | wc -l
    printf -- "- MCP configs: "
    find "$DEST_MCP" -type f 2>/dev/null | wc -l
    echo
    echo "## Installed Paths"
    echo
    for d in "$DEST_AGENTS" "$DEST_SKILLS" "$DEST_PLUGINS" "$DEST_EXTENSIONS" "$DEST_GEMINI_COMMANDS" "$DEST_MCP" "$DEST_OMEGA"; do
      echo
      echo "### $d"
      find "$d" -maxdepth 3 -type f 2>/dev/null | sort | sed 's/^/- `/' | sed 's/$/`/' || true
    done
  } > "$VERIFY_MD"

  cat "$VERIFY_MD"
}

scan_and_install() {
  log "source root: $SOURCE_ROOT"
  log "destination repo: $DEST_REPO"
  log "apply: $APPLY"
  log "report root: $REPORT_ROOT"

  if [[ "$APPLY" == "true" ]]; then
    backup_destinations
  fi

  mkdir -p \
    "$DEST_AGENTS" \
    "$DEST_SKILLS" \
    "$DEST_PLUGINS" \
    "$DEST_EXTENSIONS" \
    "$DEST_GEMINI_COMMANDS" \
    "$DEST_MCP" \
    "$DEST_OMEGA" \
    "$DEST_DOCS"

  log "scan agents"
  while IFS= read -r marker; do
    [[ -n "$marker" ]] || continue
    dir="$(dirname "$marker")"
    copy_asset_dir "agent" "$dir" "$DEST_AGENTS" "agent.json"
  done < <(
    find "$SOURCE_ROOT" \
      \( -path "$DEST_REPO" -o -path "$DEST_REPO/*" -o -path '*/.git/*' -o -path '*/node_modules/*' -o -path '*/.next/*' -o -path '*/dist/*' -o -path '*/build/*' -o -path '*/coverage/*' -o -path '*/.venv/*' -o -path '*/venv/*' \) -prune \
      -o -type f -name 'agent.json' -print 2>/dev/null
  )

  log "scan skills"
  while IFS= read -r marker; do
    [[ -n "$marker" ]] || continue
    dir="$(dirname "$marker")"
    copy_asset_dir "skill" "$dir" "$DEST_SKILLS" "SKILL.md"
  done < <(
    find "$SOURCE_ROOT" \
      \( -path "$DEST_REPO" -o -path "$DEST_REPO/*" -o -path '*/.git/*' -o -path '*/node_modules/*' -o -path '*/.next/*' -o -path '*/dist/*' -o -path '*/build/*' -o -path '*/coverage/*' -o -path '*/.venv/*' -o -path '*/venv/*' \) -prune \
      -o -type f -name 'SKILL.md' -print 2>/dev/null
  )

  log "scan plugins"
  while IFS= read -r marker; do
    [[ -n "$marker" ]] || continue
    dir="$(dirname "$marker")"
    copy_asset_dir "plugin" "$dir" "$DEST_PLUGINS" "$(basename "$marker")"
  done < <(
    find "$SOURCE_ROOT" \
      \( -path "$DEST_REPO" -o -path "$DEST_REPO/*" -o -path '*/.git/*' -o -path '*/node_modules/*' -o -path '*/.next/*' -o -path '*/dist/*' -o -path '*/build/*' -o -path '*/coverage/*' -o -path '*/.venv/*' -o -path '*/venv/*' \) -prune \
      -o -type f \( -name 'plugin.json' -o -name 'plugin.yaml' -o -name 'plugin.yml' -o -name 'plugin.toml' \) -print 2>/dev/null
  )

  log "scan extensions"
  while IFS= read -r marker; do
    [[ -n "$marker" ]] || continue
    dir="$(dirname "$marker")"
    case "$marker" in
      *"/extensions/"*|*"/extension/"*|*"/plugins/"*|*"/plugin/"*|*"/mcp/"*|*"/tools/"*|*"/tool/"*)
        copy_asset_dir "extension" "$dir" "$DEST_EXTENSIONS" "$(basename "$marker")"
        ;;
      *)
        [[ "$VERBOSE" == "true" ]] && warn "skip generic manifest outside extension/plugin path: $marker"
        ;;
    esac
  done < <(
    find "$SOURCE_ROOT" \
      \( -path "$DEST_REPO" -o -path "$DEST_REPO/*" -o -path '*/.git/*' -o -path '*/node_modules/*' -o -path '*/.next/*' -o -path '*/dist/*' -o -path '*/build/*' -o -path '*/coverage/*' -o -path '*/.venv/*' -o -path '*/venv/*' \) -prune \
      -o -type f \( -name 'extension.json' -o -name 'extension.yaml' -o -name 'extension.yml' -o -name 'manifest.json' -o -name 'manifest.yaml' -o -name 'manifest.yml' \) -print 2>/dev/null
  )

  log "scan Gemini commands"
  while IFS= read -r cmd; do
    [[ -n "$cmd" ]] || continue
    rel="${cmd#"$SOURCE_ROOT"/}"
    name="$(basename "$cmd")"
    dest="$DEST_GEMINI_COMMANDS/$name"
    record_inventory "gemini-command" "$cmd" "$dest" "$(basename "$cmd")" 0
    mkdir -p "$DEST_GEMINI_COMMANDS"
    run cp -a "$cmd" "$dest"
  done < <(
    find "$SOURCE_ROOT" \
      \( -path "$DEST_REPO" -o -path "$DEST_REPO/*" -o -path '*/.git/*' -o -path '*/node_modules/*' -o -path '*/.next/*' -o -path '*/dist/*' -o -path '*/build/*' -o -path '*/coverage/*' \) -prune \
      -o -type f -path '*/.gemini/commands/*' \( -name '*.toml' -o -name '*.md' -o -name '*.json' -o -name '*.yaml' -o -name '*.yml' \) -print 2>/dev/null
  )

  log "scan MCP configs"
  while IFS= read -r cfg; do
    [[ -n "$cfg" ]] || continue
    copy_asset_file "mcp-config" "$cfg" "$DEST_MCP" "$(basename "$cfg")"
  done < <(
    find "$SOURCE_ROOT" \
      \( -path "$DEST_REPO" -o -path "$DEST_REPO/*" -o -path '*/.git/*' -o -path '*/node_modules/*' -o -path '*/.next/*' -o -path '*/dist/*' -o -path '*/build/*' -o -path '*/coverage/*' \) -prune \
      -o -type f \( -name 'mcp.json' -o -name '.mcp.json' -o -name 'mcp-config.json' -o -path '*/.gemini/mcp-configs/*.json' \) -print 2>/dev/null
  )

  log "write omega manifest"
  if [[ "$APPLY" == "true" ]]; then
    cat > "$DEST_OMEGA/README.md" <<README
# ZEAZ Omega AI Assets

Generated by:

\`scripts/omega/install-ai-assets-master.sh --apply\`

Timestamp: $TS

Installed asset roots:

- \`.agents/agents/\`
- \`.skills/\`
- \`.plugins/\`
- \`.extensions/\`
- \`.gemini/commands/\`
- \`.gemini/mcp-configs/\`

Inventory:

- \`docs/omega/ai-assets-inventory.md\`
- \`docs/omega/ai-assets-inventory.jsonl\`

Safety:

- Secrets and key files are excluded.
- Plugin code is copied only; it is not executed by the installer.
- Use explicit review before enabling any plugin or extension.
README
  fi

  write_markdown_inventory
  verify_install

  log "inventory jsonl: $INVENTORY_JSONL"
  log "inventory md: $INVENTORY_MD"
  log "install log: $INSTALL_LOG"

  if [[ "$APPLY" == "true" ]]; then
    log "installed. backup root: $BACKUP_ROOT"
  else
    log "dry-run complete. rerun with --apply to install."
  fi
}

if [[ "$VERIFY_ONLY" == "true" ]]; then
  verify_install
  exit 0
fi

scan_and_install
