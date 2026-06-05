#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

path = Path(sys.argv[1] if len(sys.argv) > 1 else "Makefile")
text = path.read_text()
lines = text.splitlines()

target_re = re.compile(r"^([A-Za-z0-9_.-]+(?:\s+[A-Za-z0-9_.-]+)*)\s*:(?![=])")
special_targets = {
    ".PHONY",
    ".DEFAULT_GOAL",
    ".SILENT",
    ".ONESHELL",
    ".SUFFIXES",
    ".PRECIOUS",
    ".SECONDARY",
    ".INTERMEDIATE",
    ".DELETE_ON_ERROR",
    ".EXPORT_ALL_VARIABLES",
}

targets: dict[str, list[int]] = defaultdict(list)
warnings: list[str] = []

for i, line in enumerate(lines, 1):
    if not line.strip():
        continue
    if line.startswith("\t"):
        continue
    if ":=" in line or "?=" in line or "+=" in line:
        continue

    m = target_re.match(line)
    if not m:
        continue

    raw_targets = m.group(1).split()
    for target in raw_targets:
        if target in special_targets:
            continue
        if target.startswith(".") and target.upper() == target:
            continue
        targets[target].append(i)

duplicates = {k: v for k, v in targets.items() if len(v) > 1}
issues: list[str] = []

for target, locs in sorted(duplicates.items()):
    issues.append(f"duplicate target {target}: lines {', '.join(map(str, locs))}")

sync_count = text.count("sync-cloudflare-env-files.sh")
if sync_count > 1:
    # token-rotate should normally call this once. More than one is a real hygiene issue.
    issues.append(f"sync-cloudflare-env-files.sh appears {sync_count} times; expected 1")

if text.count("# zDash Cloudflare Terraform Integration") > 1:
    issues.append("duplicate zDash Cloudflare Terraform Integration header")

for i, line in enumerate(lines, 1):
    if line.startswith(".PHONY:") and len(line) > 500:
        warnings.append(
            f"large .PHONY declaration at line {i}; prefer grouped declarations during future cleanup"
        )

print("Makefile audit")
print(f"- file: {path}")
print(f"- targets: {len(targets)}")
print(f"- duplicate targets: {len(duplicates)}")
print(f"- issues: {len(issues)}")
print(f"- warnings: {len(warnings)}")

if warnings:
    print()
    for warning in warnings:
        print(f"WARN: {warning}")

if issues:
    print()
    for issue in issues:
        print(f"ISSUE: {issue}")
    raise SystemExit(1)

print("PASS: Makefile audit clean")
