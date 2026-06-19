#!/usr/bin/env bash
set -Eeuo pipefail

mkdir -p \
  /opt/omega/postgres \
  /opt/omega/redis \
  /opt/omega/grafana \
  /opt/omega/prometheus \
  /opt/omega/loki \
  /opt/omega/authentik \
  /opt/omega/ollama \
  /opt/omega/openwebui
