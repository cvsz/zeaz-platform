# AI Agent Prompt — Rollback and Disaster Recovery

Create a rollback plan for Cloudflare routing changes.

Rollback levels:
1. Config rollback: restore previous `infra/cloudflare/config.yml`.
2. DNS rollback: remove newly created CNAMEs or revert to previous targets.
3. Access rollback: disable new Access apps/policies only if they block production.
4. Traefik rollback: remove newly added routers/labels.
5. Git rollback: revert commit.

Required outputs:
- `git diff` backup command.
- file restore command.
- DNS dry-run delete plan.
- live verification commands.
- incident notes template.

Never:
- delete DNS live without explicit confirmation.
- delete tunnel credentials.
- rotate tokens during routing rollback unless token compromise is confirmed.
