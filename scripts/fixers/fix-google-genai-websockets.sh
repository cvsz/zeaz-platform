#!/usr/bin/env bash

set -Eeuo pipefail

echo "[INFO] Fixing google-genai / websockets dependency conflict"

FILES=()

while IFS= read -r file; do
  FILES+=("$file")
done < <(
  find . \
    -type f \
    \( \
      -name "requirements.txt" \
      -o -name "requirements*.txt" \
      -o -name "constraints*.txt" \
      -o -name "pyproject.toml" \
    \) \
    -not -path "./.venv/*" \
    -not -path "./node_modules/*" \
    -not -path "./.git/*"
)

if [[ "${#FILES[@]}" -eq 0 ]]; then
  echo "[ERROR] no dependency files found"
  exit 1
fi

for file in "${FILES[@]}"; do
  echo "[INFO] scanning ${file}"

  cp "${file}" "${file}.bak"

  python3 - "$file" <<'PY'
from __future__ import annotations

import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")

original = text

# requirements.txt style
text = re.sub(
    r"(?m)^websockets==12\.0\s*$",
    "websockets==13.1",
    text,
)

text = re.sub(
    r"(?m)^websockets>=12\.0.*$",
    "websockets>=13.0,<15.0",
    text,
)

text = re.sub(
    r"(?m)^websockets<13.*$",
    "websockets>=13.0,<15.0",
    text,
)

# pyproject.toml quoted dependency style
text = text.replace('"websockets==12.0"', '"websockets==13.1"')
text = text.replace("'websockets==12.0'", "'websockets==13.1'")

text = text.replace('"websockets>=12.0"', '"websockets>=13.0,<15.0"')
text = text.replace("'websockets>=12.0'", "'websockets>=13.0,<15.0'")

if text != original:
    path.write_text(text, encoding="utf-8")
    print(f"[FIXED] {path}")
else:
    print(f"[OK] {path}")
PY
done

echo "[INFO] validating dependency files"

python3 -m venv .venv-depcheck

. .venv-depcheck/bin/activate

python -m pip install --upgrade pip setuptools wheel

if [[ -f requirements.txt ]]; then
  python -m pip install --dry-run -r requirements.txt
fi

python -m pip install --dry-run \
  "google-genai==0.6.0" \
  "websockets==13.1"

deactivate

rm -rf .venv-depcheck

echo "[SUCCESS] dependency conflict repaired"
