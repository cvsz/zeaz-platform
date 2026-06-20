#!/usr/bin/env bash
set -Eeuo pipefail
echo "Validating monitoring/DR foundations..."
[ -f monitoring/docker-compose.yml ] || { echo "Missing monitoring docker-compose"; exit 1; }
[ -f docs/runbooks/tunnel-outage.md ] || { echo "Missing DR runbook"; exit 1; }
[ -f docs/security/audit/dependency-check.md ] || { echo "Missing audit docs"; exit 1; }
echo "Monitoring/DR foundations valid."
