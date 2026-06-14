# Supabase AI Tools Integration Track

Repository: `cvsz/zeaz-platform`

This track integrates Supabase AI tooling into the platform without committing secrets or connecting production data to AI agents by default.

## Source docs

- Supabase machine-readable docs entrypoint: `https://supabase.com/llms.txt`
- Supabase guide bundle for AI agents: `https://supabase.com/llms/guides.txt`
- Supabase AI tools guide: `https://supabase.com/docs/guides/ai-tools/`

## Scope

Supabase is used as an optional AI developer tooling integration for:

- MCP access to Supabase development projects.
- Supabase AI and vector references for Postgres + pgvector work.
- Local/CI agent configuration templates that use environment-variable placeholders only.
- Edge Function MCP server development notes for future internal tools.

## Non-negotiable safety rules

- Do not connect Supabase MCP to production data by default.
- Use development or branch projects only.
- Do not commit `SUPABASE_ACCESS_TOKEN`, service-role keys, JWT secrets, database passwords, or generated MCP configs containing real values.
- Keep MCP tool approval enabled in clients that support it.
- Prefer project-scoped and read-only modes when possible.
- Keep generated MCP config under ignored local paths such as `.agent/`.
- Never print Supabase token values.

## Local environment keys

Tracked templates may include only non-secret placeholders:

```env
SUPABASE_PROJECT_REF=
SUPABASE_MCP_BASE_URL=https://mcp.supabase.com/mcp
SUPABASE_MCP_CONFIG_OUT=.agent/supabase-mcp.json
```

Set `SUPABASE_ACCESS_TOKEN` only in local `.env` or CI secrets when manual authentication is required.

## Make targets

```bash
make supabase-ai-tools
make supabase-docs-context
make supabase-mcp-check
make supabase-mcp-config
```

Expected behavior:

- `supabase-docs-context` caches Supabase `llms.txt` and guide content under `.cache/supabase-ai-tools/`.
- `supabase-mcp-check` validates whether local Supabase MCP variables are present without printing secrets.
- `supabase-mcp-config` writes a local MCP config with `${SUPABASE_ACCESS_TOKEN}` as a placeholder, not a real token.
- `supabase-ai-tools` runs docs caching and MCP validation.

## Hosted Supabase MCP template

The generated local config should follow this shape:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=${SUPABASE_PROJECT_REF}",
      "headers": {
        "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

The literal `${SUPABASE_ACCESS_TOKEN}` placeholder is intentional so no secret is written to Git.

## Validation

After integration changes:

```bash
make env-format-validate
make validate
make lint
make secret-scan
make policy-test
make supabase-mcp-check
```

## Finalization

Use the repo finalization target after staging intended changes:

```bash
git add .
make gpg-finalize COMMIT_MSG="feat(supabase): integrate AI tools and MCP helpers"
```
