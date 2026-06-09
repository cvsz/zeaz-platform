# Cloudflare Agent Setup

## Included AI Agent Integrations
- Codex context: `.codex/context.md`
- Codex Master Meta Cloud Suite: `docs/codex/master-meta-cloud-suite.md` and `.codex/suite/master-meta-cloud-suite.json`
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
make codex-suite-validate
```

## Governance
- No plaintext secrets in repository.
- Dedicated least-privilege Cloudflare tokens only.
- Deterministic GitOps flow: plan, review, apply via workflows.
