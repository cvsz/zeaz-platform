#!/usr/bin/env bash
# ============================================================
# gdrive-backup.sh — Full OS backup to Google Drive via rclone
# ============================================================
# Usage:
#   scripts/backup/gdrive-backup.sh [--dry-run] [--dest REMOTE_PATH]
#
# Prerequisites:
#   1. rclone configured with a remote named "gdrive"
#      (see: scripts/backup/GDRIVE_SETUP.md)
#   2. Run as zeazdev (no sudo needed for /home, needs sudo for /etc /root)
#
# Excludes (to minimize size & skip regeneratable files):
#   - .venv/ node_modules/ — reinstallable
#   - .git/objects/        — history (keeps working tree)
#   - /var/cache /var/log
#   - /var/lib/docker      — images are large and rebuildable
#   - /proc /sys /dev /run /tmp /mnt /media
#   - swap files
#   - rclone cache dir itself (avoid recursion)
# ============================================================
set -Eeuo pipefail
IFS=$'\n\t'

# ── Config ────────────────────────────────────────────────────
REMOTE="${RCLONE_REMOTE:-gdrive}"
DEST_BASE="${BACKUP_DEST:-zeaz-server-backup}"
DATE_TAG="$(date +%Y-%m-%d)"
DEST="${REMOTE}:${DEST_BASE}/${DATE_TAG}"
LOG_DIR="${HOME}/.local/share/zeaz-backup/logs"
LOG_FILE="${LOG_DIR}/backup-${DATE_TAG}.log"
DRY_RUN=false
BANDWIDTH_LIMIT="${BANDWIDTH_LIMIT:-0}"   # 0 = unlimited, e.g. "50M"

# ── Parse args ────────────────────────────────────────────────
while (($#)); do
  case "$1" in
    --dry-run)   DRY_RUN=true; shift ;;
    --dest)      DEST="${REMOTE}:$2"; shift 2 ;;
    --remote)    REMOTE="$2"; shift 2 ;;
    --bwlimit)   BANDWIDTH_LIMIT="$2"; shift 2 ;;
    --help|-h)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) echo "Unknown arg: $1"; exit 2 ;;
  esac
done

# ── Setup ─────────────────────────────────────────────────────
mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

log()  { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
die()  { log "ERROR: $*"; exit 1; }

log "======================================================"
log "zeaz-server OS Backup → ${DEST}"
log "Dry-run: ${DRY_RUN}"
log "======================================================"

# ── Preflight ─────────────────────────────────────────────────
command -v rclone >/dev/null || die "rclone not found"
rclone listremotes 2>/dev/null | grep -q "^${REMOTE}:" \
  || die "rclone remote '${REMOTE}' not configured. Run: rclone config"

# ── Build rclone flags ─────────────────────────────────────────
RCLONE_FLAGS=(
  sync
  --progress
  --stats 30s
  --log-level INFO
  --transfers 4
  --checkers 8
  --contimeout 60s
  --timeout 300s
  --retries 3
  --low-level-retries 10
  --drive-chunk-size 128M
)

[[ "$DRY_RUN" == true ]]           && RCLONE_FLAGS+=(--dry-run)
[[ "$BANDWIDTH_LIMIT" != "0" ]]    && RCLONE_FLAGS+=(--bwlimit "$BANDWIDTH_LIMIT")

# ── Excludes ──────────────────────────────────────────────────
EXCLUDES=(
  # Virtual/runtime filesystems
  --exclude "/proc/**"
  --exclude "/sys/**"
  --exclude "/dev/**"
  --exclude "/run/**"
  --exclude "/tmp/**"
  --exclude "/mnt/**"
  --exclude "/media/**"
  --exclude "/lost+found/**"

  # Package/dependency caches — reinstallable
  --exclude "**/.venv/**"
  --exclude "**/venv/**"
  --exclude "**/node_modules/**"
  --exclude "**/.pnpm-store/**"
  --exclude "**/pnpm-store/**"
  --exclude "**/__pycache__/**"
  --exclude "**/*.pyc"
  --exclude "**/.mypy_cache/**"
  --exclude "**/.pytest_cache/**"
  --exclude "**/.cache/**"

  # Git history objects (keeps working tree & index, skips blob history)
  --exclude "**/.git/objects/**"
  --exclude "**/.git/lfs/**"

  # System caches and logs
  --exclude "/var/cache/**"
  --exclude "/var/log/**"
  --exclude "/var/tmp/**"

  # Docker — images/layers are large and rebuildable
  --exclude "/var/lib/docker/**"

  # Swap
  --exclude "/swapfile"
  --exclude "/*.swap"

  # rclone own cache (avoid recursion)
  --exclude "${HOME}/.cache/rclone/**"
  --exclude "${HOME}/.config/rclone/cache/**"

  # Build artifacts
  --exclude "**/dist/**"
  --exclude "**/build/**"
  --exclude "**/.next/**"
  --exclude "**/.nuxt/**"

  # Large model files (optional — comment out if you want models)
  --exclude "**/*.gguf"
  --exclude "**/*.bin"
  --exclude "**/*.safetensors"
  --exclude "**/*.ot"
  --exclude "**/*.ggml"
)

# ── Backup sections ───────────────────────────────────────────
backup_section() {
  local src="$1"
  local label="$2"
  local dest_sub="${3:-${label}}"

  if [[ ! -e "$src" ]]; then
    log "SKIP: $src (not found)"
    return 0
  fi

  log "Backing up: $src → ${DEST}/${dest_sub}/"
  rclone "${RCLONE_FLAGS[@]}" "${EXCLUDES[@]}" \
    "$src" "${DEST}/${dest_sub}/" \
    || log "WARN: $src had some errors (non-fatal)"
}

# ── Run backup ────────────────────────────────────────────────
log "--- HOME ---"
backup_section /home/zeazdev home

log "--- /etc ---"
backup_section /etc etc

log "--- /root ---"
backup_section /root root 2>/dev/null || log "SKIP: /root (no permission)"

log "--- /opt ---"
backup_section /opt opt

log "--- /usr/local ---"
backup_section /usr/local usr_local

log "--- /srv ---"
backup_section /srv srv

log "--- System config snapshots ---"
# Capture package list and service state as small text files
TMP_SNAPSHOTS="$(mktemp -d)"
dpkg --get-selections > "${TMP_SNAPSHOTS}/dpkg-selections.txt" 2>/dev/null || true
systemctl list-units --all --no-pager > "${TMP_SNAPSHOTS}/systemd-units.txt" 2>/dev/null || true
ip addr show > "${TMP_SNAPSHOTS}/ip-addr.txt" 2>/dev/null || true
crontab -l > "${TMP_SNAPSHOTS}/crontab-zeazdev.txt" 2>/dev/null || true

rclone "${RCLONE_FLAGS[@]}" \
  "${TMP_SNAPSHOTS}" "${DEST}/system-snapshots/" \
  || log "WARN: snapshot upload had issues"
rm -rf "${TMP_SNAPSHOTS}"

# ── Summary ───────────────────────────────────────────────────
log "======================================================"
log "Backup complete → ${DEST}"
log "Log: ${LOG_FILE}"
if [[ "$DRY_RUN" == true ]]; then
  log "DRY-RUN: no files were actually uploaded"
fi
log "======================================================"
