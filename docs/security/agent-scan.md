# Snyk Agent Scan

This repository supports [Snyk Agent Scan](https://github.com/snyk/agent-scan) as an opt-in security check for agent skills and MCP surfaces.

## Why it is separate from default validation

- Upstream requires `SNYK_TOKEN`.
- Scanning MCP configuration can execute configured MCP server commands.
- `zeaz-platform` defaults to offline validation first, so Agent Scan is not wired into `make validate`.

## Installation

Install the upstream CLI with `uv`:

```bash
uv tool install git+https://github.com/snyk/agent-scan
```

Upstream package metadata currently exposes the CLI as `snyk-agent-scan` and requires Python `>=3.10`.

## Authentication

Export a Snyk API token before running scans:

```bash
export SNYK_TOKEN=your-token-here
```

The repo wrapper also auto-loads `SNYK_TOKEN` from the repository `.env` file when the shell environment does not already provide it.

## Repository wrapper

Use the local wrapper for safer defaults:

```bash
make agent-scan
```

Default mode is `repo-skills`, which scans `.agents/skills` only and does not require MCP server execution.

## Modes

- `repo-skills`: scan repo-local skills only
- `repo`: scan repo-local skills and `.codex/config.toml`
- `home`: scan `~/.agents/skills`, `~/.codex/skills`, and `~/.codex/config.toml`
- `auto`: let upstream auto-discover supported agent surfaces on the current machine

Examples:

```bash
make agent-scan
AGENT_SCAN_MODE=repo make agent-scan
AGENT_SCAN_MODE=home make agent-scan
AGENT_SCAN_MODE=auto make agent-scan
make agent-scan AGENT_SCAN_ARGS="--json"
```

## MCP safety

When the scan includes MCP configuration:

- review the consent prompt carefully;
- prefer interactive approval over automatic execution;
- use `--dangerously-run-mcp-servers` only in trusted environments;
- avoid scanning untrusted MCP configs outside a sandbox or disposable environment.

## Integration with aggregate security scans

`make security-scan` can invoke Agent Scan only when explicitly enabled:

```bash
ENABLE_AGENT_SCAN=true make security-scan
```

This keeps the default security suite offline-first and avoids surprise MCP execution.
