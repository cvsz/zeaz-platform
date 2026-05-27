# Cloudflare LLM Docs Context Workflow

This repo uses Cloudflare documentation as a live upstream source for Codex/agent work. Do **not** paste or vendor the full Cloudflare `llms-full.txt` corpus into the repository. Fetch it into a local cache when needed.

## Source URLs

Primary index:

```text
https://developers.cloudflare.com/llms.txt
```

Fundamentals index:

```text
https://developers.cloudflare.com/fundamentals/llms.txt
```

Full fundamentals corpus, when available from Cloudflare:

```text
https://developers.cloudflare.com/fundamentals/llms-full.txt
```

## Why cache instead of commit

- The upstream docs change frequently.
- The full corpus is large and can bloat Git history.
- Keeping only scripts/prompts in Git avoids stale docs being mistaken as source of truth.
- Agent runs can refresh the cache before planning Cloudflare API, DNS, Tunnel, Access, WAF, and token updates.

## Local cache layout

```text
.cache/cloudflare-docs/
├── developers-llms.txt
├── fundamentals-llms.txt
├── fundamentals-llms-full.txt
└── metadata.json
```

`.cache/` must remain ignored by Git.

## Recommended workflow

```bash
bash scripts/cloudflare/fetch-cloudflare-llms-context.sh
```

Then point Codex/Claude/Cursor to:

```text
.cache/cloudflare-docs/fundamentals-llms.txt
.cache/cloudflare-docs/fundamentals-llms-full.txt
```

If `fundamentals-llms-full.txt` is unavailable, use the smaller `fundamentals-llms.txt` index and fetch the specific Markdown pages listed inside it.

## Agent instruction

When updating Cloudflare logic in this repo:

1. Refresh the docs cache first.
2. Prefer current Cloudflare documentation over old hardcoded assumptions.
3. Do not hardcode Cloudflare permission group IDs unless the docs/API response confirms them.
4. Keep `COST_LOCK=true` defaults for Free/no-cost mode.
5. Treat paid or overage-prone features as blocked unless explicitly approved by the owner.
6. Add tests whenever docs-driven behavior changes validation, token permissions, DNS, Tunnel, Access, or cost-lock behavior.

## Repo-specific focus areas

Use Cloudflare docs context for these files and modules:

- `python/cfstack_validate_env.py`
- `scripts/cloudflare/clean-and-regenerate-tokens.sh`
- `scripts/cloudflare/load-env.sh`
- `scripts/lib/env.sh`
- `tunnels/cloudflared/*.yml`
- `docs/CLOUDFLARE_CONTROL_PANEL_FREE.md`
- `docs/prompts/cloudflare-control-panel-free.prompt.md`
- Terraform/OpenTofu Cloudflare modules

## Safety rule

Never place real Cloudflare tokens, account IDs, zone IDs, tunnel credentials, origin certs, or generated tunnel tokens in committed docs or prompts.
