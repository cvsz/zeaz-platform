#!/usr/bin/env python3
from pathlib import Path
import sys
import yaml

SKIP_PARTS = {
    ".git",
    "node_modules",
    ".pnpm",
    ".venv",
    "venv",
    ".vendor",
    ".terraform",
    ".cache",
}

SKIP_PREFIXES = (
    ".ops/backups/",
    ".claude/",
    ".cache/",
    "apps/web/node_modules/",
    "apps/openwork/node_modules/",
    "apps/ABTPi18n/node_modules/",
    "apps/ABTPi18n/.copilot/",
    "apps/zkbtrader/.vendor/",
    "apps/zkbtrader/.venv/",
    "apps/zcino/frontend/node_modules/",
    "apps/ztrader/frontend/node_modules/",
)

SKIP_CONTAINS = (
    "/.claude/",
    "/.copilot/",
    "/.github/agents/",
    "/infra/helm/templates/",
    "/infra/k8s/helm/",
    "/templates/",
)

# These files are YAML-like templates or known generated/agent prompt files.
SKIP_EXACT = {
    "apps/zdash/.github/workflows/e2e.yml",
}

errors = []
checked = 0
skipped = 0

for path in sorted(Path(".").rglob("*")):
    if not path.is_file():
        continue
    if path.suffix not in {".yaml", ".yml"}:
        continue

    rel = path.as_posix().removeprefix("./")

    if rel in SKIP_EXACT:
        skipped += 1
        continue
    if any(part in SKIP_PARTS for part in path.parts):
        skipped += 1
        continue
    if rel.startswith(SKIP_PREFIXES):
        skipped += 1
        continue
    if any(token in rel for token in SKIP_CONTAINS):
        skipped += 1
        continue

    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        skipped += 1
        continue

    # Helm/go-template YAML is not valid YAML before rendering.
    if "{{" in text or "{%" in text:
        skipped += 1
        continue

    try:
        list(yaml.safe_load_all(text))
        checked += 1
    except Exception as exc:
        errors.append(f"INVALID: {rel}: {exc}")

if errors:
    print("\n".join(errors))
    print(f"Checked {checked} YAML files, skipped {skipped}")
    sys.exit(1)

print(f"Validated {checked} YAML files; skipped {skipped} generated/template/vendor files")
