# ZEAZ Safety Checkpoint

Generated: 2026-06-09 15:57:26Z

## Git State

- Branch observed by automation: `work`.
- Local backups are directed to `.backups/`, which is gitignored.
- Secret-bearing env files (`.env`, `.env.*`, app env files, tfvars, keys, local Cloudflare state) are ignored by `.gitignore`.

## Backup Policy

Use this non-destructive command before manual invasive edits:

```bash
mkdir -p .backups/$(date -u +%Y%m%d-%H%M%S)
cp -a docker-compose.yml .env.example infra infrastructure scripts .backups/$(date -u +%Y%m%d-%H%M%S)/ 2>/dev/null || true
```

## Safety Decisions

- No Docker volumes are removed by generated cleanup unless `--include-volumes` and `CONFIRM_DOCKER_VOLUME_PRUNE=yes` are both supplied.
- Cloudflare API operations are not performed by default.
- Generated local secrets are written only to gitignored local env files.
