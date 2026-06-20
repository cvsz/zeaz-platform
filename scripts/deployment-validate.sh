#!/usr/bin/env bash
set -Eeuo pipefail
echo "Validating deployment foundations..."
[ -f docs/deployment/procedure.md ] || { echo "Missing deployment procedure"; exit 1; }
[ -f docs/audit/acceptance/service-acceptance.md ] || { echo "Missing acceptance checklist"; exit 1; }
echo "Deployment foundations valid."
