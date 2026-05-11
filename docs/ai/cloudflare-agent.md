# Cloudflare Agent Setup

## Included AI Agent Integrations
- Codex: `.codex/context.md`
- Claude Code: `.claude/CLAUDE.md`
- Cursor: `.cursor/rules.md`
- GitHub Copilot: `.github/copilot-instructions.md`
- MCP runtime: `.mcp.json`

## Bootstrap
Run:
```bash
make bootstrap-agent
```

## Validate
Run:
```bash
make validate-agent
```

## Governance
- No plaintext secrets in repository.
- Dedicated least-privilege Cloudflare tokens only.
- Deterministic GitOps flow: plan, review, apply via workflows.
