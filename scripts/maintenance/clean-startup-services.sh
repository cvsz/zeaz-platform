#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# ZEAZ Safe Startup Service Cleaner
# ============================================================
# Default:
#   DRY_RUN=1
#
# This script DOES NOT delete:
#   *.service
#   *.socket
#   *.timer
#   systemd unit files
#
# It only audits startup entries and can disable selected units
# from an explicit allowlist.
#
# Usage:
#   DRY_RUN=1 bash scripts/maintenance/clean-startup-services.sh
#   DRY_RUN=0 bash scripts/maintenance/clean-startup-services.sh
# ============================================================

DRY_RUN="${DRY_RUN:-1}"
REPORT_DIR="${REPORT_DIR:-/home/zeazdev/zeaz-platform/reports/startup-clean}"
TS="$(date +%Y%m%d-%H%M%S)"
REPORT="$REPORT_DIR/startup-services-$TS.md"

mkdir -p "$REPORT_DIR"

log() {
  printf '[startup-clean] %s\n' "$*"
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

write_report_header() {
  cat > "$REPORT" <<MD
# Startup Service Clean Report

Generated: $TS

Mode:

\`\`\`text
DRY_RUN=$DRY_RUN
\`\`\`

Important:

\`\`\`text
No systemd unit files are deleted.
No *.service files are removed.
Only explicit allowlist units can be disabled.
\`\`\`

MD
}

append_cmd() {
  local title="$1"
  shift

  {
    echo
    echo "## $title"
    echo
    echo '```text'
    "$@" 2>&1 || true
    echo '```'
  } >> "$REPORT"
}

write_report_header

log "audit enabled system services"
append_cmd "Enabled system services" systemctl list-unit-files --type=service --state=enabled

log "audit enabled user services"
append_cmd "Enabled user services" systemctl --user list-unit-files --type=service --state=enabled

log "audit failed services"
append_cmd "Failed system units" systemctl --failed

log "audit enabled timers"
append_cmd "Enabled timers" systemctl list-unit-files --type=timer --state=enabled

log "audit startup sockets"
append_cmd "Enabled sockets" systemctl list-unit-files --type=socket --state=enabled

log "audit common autostart paths"
append_cmd "Autostart files" bash -lc '
for d in \
  /etc/xdg/autostart \
  "$HOME/.config/autostart" \
  /etc/init.d \
  /etc/rc.local.d
do
  echo "### $d"
  if [ -d "$d" ]; then
    find "$d" -maxdepth 2 -type f -print | sort
  else
    echo "missing"
  fi
done
'

# ------------------------------------------------------------
# Explicit safe allowlist.
# Add service names here only when you intentionally want them
# disabled from startup.
# ------------------------------------------------------------
DISABLE_ALLOWLIST=(
  # Examples only. Uncomment manually if needed.
  # "apache2.service"
  # "nginx.service"
  # "docker.service"
  # "cloudflared.service"
)

if [[ "${#DISABLE_ALLOWLIST[@]}" -eq 0 ]]; then
  log "disable allowlist is empty; nothing will be disabled"
else
  log "disable allowlist has ${#DISABLE_ALLOWLIST[@]} unit(s)"
fi

{
  echo
  echo "## Disable actions"
  echo
  echo '```text'
} >> "$REPORT"

for unit in "${DISABLE_ALLOWLIST[@]}"; do
  [[ -z "$unit" ]] && continue

  case "$unit" in
    *.service|*.socket|*.timer)
      log "disable startup for: $unit"
      echo "disable: $unit" >> "$REPORT"
      run sudo systemctl disable "$unit" || true
      ;;
    *)
      log "skip non-systemd unit name: $unit"
      echo "skip invalid unit name: $unit" >> "$REPORT"
      ;;
  esac
done

{
  echo '```'
  echo
  echo "Report saved to:"
  echo
  echo "\`\`\`text"
  echo "$REPORT"
  echo "\`\`\`"
} >> "$REPORT"

log "report saved: $REPORT"
log "done"
