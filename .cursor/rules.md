# Cursor Rules: Cloudflare Platform

## Platform Defaults
- Security-first, deterministic automation.
- GitOps-safe changes only.
- No placeholder values and no pseudo-code.

## Required Checks Before Commit
- `make -C cloudflare-platform validate`
- `make -C cloudflare-platform contract`
- `make -C cloudflare-platform plan-tier`

## File Conventions
- Bash scripts must begin with:
  - `#!/usr/bin/env bash`
  - `set -Eeuo pipefail`
  - `IFS=$'\n\t'`
- Do not weaken token scope validation logic.
- Keep environment validation in sync with `scripts/contracts/environment-contract.json`.


## MCP Runtime
- Regenerate local MCP config with `make -C cloudflare-platform mcp-config` after token rotation.
