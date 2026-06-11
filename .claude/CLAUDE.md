# Claude Code Runtime Instructions

## Repository Scope
This repository provisions Cloudflare-native enterprise infrastructure with OpenTofu/Terraform, bash automation, and policy-centric guardrails.

## Non-Negotiable Security Controls
- Validate required runtime variables before every write operation.
- Use dedicated API tokens; reject shared global tokens.
- Enforce MFA/WebAuthn/mTLS controls for finance workloads.
- Keep scripts idempotent and rollback-capable.

## Execution Order
1. `make validate`
2. `make plan-tier`
3. `make mcp-config`
4. `make plan`
5. Stop for human review before any apply, deploy, token rotation, tunnel mutation, or other external mutation.
6. After a separately approved manual apply, run `make drift` for evidence collection.

## Claude-Assisted App Building
- Use `docs/ai/free-claude-code-app-builder.md` for safe "free Claude" or third-party-provider app-building workflows.
- Do not claim Claude Code is available on the free Claude.ai plan unless official Anthropic documentation changes and the repo guide is updated.
- Keep provider keys and local model endpoints with credentials in ignored local files only.

## MCP and AI Tooling
Use `.mcp.json` endpoints for Cloudflare-compatible MCP workflows and only execute allowlisted commands from `zeaz-platform/scripts/ai/bootstrap-agents.sh`.


## MCP Runtime
- Regenerate local MCP config with `make -C zeaz-platform mcp-config` after token rotation.
