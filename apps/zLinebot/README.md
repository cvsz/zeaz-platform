# zLinebot

Last updated: 2026-06-10

`apps/zLinebot` is the LINE bot automation platform stack inside `cvsz/zeaz-platform`.

## Stack

| Layer | Stack |
|---|---|
| App runtime | Mixed Node / Python / Docker assets |
| App code | `app/`, `apps/`, `packages/`, `admin/` |
| Cloud assets | `cloud/`, `cloudflare/`, `cloudflared/` |
| Data | `db/`, `warehouse/` |
| Deployment | Docker Compose, k8s, deploy scripts |
| Monitoring | install monitoring and observability scripts |
| Route intent | LINE bot / automation service route |

## Scope rule

This README documents only `apps/zLinebot`. Keep zOffice, zDash, zWallet, and web commands in their own app READMEs.

## Local entrypoints

```bash
cd /home/zeazdev/zeaz-platform/apps/zLinebot
```

Common operator files:

```text
install.sh
install_full.sh
install_ultimate.sh
bootstrap.sh
deploy.sh
deploy-k8s.sh
watchdog.sh
zlinebot-master.sh
zlinebot-master-orchestrator.sh
zlinebot-master-selfheal.sh
```

## Docker

```bash
docker compose up -d --build
```

## Important files

```text
app/
apps/
admin/
packages/
db/
cloudflare/
cloudflared/
contracts/
infra/
k8s/
nginx/
scripts/
SECURITY.md
```

## Notes

- Keep LINE, webhook, and provider configuration local or in platform secret storage.
- Use staging/webhook test flows before public bot traffic.
- Keep zLinebot automation isolated from other app stacks.
