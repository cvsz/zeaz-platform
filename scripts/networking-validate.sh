#!/usr/bin/env bash
set -Eeuo pipefail
echo "Validating networking foundations..."
[ -f zero-trust/networking/dns.tf ] || { echo "Missing DNS config"; exit 1; }
[ -f zero-trust/networking/tunnel.tf ] || { echo "Missing Tunnel config"; exit 1; }
echo "Networking foundations valid."
