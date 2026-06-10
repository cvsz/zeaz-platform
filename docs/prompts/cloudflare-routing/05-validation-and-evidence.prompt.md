# AI Agent Prompt — Validation and Release Evidence

Create validation evidence for the Cloudflare routing update.

Must verify:
- JSON domain map is valid.
- No duplicate hostnames.
- Every hostname ends with `.zeaz.dev` or equals `zeaz.dev`.
- Every app path is under `/home/zeazdev/zeaz-platform`.
- Generated cloudflared config has final `http_status:404`.
- `cloudflared tunnel ingress validate` passes when cloudflared is installed.
- DNS plan is dry-run by default.
- No token/secret values are committed.
- Makefile targets work or fail safely.
- Existing critical hostnames remain compatible or documented as changed.

Evidence report:
- Date/time.
- Git branch and commit.
- Files changed.
- Hostname matrix.
- Commands run.
- Output summary.
- Manual review checklist.
- Rollback commands.
