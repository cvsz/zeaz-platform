#!/usr/bin/env bash
set -euo pipefail

# Prevent vulnerability reintroduction based on pinned policy rules.
GO111MODULE=on go run ./cmd/securityregression
