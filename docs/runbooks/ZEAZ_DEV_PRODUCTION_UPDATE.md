# ZEAZ_DEV_PRODUCTION_UPDATE

## Summary

Phase 52 prepares `zeaz.dev` production routing for the integrated zDash app while keeping apply operations dry-run by default.

## Preflight

- Verify `COST_LOCK=true`.
- Verify `CLOUDFLARE_PLAN_TIER=Free`.
- Verify `ALLOW_PAID_CLOUDFLARE_FEATURES=false`.
- Confirm `ssh.zeaz.dev` remains unchanged.
- Review the route intent and Access policy templates.

## Dry-run plan

Run:

```bash
make zeaz-dev-plan
make zeaz-dev-public-evidence
make phase52-validate
```

## Apply confirmations

Live changes require all of the following:

- `APPLY=true`
- `CONFIRM_DNS_APPLY=yes`
- `CONFIRM_TUNNEL_APPLY=yes`
- `CONFIRM_ACCESS_APPLY=yes`

## Validation

- Confirm public URLs after any live apply.
- Confirm the fallback 404 ingress remains in place.
- Confirm no paid Cloudflare features were enabled.

## Evidence capture

- Save the generated live verification report.
- Preserve the route intent and rollback plan as operator evidence.

## Rollback

- Use the rollback plan script.
- Disable the route.
- Restore the previous DNS target.
- Re-lock the Access policy to private-admin-only.

## Post-deploy monitoring

- Monitor public HTTP status codes.
- Confirm the tunnel ingress still resolves.
- Confirm `ssh.zeaz.dev` still functions.

## No-cost guardrails

- No Load Balancing.
- No Argo.
- No paid WAF.
- No Bot Management.
- No Logpush.
- No Workers deploy.
- No R2 writes.

