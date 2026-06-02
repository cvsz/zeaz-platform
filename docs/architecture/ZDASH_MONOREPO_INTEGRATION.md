# zDash Monorepo Integration

## Overview

zDash (from `cvsz/zdash`) is integrated into this repository via **git subtree --squash** under `apps/zdash/`. The zeaz-platform remains the Cloudflare operator / infrastructure control plane; zDash is a sub-application within the monorepo.

## Deployment Responsibility Split

| Layer | Responsibility | Location |
|-------|---------------|----------|
| Cloudflare DNS, Tunnel, Access, Terraform | zeaz-platform (root) | `configs/cloudflare/zdash/`, `terraform/`, `opentofu/` |
| Cost controls, release orchestration | zeaz-platform (root) | `Makefile`, `scripts/`, `.github/workflows/` |
| zDash application code, backend, frontend, tests | apps/zdash subtree | `apps/zdash/` |
| zDash-specific Cloudflare config (routes, DNS intent, Access policies) | zeaz-platform operator configs | `configs/cloudflare/zdash/` |

## Why Subtree (Not Submodule)

- **History preservation**: subtree inlines the source history under `--squash` — no nested `.git` to manage.
- **Simpler CI**: no submodule init/update steps; all code is present after a standard clone.
- **Single commit to sync**: `git subtree pull --prefix=apps/zdash --squash` brings upstream changes.
- **Rollback is a git revert**: no detached submodule pointers to reconcile.
- **Submodule overhead**: submodules add management overhead; subtree preserves history inline.

## Local Dev Commands

```bash
make zdash-server-start    # Start backend + frontend concurrently
make zdash-validate-fast   # Run safety scan + lint + tests + build
make phase51-validate      # Full Phase 51 validation chain
```

## CI Commands

```bash
make phase51-validate      # CI gate — structural checks + validation
make zdash-validate-fast   # zDash-specific validation (delegates to apps/zdash/Makefile)
```

## Cloudflare Route Ownership

Cloudflare routes for zDash are managed from `configs/cloudflare/zdash/`:

| File | Purpose |
|------|---------|
| `zdash.edge.routes.example.json` | Edge route config (dry-run only, cost-locked) |
| `zdash-dns-intent.example.json` | DNS intent manifest (dry-run unless confirmed) |
| `zdash-access-policy.example.json` | Access policy template (identity-bound) |

## Rollback Plan

```bash
git revert HEAD~2..HEAD    # Reverts import + temp removal commits
```

Keep the original `cvsz/zdash` repo available until CI is stable.

## Syncing Future zDash Changes

```bash
bash scripts/zdash/sync-zdash-subtree.sh [--from <path-or-url>] [--branch <branch>]
```

This fetches from the upstream zDash repo and pulls changes into `apps/zdash/` via `git subtree pull --squash`. The working tree must be clean before syncing.
