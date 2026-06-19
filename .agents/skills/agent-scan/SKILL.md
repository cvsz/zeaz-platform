---
name: agent-scan
description: Use Snyk Agent Scan to inspect repo-local skills and optional MCP surfaces for prompt injection, secret handling, and agent supply-chain risks.
---

# Agent Scan

Use this skill when the task is to scan agent skills, Codex/Claude/Cursor surfaces, or MCP configuration with Snyk Agent Scan.

## When to use

- The user asks to scan agent skills or MCP configs for prompt injection or supply-chain risk.
- The task touches `.agents/skills`, `.agents/agents`, `.codex/config.toml`, or user-level agent surfaces.
- You need a dedicated agent-surface security pass beyond generic code scanning.

## Safety rules

- Start with repo-local skills only before scanning MCP configs.
- Treat MCP config scans as execution-capable operations because upstream may start configured stdio MCP servers.
- Do not use `--dangerously-run-mcp-servers` unless the environment is trusted and the user explicitly wants non-interactive execution.
- Require `SNYK_TOKEN`; do not print it. The repo wrapper can auto-load it from `.env`.

## Repo workflow

1. Confirm `SNYK_TOKEN` is present.
2. Start with:

```bash
make agent-scan
```

3. Escalate scope only when justified:

```bash
AGENT_SCAN_MODE=repo make agent-scan
AGENT_SCAN_MODE=home make agent-scan
AGENT_SCAN_MODE=auto make agent-scan
```

4. For machine-readable output:

```bash
make agent-scan AGENT_SCAN_ARGS="--json"
```

5. Summarize findings by scope:
   - repo skills
   - repo MCP config
   - user/home surfaces

## Output expectations

- State what scope was scanned.
- Call out whether MCP execution consent was involved.
- Separate confirmed findings from skipped surfaces or auth blockers.
- If the scan was not run, report the exact blocker such as missing `SNYK_TOKEN`.
