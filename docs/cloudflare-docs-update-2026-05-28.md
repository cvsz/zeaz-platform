# Cloudflare Tunnel + API Docs Update Review — 2026-05-28

## Sources reviewed

- Cloudflare Tunnel connector documentation
  - `https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/`
  - Visible page last updated: `2026-04-17`
- Cloudflare API reference
  - `https://developers.cloudflare.com/api/`

## Key updates for zeaz-platform

### 1. Tunnel model remains outbound-only

Cloudflare Tunnel should remain the default ingress model for `zeaz-platform` because `cloudflared` creates outbound-only connections from the origin to Cloudflare. The origin should not need public inbound ports for panel/API/SSH exposure.

Repo impact:

- Keep `tunnels/cloudflared/zcf-control-free.template.yml` as the canonical Free/no-cost tunnel template.
- Keep firewall policy aligned to outbound-only tunnel operation.
- Do not open public inbound ports for `panel.zeaz.dev`, `api.zeaz.dev`, or `ssh.zeaz.dev`.

### 2. Connector replicas are valid under one tunnel

The Cloudflare Tunnel model allows multiple `cloudflared` connector processes under the same tunnel UUID. This supports local HA without creating separate tunnel identities for every process.

Repo impact:

- Future HA scripts should scale connector replicas under one tunnel UUID.
- Do not create duplicate tunnels for simple local failover unless there is a clear topology reason.

### 3. Public apps and private network docs are separate paths

The reviewed Cloudflare One Tunnel page is focused on Zero Trust/private networking use cases. Public web app/API publishing through Tunnel is linked as a separate documentation path.

Repo impact:

- `zeaz-platform` should keep two categories in docs and code:
  - Public hostname ingress: `panel.zeaz.dev`, `api.zeaz.dev`, `grafana.zeaz.dev`, `n8n.zeaz.dev`
  - Private access: SSH and internal services through Access/Tunnel

### 4. Cloudflare API reference has grown into a broad live inventory

The API reference currently exposes broad endpoint categories that matter for this repo, including:

- Accounts and account tokens
- User tokens
- Zero Trust
- Zero Trust Tunnels / cloudflared
- DNS records
- IAM permission groups
- AI Gateway
- Workers Builds
- Token Validation

Repo impact:

- Token rotation should move away from embedded permission group IDs.
- Add API discovery for IAM permission groups before token creation.
- Keep token verification before destructive or regenerative token operations.
- Keep the Free/no-cost `COST_LOCK=true` policy in front of Workers/R2/WAF/Logpush/Load Balancing actions.

## Required repo rules after this review

### Environment variable standard

The active project standard is now:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_ZONE_ID
CLOUDFLARE_BOOTSTRAP_TOKEN
CLOUDFLARE_API_TOKEN
CLOUDFLARE_DNS_TOKEN
CLOUDFLARE_ZT_TOKEN
CLOUDFLARE_WORKERS_TOKEN
CLOUDFLARE_WAF_TOKEN
CLOUDFLARE_TUNNEL_TOKEN
CLOUDFLARE_R2_TOKEN
CLOUDFLARE_AUDIT_TOKEN
CLOUDFLARE_AI_GATEWAY_TOKEN
CLOUDFLARE_AI_GATEWAY_SLUG
```

Legacy `CF_*` names should not appear in active tracked source files. Use:

```bash
make check-no-cf-vars
```

### Token rotation rule

Before token list, cleanup, or regeneration:

1. Load `.env`.
2. Load `.env.cloudflare` only after `.env` if generated token file overrides are intentional.
3. Verify `CLOUDFLARE_BOOTSTRAP_TOKEN` with Cloudflare token verify endpoint.
4. Confirm `CLOUDFLARE_ZONE_ID` before DNS token generation.
5. Run dry-run first.

Recommended sequence:

```bash
make token-verify
make token-rotate-dry
make token-rotate
```

### Tunnel rule

Use outbound-only tunnel exposure and keep the origin locked down:

```text
origin VM -> cloudflared outbound -> Cloudflare global network -> Access/DNS/proxy -> user
```

Do not expose direct public inbound access to the VM for web/API/SSH services.

## Next recommended implementation patch

Add a token permission discovery workflow:

```text
scripts/cloudflare/discover-permission-groups.sh
```

Minimum behavior:

- use `CLOUDFLARE_BOOTSTRAP_TOKEN`
- call Cloudflare IAM permission groups endpoints
- map permission names to IDs dynamically
- write a local cache under `.cache/cloudflare-permissions/`
- never commit the cache
- allow `--refresh`
- allow `--json`
- integrate with token regeneration before using permission group IDs

## Local validation commands

```bash
git pull
make
make validate
make token-verify
make docs-context
make upgrade-report
```

Strict deployment validation still requires real secrets and IDs:

```bash
make validate-env-strict
```
