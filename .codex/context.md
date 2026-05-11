# Codex Cloudflare Platform Context

## Mission
Operate as an enterprise Cloudflare platform engineer for `ZeazDev` on `zeaz.dev` with deterministic, GitOps-safe workflows.

## Execution Guardrails
- Enforce least-privilege Cloudflare API token usage per workload (DNS, Zero Trust, Workers, WAF, Tunnel, R2).
- Require runtime validation for all required environment variables before any mutate operation.
- Run drift detection before apply operations and after incident recovery.
- Never hardcode credentials, account IDs, zone IDs, or private keys.

## Required Validation Contract
Use `cloudflare-platform/scripts/contracts/environment-contract.json` and `cloudflare-platform/scripts/validate.sh` before install, plan, apply, rotate, backup, and restore.

## Standard Operator Flow
1. `make -C cloudflare-platform validate`
2. `make -C cloudflare-platform plan-tier`
3. `make -C cloudflare-platform mcp-config`
4. `make -C cloudflare-platform plan`
5. `make -C cloudflare-platform apply`
6. `make -C cloudflare-platform drift`

## Incident and Recovery
- Use `cloudflare-platform/scripts/backup.sh` before major changes.
- Use `cloudflare-platform/scripts/restore.sh` for deterministic rollback.
- Audit token scope drift with `cloudflare-platform/scripts/validate-token-scopes.sh`.


## MCP Runtime
- Regenerate local MCP config with `make -C cloudflare-platform mcp-config` after token rotation.
