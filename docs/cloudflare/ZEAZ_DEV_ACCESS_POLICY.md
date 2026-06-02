# zeaz.dev Access Policy

This document describes the Phase 52 Access posture for `zdash.zeaz.dev`, `zdash-api.zeaz.dev`, and the optional public release evidence route.

## Default mode

- `zdash.zeaz.dev`: private-admin-only rehearsal mode.
- `zdash-api.zeaz.dev`: protected by default.
- `release.zeaz.dev`: public only when explicitly approved.
- `ssh.zeaz.dev`: unchanged by this phase.
- Bypass is disabled by default.

## Required guardrails

- No allow-all Access policy.
- No paid Cloudflare features.
- Use scoped Cloudflare API tokens only.
- Keep `COST_LOCK=true`.
- Keep `CLOUDFLARE_PLAN_TIER=Free`.
- Keep `ALLOW_PAID_CLOUDFLARE_FEATURES=false`.

## Operator intent

Use the example policy file at `configs/cloudflare/access/zeaz-dev-zdash-access-policy.example.json` as the source of truth for dry-run review.

## Optional public frontend mode

If public read is approved later, narrow the policy to a public-read-only posture for the frontend only. The backend must remain protected unless the operator explicitly widens access.

## Rollback requirement

Rollback must:

- disable the affected route,
- restore the previous DNS target,
- lock the Access policy back to the private-admin-only default.

