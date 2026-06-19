#!/usr/bin/env python3
import os
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
    ".gemini",
    ".agents",
    ".claude",
    ".codex",
    ".runtime",
    ".backups",
    ".backup",
    ".opencode",
    ".next",
    "dist",
    "build",
}

SKIP_PREFIXES = (
    "apps/zeaz-web/node_modules/",
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

SKIP_EXACT = {
    "apps/zdash/.github/workflows/e2e.yml",
}

# Only scan these root directories to avoid scanning massive untracked folders
TARGET_DIRS = ["zero-trust", "tunnels", "dns", "waf", "workers-ai", "infra", ".github", "apps"]

errors = []
checked = 0
skipped = 0

for target in TARGET_DIRS:
    if not os.path.exists(target):
        continue

    for root, dirs, files in os.walk(target, followlinks=False):
        # Prune hidden and package/build directories in-place to prevent entering them
        dirs[:] = [
            d for d in dirs
            if not d.startswith('.')
            and d not in SKIP_PARTS
            and d not in {"node_modules", "venv", "vendor", "dist", "build", ".next", ".git"}
        ]

        for file in files:
            if not (file.endswith(".yaml") or file.endswith(".yml")):
                continue

            path_str = os.path.join(root, file)
            path_str = os.path.normpath(path_str)
            rel_slashes = path_str.replace("\\", "/")

            if rel_slashes in SKIP_EXACT:
                skipped += 1
                continue
            if rel_slashes.startswith(SKIP_PREFIXES):
                skipped += 1
                continue
            if any(token in rel_slashes for token in SKIP_CONTAINS):
                skipped += 1
                continue

            try:
                with open(path_str, "r", encoding="utf-8") as f:
                    text = f.read()
            except Exception:
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
                errors.append(f"INVALID: {rel_slashes}: {exc}")

if errors:
    print("\n".join(errors))
    print(f"Checked {checked} YAML files, skipped {skipped}")
    sys.exit(1)

print(f"Validated {checked} YAML files; skipped {skipped} generated/template/vendor files")
