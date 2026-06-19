# Gemini Sandbox Script Patch

## Summary

This patch adds Gemini-safe writable path handling for AI helper scripts that create cache, log, config, or generated files.

## New Files

- `scripts/lib/gemini-sandbox.sh`
  - Provides shared helpers for writable directory detection.
  - Falls back to `/tmp/gemini-pack` when project-local paths are read-only.
  - Exports `GEMINI_PACK_ROOT`, `GEMINI_CACHE_DIR`, and `GEMINI_LOG_DIR`.
- `scripts/ai/gemini-sandbox-run.sh`
  - Runs any command with Gemini-safe cache/log paths.
  - Supports `--print-env` and `-- COMMAND` forms.

## Patched Scripts

- `scripts/ai/install-ecc.sh`
  - Uses shared sandbox helper.
  - Resolves `ECC_CACHE_DIR` to a writable location.
  - Falls back to `/tmp/gemini-pack/ecc` when `.cache/ecc` is not writable.
- `scripts/ai/render-mcp-config.sh`
  - Uses shared sandbox helper.
  - Resolves `.mcp.json` output to a writable file.
  - Falls back to `/tmp/gemini-pack/.mcp.json` when the requested parent path is not writable.
- `scripts/ai/bootstrap-agent.sh`
  - Uses shared sandbox helper.
  - Writes logs to a writable log directory.
  - Renders tunnel config into the repo when writable, otherwise into `/tmp/gemini-pack/tunnels/cloudflared/config.yml`.
- `scripts/ai/bootstrap-agents.sh`
  - Uses shared sandbox helper.
  - Redacts Cloudflare account and zone IDs in console output.
- `scripts/ai/validate-agent-env.sh`
  - Adds `--help` support.
  - Adds a trap handler for deterministic validation failure output.

## Operator Usage

```bash
cd /home/zeazdev/zeaz-platform

# Show writable paths selected for the current environment.
bash scripts/ai/gemini-sandbox-run.sh --print-env

# Run ECC dry-run with writable cache fallback.
bash scripts/ai/gemini-sandbox-run.sh -- bash scripts/ai/install-ecc.sh --dry-run

# Render MCP config with safe output fallback.
bash scripts/ai/gemini-sandbox-run.sh -- bash scripts/ai/render-mcp-config.sh
```

## Safety Notes

- No real secrets were added.
- No infrastructure apply/destroy behavior was added.
- No external deployment behavior was added.
- Fallback writes go to `/tmp/gemini-pack` by default.
- Scripts still require operator-provided environment variables where validation is necessary.

## Recommended Validation

```bash
bash -n scripts/lib/gemini-sandbox.sh
bash -n scripts/ai/gemini-sandbox-run.sh
bash -n scripts/ai/install-ecc.sh
bash -n scripts/ai/render-mcp-config.sh
bash -n scripts/ai/bootstrap-agent.sh
bash -n scripts/ai/bootstrap-agents.sh
bash -n scripts/ai/validate-agent-env.sh
bash scripts/ai/gemini-sandbox-run.sh --print-env
```
