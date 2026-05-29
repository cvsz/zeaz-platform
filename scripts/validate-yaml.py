#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

try:
    import yaml
except Exception as exc:
    print(f"ERROR: PyYAML is required: {exc}")
    sys.exit(1)

ROOT = Path(".")

# Validate repository-owned YAML only. Local tool caches and agent runtimes may
# contain third-party multi-document YAML or non-project config that should not
# gate this repository's source validation.
SKIP_PARTS = {
    ".git",
    ".backup",
    ".backup-refactor-*",
    ".cache",
    ".cloudflare-backups",
    ".terraform",
    ".venv",
    ".agent",
    ".agents",
    ".claude",
    ".codex",
    ".cursor",
    ".gemini",
    ".mcp",
    ".pytest_cache",
    ".ruff_cache",
    ".terraform",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "reports",
}
SKIP_PREFIXES = (
    Path(".claude/homunculus"),
    Path(".cache/ecc"),
)


def is_git_tracked(path: Path) -> bool:
    try:
        subprocess.run(
            ["git", "ls-files", "--error-unmatch", str(path)],
            cwd=ROOT,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
            text=True,
        )
        return True
    except Exception:
        return False


def should_skip(path: Path) -> bool:
    if any(part in SKIP_PARTS for part in path.parts):
        return True
    if any(path == prefix or prefix in path.parents for prefix in SKIP_PREFIXES):
        return True
    # If this is a git checkout, ignore untracked YAML so local tools/caches do
    # not break source validation. If git is unavailable or this is not a git
    # checkout, fall back to path-based filtering above.
    if (ROOT / ".git").exists() and not is_git_tracked(path):
        return True
    return False


files: list[Path] = []
for pattern in ("*.yml", "*.yaml"):
    for path in ROOT.rglob(pattern):
        if not should_skip(path):
            files.append(path)

failed: list[tuple[Path, Exception]] = []
for path in sorted(set(files)):
    try:
        yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as exc:
        failed.append((path, exc))

if failed:
    for path, exc in failed:
        print(f"INVALID: {path}: {exc}")
    sys.exit(1)

print(f"Validated {len(set(files))} YAML files")
