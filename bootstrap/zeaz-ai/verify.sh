#!/usr/bin/env bash
set -Eeuo pipefail
curl -fsS http://127.0.0.1:11434/api/tags | jq .
curl -fsS http://127.0.0.1:4000/v1/models | jq .
