#!/usr/bin/env bash
set -Eeuo pipefail
echo "Validating GitOps foundations..."
[ -f .github/workflows/ci.yml ] || { echo "Missing CI workflow"; exit 1; }
[ -f docs/git/environment-approval.md ] || { echo "Missing environment approval docs"; exit 1; }
[ -f docs/git/gitops-workflow.md ] || { echo "Missing GitOps docs"; exit 1; }
echo "GitOps foundations valid."
