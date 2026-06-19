#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DRY_RUN="${DRY_RUN:-false}"

find_files() {
  git ls-files . \
    ':!*.png' ':!*.jpg' ':!*.jpeg' ':!*.gif' ':!*.webp' ':!*.ico' \
    ':!*.woff' ':!*.woff2' ':!*.ttf' ':!*.eot' \
    ':!*.zip' ':!*.tar.gz' ':!*.sqlite' ':!*.db' \
    ':!.runtime/**' ':!node_modules/**' ':!.venv/**' ':!venv/**'
}

matches="$(find_files | xargs grep -IlE 'My Virtual Office|Virtual Office|virtual office|visual office|Visual Office' 2>/dev/null || true)"

if [ -z "$matches" ]; then
  echo "No legacy office branding strings found."
  exit 0
fi

echo "Files with legacy branding:"
printf '%s\n' "$matches"

if [ "$DRY_RUN" = "true" ]; then
  echo
  echo "Dry run only. Re-run without DRY_RUN=true to apply."
  exit 0
fi

while IFS= read -r file; do
  [ -n "$file" ] || continue
  python3 - "$file" <<'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8", errors="replace")
replacements = {
    "My Virtual Office": "zOffice",
    "Virtual Office": "zOffice",
    "virtual office": "zOffice",
    "Visual Office": "zOffice",
    "visual office": "zOffice",
}
for old, new in replacements.items():
    text = text.replace(old, new)
path.write_text(text, encoding="utf-8")
PY
  echo "Renamed branding in: $file"
done <<< "$matches"

echo "Completed zOffice branding rename. Review with: git diff -- apps/zoffice"
