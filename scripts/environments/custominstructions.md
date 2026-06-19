# Custom Instructions

You are working in `cvsz/zeaz-platform`.

## Operating principles

- Keep Cloudflare Free/no-cost mode as the default.
- Use canonical `CLOUDFLARE_*` environment variables only.
- Do not use Cloudflare Global API Key authentication.
- Do not use `X-Auth-Key`, `X-Auth-Email`, `CF_GLOBAL_API_KEY`, or `CLOUDFLARE_EMAIL`.
- Do not commit `.env`, `.env.cloudflare`, local caches, Terraform state, token audit logs, or credential files.
- Never print token values or secret values.
- Keep destructive and production actions behind explicit confirmation.
- Use `bash gpg-loopback.sh commit -m "..."` for commits.

## Cloudflare auth

Use account-token flow:

```bash
Authorization: Bearer ${CLOUDFLARE_BOOTSTRAP_TOKEN}
```

Token lifecycle commands:

```bash
make token-verify
make token-rotate-dry
make token-rotate
```

## Environment precedence

```text
runtime environment variables > existing .env > .env.cloudflare > safe defaults
```

When generating `.env`, preserve existing values and never replace a non-empty secret with an empty value.

Required Cloudflare platform env keys:

```env
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_DNS_TOKEN=
CLOUDFLARE_WORKERS_TOKEN=
CLOUDFLARE_ZT_TOKEN=
CLOUDFLARE_WAF_TOKEN=
CLOUDFLARE_TUNNEL_TOKEN=
CLOUDFLARE_R2_TOKEN=
CLOUDFLARE_AI_GATEWAY_SLUG=zeaz
CLOUDFLARE_PLAN_TIER=Free
IDENTITY_PROVIDER_TYPE=saml
IDENTITY_PROVIDER_VENDOR=authentik
IDENTITY_PROVIDER_METADATA_URL=https://auth.zeaz.dev/application/saml/cloudflare-zero-trust/metadata/
PRIMARY_DOMAIN=zeaz.dev
ENVIRONMENT=prod
REGION=ap-southeast-1
ORIGIN_INFRA_TYPE=vm
ORIGIN_HOSTS=app.internal,pay.internal
TERRAFORM_BACKEND_TYPE=s3
TERRAFORM_STATE_BUCKET=zeaz-dev-cloudflare-platform-tfstate
TERRAFORM_LOCK_TABLE=zeaz-dev-cloudflare-platform-tflock
SECRET_ROTATION_INTERVAL=30d
```

Age private keys are local-only. Set them in `.env` only when needed; do not keep age key placeholders in tracked templates or prompt files.

## Logging

Use UTC logs:

```bash
log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
warn(){ log "WARN: $*" >&2; }
die(){ log "ERROR: $*" >&2; exit 1; }
```

Do not log secret values.

## Observability

- Emit clear logs for setup, validation, drift, backup, rollback, and API operations.
- Log skipped operations explicitly.
- Differentiate warnings from fatal errors.
- Produce machine-readable output where appropriate.

## Rollback

- Backup before mutation.
- Support rollback for generated env files, Terraform state-affecting changes, and token lifecycle operations.
- Never delete or revoke credentials without backup and explicit confirmation.
