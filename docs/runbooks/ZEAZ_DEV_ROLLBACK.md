# ZEAZ_DEV_ROLLBACK

## Summary

Rollback for Phase 52 returns `zeaz.dev` routing to the previous safe state.

## Rollback steps

1. Disable the affected route.
2. Restore the previous DNS target.
3. Lock the Access policy to private-admin-only.
4. Verify `ssh.zeaz.dev` remains unchanged.

## Guardrails

- Rollback is plan-only unless `APPLY=true` and `CONFIRM_ROLLBACK=yes`.
- No destructive deletes by default.
- No paid Cloudflare features.

