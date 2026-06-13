#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

chmod +x "$ROOT"/scripts/*.sh

"$ROOT/scripts/01-prereqs.sh"
"$ROOT/scripts/02-security.sh"
"$ROOT/scripts/03-docker.sh"
"$ROOT/scripts/04-k3s.sh"
"$ROOT/scripts/05-directories.sh"
"$ROOT/scripts/06-stack.sh"

echo
echo "Omega Installation Complete"
echo
