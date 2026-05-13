# zWallet Integration Runbook

This runbook integrates the `cvsz/zwallet` platform into the Cloudflare Tunnel environment.

## Upstream repository

- `https://github.com/cvsz/zwallet`

## Current integration goal

Bring `admin-wallet.zeaz.dev` online behind the active Cloudflare Tunnel.

Suggested route:

```text
admin-wallet.zeaz.dev -> http://localhost:8081
```

## Current repository status

The upstream repository currently provides:

- PNPM workspace
- installer automation
- lint/typecheck automation
- architecture + infra structure

The repository does not yet expose a finalized runtime compose stack or stable production HTTP entrypoint.

Current bootstrap command:

```bash
pnpm setup:auto
```

Reference files:

- `package.json`
- `scripts/installer.config.json`

## Automated integration helper

Use:

```bash
bash scripts/zwallet/deploy-zwallet-origin.sh
```

The helper:

- clones or updates `cvsz/zwallet`
- runs installer automation
- installs a temporary placeholder origin on `localhost:8081`
- validates the local origin
- validates the public Cloudflare route

## Cloudflare Tunnel route

Add a Tunnel Public Hostname:

```text
Hostname: admin-wallet.zeaz.dev
Service Type: HTTP
URL: localhost:8081
```

Do not create duplicate DNS records manually if Terraform already owns DNS.

## Validation

Local:

```bash
curl -sI http://localhost:8081
```

Public:

```bash
curl -sI https://admin-wallet.zeaz.dev/ | grep -Ei 'HTTP|server|cf-ray'
```

Expected:

```text
HTTP/2 200
server: cloudflare
```

## Planned evolution

Replace the placeholder origin with:

- real zWallet API service
- real zWallet dashboard/mobile-web frontend
- wallet-engine backend
- swap-engine backend
- observability endpoints

Suggested future hostnames:

| Hostname | Purpose |
|---|---|
| `admin-wallet.zeaz.dev` | wallet admin UI |
| `wallet-api.zeaz.dev` | wallet backend API |
| `swap-api.zeaz.dev` | swap engine API |
| `pay.zeaz.dev` | payment/card flows |

## Security guidance

Recommended:

- Zero Trust required for admin routes
- WAF managed rules enabled gradually
- service-token auth for internal APIs
- rate limiting for wallet/swap endpoints
- audit logging enabled

## Final validation

```bash
make validate-agent
make drift
curl -sI https://admin-wallet.zeaz.dev/ | grep -Ei 'HTTP|server|cf-ray'
```
