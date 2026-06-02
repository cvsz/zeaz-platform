# zDash Monorepo Operations

## Local Dev

```bash
make zdash-server-start
```

Starts backend (uvicorn on port 8005) + frontend (vite dev on port 5173) concurrently.

## Validation

```bash
make zdash-validate-fast
```

Runs safety scan + lint (backend ruff + frontend) + backend tests + frontend tests + build.

## Backend Tests

```bash
make zdash-backend-test
```

Delegates to `pytest -q` in `apps/zdash/backend/`.

## Frontend Tests

```bash
make zdash-frontend-test
```

Delegates to `npm test` in `apps/zdash/frontend/`.

## Build

```bash
make zdash-build
```

Builds frontend production bundle.

## Release Evidence

```bash
make zdash-release-evidence
```

Generates structured evidence output to `docs/reports/generated/`.

## Sync from Upstream

```bash
bash scripts/zdash/sync-zdash-subtree.sh
```

Pulls latest zDash changes from the source repo into `apps/zdash/`. Working tree must be clean.

## Verify Import

```bash
bash scripts/zdash/verify-zdash-monorepo.sh
```

Structural integrity check for the monorepo import. Verifies directories, files, no nested `.git`, no tracked `.env`.

## Monorepo Evidence

```bash
bash scripts/zdash/capture-zdash-monorepo-evidence.sh
```

Generates timestamped evidence report to `docs/reports/generated/zdash-monorepo-evidence.md`.

## Phase 48 Validation

```bash
make zdash-phase48-validate
```

Runs Phase 48 validation chain (P0-P2 completion checks via apps/zdash Makefile).

## Cloudflare Handoff

```bash
make zdash-cloudflare-handoff
```

Validates Cloudflare route configs match expected structure (dry-run only).

## Server Management

```bash
make zdash-server-start    # Start dev servers
make zdash-server-stop     # Stop dev servers
make zdash-server-restart  # Restart dev servers
make zdash-server-status   # Show server status
```
