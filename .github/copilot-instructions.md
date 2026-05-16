# GitHub Copilot Instructions

When suggesting code in this repository:

1. Prioritize Cloudflare Zero Trust security controls and least privilege.
2. Generate executable code only (no placeholders, no pseudo-code).
3. Preserve idempotent, rollback-safe bash automation patterns.
4. Keep Terraform/OpenTofu modules validated and reusable.
5. Require environment and token-scope validation prior to mutating workflows.

## Preferred Commands
- `make -C zeaz-platform validate`
- `make -C zeaz-platform plan`
- `make -C zeaz-platform apply`
- `make -C zeaz-platform drift`


## MCP Runtime
- Regenerate local MCP config with `make -C zeaz-platform mcp-config` after token rotation.
