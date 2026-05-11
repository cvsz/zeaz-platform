#!/usr/bin/env python3
import sys
from pathlib import Path

try:
    import yaml
except Exception as exc:
    print(f"ERROR: PyYAML is required: {exc}")
    sys.exit(1)

root = Path('.')
files = [p for p in root.rglob('*.yml') if '.git/' not in str(p)] + [p for p in root.rglob('*.yaml') if '.git/' not in str(p)]
failed = []
for p in sorted(set(files)):
    try:
        yaml.safe_load(p.read_text())
    except Exception as exc:
        failed.append((p, exc))

if failed:
    for p, exc in failed:
        print(f"INVALID: {p}: {exc}")
    sys.exit(1)
print(f"Validated {len(set(files))} YAML files")
