#!/bin/bash
set -euo pipefail
cd /home/zeazdev/zeaz-platform/apps/zai-factory/skills-vault
python3 -m json.tool catalog.json >/dev/null
python3 -m json.tool bundles.json >/dev/null
echo "Validation passed."
