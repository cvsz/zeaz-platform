#!/usr/bin/env bash
set -Eeuo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
HOME_CLAUDE="${HOME}/.claude"
PROJECT_DIR="$(pwd)"
BACKUP_DIR="${HOME_CLAUDE}/backups/ecc-disable-${TS}"

mkdir -p "$BACKUP_DIR"

log() {
  printf '[disable-ecc] %s\n' "$*"
}

backup_path() {
  local p="$1"
  if [ -e "$p" ]; then
    local safe
    safe="$(echo "$p" | sed 's#/#__#g')"
    cp -a "$p" "${BACKUP_DIR}/${safe}"
    log "backup: $p"
  fi
}

disable_dir() {
  local p="$1"
  if [ -e "$p" ]; then
    backup_path "$p"
    mv "$p" "${p}.disabled-${TS}"
    log "disabled dir: $p -> ${p}.disabled-${TS}"
  fi
}

disable_file() {
  local p="$1"
  if [ -f "$p" ]; then
    backup_path "$p"
    mv "$p" "${p}.disabled-${TS}"
    log "disabled file: $p -> ${p}.disabled-${TS}"
  fi
}

clean_settings_hooks() {
  local p="$1"
  [ -f "$p" ] || return 0

  backup_path "$p"

  python3 - "$p" <<'PY'
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])

try:
    data = json.loads(path.read_text())
except Exception as e:
    print(f"skip invalid json: {path}: {e}")
    sys.exit(0)

changed = False

# Remove all hooks that contain ECC / everything-claude-code references.
hooks = data.get("hooks")
if isinstance(hooks, dict):
    new_hooks = {}
    for event, entries in hooks.items():
        if not isinstance(entries, list):
            new_hooks[event] = entries
            continue

        kept_entries = []
        for entry in entries:
            blob = json.dumps(entry, ensure_ascii=False).lower()
            is_ecc = (
                "ecc" in blob
                or "everything-claude-code" in blob
                or "plugin-hook-bootstrap" in blob
                or "pre-bash-dispatcher" in blob
                or "post-bash-dispatcher" in blob
                or "quality-gate" in blob
                or "design-quality-check" in blob
                or "doc-file-warning" in blob
            )
            if is_ecc:
                changed = True
            else:
                kept_entries.append(entry)

        if kept_entries:
            new_hooks[event] = kept_entries
        else:
            changed = True

    if new_hooks:
        data["hooks"] = new_hooks
    else:
        data.pop("hooks", None)

# Also remove obvious ECC metadata keys if present.
for key in list(data.keys()):
    if str(key).lower() in {
        "ecc",
        "everything-claude-code",
        "ecc_check",
        "ecc_checks",
        "quality_gate",
        "quality_gates",
    }:
        data.pop(key, None)
        changed = True

if changed:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"cleaned ECC hooks/settings: {path}")
else:
    print(f"no ECC hooks found: {path}")
PY
}

log "backup dir: $BACKUP_DIR"

# 1) Clean global Claude Code settings.
clean_settings_hooks "${HOME_CLAUDE}/settings.json"
clean_settings_hooks "${HOME_CLAUDE}/settings.local.json"

# 2) Clean project Claude Code settings.
clean_settings_hooks "${PROJECT_DIR}/.claude/settings.json"
clean_settings_hooks "${PROJECT_DIR}/.claude/settings.local.json"

# 3) Disable global ECC rules.
disable_dir "${HOME_CLAUDE}/rules/ecc"

# 4) Disable project ECC rules.
disable_dir "${PROJECT_DIR}/.claude/rules/ecc"
disable_dir "${PROJECT_DIR}/rules/ecc"

# 5) Disable known ECC plugin folders by rename, not delete.
for p in \
  "${HOME_CLAUDE}/plugins/ecc" \
  "${HOME_CLAUDE}/plugins/ecc@ecc" \
  "${HOME_CLAUDE}/plugins/everything-claude-code" \
  "${HOME_CLAUDE}/plugins/everything-claude-code@everything-claude-code" \
  "${HOME_CLAUDE}/plugins/marketplaces/ecc" \
  "${HOME_CLAUDE}/plugins/marketplaces/everything-claude-code"
do
  disable_dir "$p"
done

# 6) Disable local ECC install state / generated folders when present.
for p in \
  "${PROJECT_DIR}/.ecc" \
  "${PROJECT_DIR}/ecc" \
  "${PROJECT_DIR}/.claude/ecc"
do
  disable_dir "$p"
done

# 7) Disable common ECC hook files if copied manually.
for p in \
  "${HOME_CLAUDE}/hooks/hooks.json" \
  "${PROJECT_DIR}/.claude/hooks/hooks.json" \
  "${PROJECT_DIR}/hooks/hooks.json"
do
  if [ -f "$p" ] && grep -qiE 'ecc|everything-claude-code|plugin-hook-bootstrap|quality-gate|doc-file-warning' "$p"; then
    disable_file "$p"
  fi
done

log "done"
log "restart Claude Code / OpenCode / Antigravity session after this"
log "backup saved at: $BACKUP_DIR"
