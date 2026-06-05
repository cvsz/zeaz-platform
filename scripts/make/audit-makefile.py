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
targets: dict[str, list[int]] = defaultdict(list)

for i, line in enumerate(lines, 1):
    if line.startswith("\t") or ":=" in line or "?=" in line or "+=" in line or "=" in line.split(":", 1)[0]:
        continue
    m = target_re.match(line)
    if not m:
        continue
    for target in m.group(1).split():
        targets[target].append(i)

duplicates = {k: v for k, v in targets.items() if len(v) > 1}

issues: list[str] = []

for target, locs in sorted(duplicates.items()):
    issues.append(f"duplicate target {target}: lines {', '.join(map(str, locs))}")

if text.count("sync-cloudflare-env-files.sh") > 1:
    issues.append("token/env sync helper appears more than once; check token-rotate recipe")

if text.count("# zDash Cloudflare Terraform Integration") > 1:
    issues.append("duplicate zDash Cloudflare Terraform Integration header")

if re.search(r"^\.PHONY: .{500,}$", text, re.M):
    issues.append("very large global .PHONY line; prefer grouped .PHONY declarations near sections")

print("Makefile audit")
print(f"- file: {path}")
print(f"- targets: {len(targets)}")
print(f"- duplicate targets: {len(duplicates)}")
print(f"- issues: {len(issues)}")

if issues:
    print()
    for issue in issues:
        print(f"ISSUE: {issue}")
    raise SystemExit(1)

print("PASS: Makefile audit clean")
