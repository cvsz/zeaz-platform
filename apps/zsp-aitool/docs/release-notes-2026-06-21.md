# Release Notes - 2026-06-21

## Scope

Stable release candidate hardening for `zsp-aitool`.

## Changes

- Removed the app-local `package-lock.json` to align the nested app with the current workspace install flow.
- Updated operational docs and HyperFrames scripts to use `npm install` instead of `npm ci` in this nested app.
- Normalized `next.config.ts` for the current workspace layout and kept Turbopack/dev settings explicit.
- Hardened the HyperFrames signed download-token expiry test so it no longer depends on real-time delays.
- Cleaned the HyperFrames remediation runbook into a single deterministic operator guide.

## Verification Results

- `npm run build` → pass
- `npm run test` → pass (`110` files, `355` tests)

## Notes

- The remaining Next.js workspace-root warning is emitted from the parent workspace lockfile path outside `apps/zsp-aitool`.
- No app-local production blockers remain in this release scope.
