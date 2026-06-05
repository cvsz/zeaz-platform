# ECC integration notes

This repository integrates an ECC-informed agent pack at the configuration and operating-guideline level.

## Source reviewed

- Repository: `affaan-m/ECC`
- License: MIT
- Relevant concepts: cross-harness agents, skills, hooks, rules, security scanning, research-first development, Claude Code, Codex, OpenCode, and other harness support.

## Integration boundary

ZKBTrader does not vendor the ECC repository. The local files in this repository are original bootstrap profiles for this project. They are designed to point agents toward the existing ZKBTrader safety rules, tests, and documentation.

## Required agent behavior

All agents must:

- read `AGENTS.md`, `SECURITY.md`, and `README.md` first
- preserve paper-mode defaults
- never place real credentials in files, logs, prompts, or examples
- route simulated execution through the risk engine
- run or document the required checks before completion
- keep changes small, reviewable, and auditable

## Installed local profiles

- `agy-bootstrap-safe`
- `claude-code-bootstrap-safe`
- `claude-bootstrap-safe`
- `codex-bootstrap-safe`
- `nvidia-nim-bootstrap-safe`
- `llama-bootstrap-safe`
- `funerary-bootstrap-safe`
- `opencode-bootstrap-safe`
- `all-agent-bootstrap-safe`
