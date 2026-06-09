# zWallet

Last updated: 2026-06-10

`apps/zwallet` is the wallet, swap, payments, mobile/admin, and backend service stack inside `cvsz/zeaz-platform`.

## Stack

| Layer | Stack |
|---|---|
| Monorepo tooling | pnpm workspace / Node |
| Backend services | `backend/`, `api/`, `services/` |
| Frontend/admin | `dashboard/`, `admin/`, `apps/` |
| Mobile | `mobile/`, `android-app/` |
| Data | `db/`, `migrations/` |
| Infrastructure | Docker Compose, k8s, Terraform, infra docs |
| Route intent | `app.zeaz.dev` |

## Scope rule

This README documents only `apps/zwallet`. Do not mix zVeO, zDash, zOffice, or zTrader commands into this wallet stack.

## Local development

```bash
cd /home/zeazdev/zeaz-platform/apps/zwallet
pnpm install
```

Run the specific workspace package defined in the current `package.json` scripts:

```bash
pnpm dev
pnpm build
pnpm test
```

## Docker

```bash
docker compose up -d --build
```

## Important files

```text
package.json
pnpm-workspace.yaml
apps/
api/
backend/
services/
dashboard/
admin/
mobile/
android-app/
db/
migrations/
infra/
k8s/
terraform/
docker-compose.yml
```

## Security notes

- Never commit private keys, wallet seeds, MPC shares, payment credentials, or card/payment provider secrets.
- Use testnet/sandbox rails by default.
- Keep production payment and swap providers explicitly gated.
- Review `security/`, `formal/`, and `ARCHITECTURE.md` before production changes.
