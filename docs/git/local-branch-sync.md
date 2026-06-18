# Safe Local Branch Sync

This runbook documents `scripts/git/sync-local-branches.sh`, a conservative helper for syncing local Git branches with a remote.

## Safety Model

The script is intentionally safe by default:

- Dry-run only unless `--apply` is passed.
- No `git reset --hard`.
- No `git clean`.
- No force push.
- No automatic conflict resolution.
- Requires a clean working tree, including untracked files.
- Skips diverged branches.
- Skips branches without upstream unless `--push-new` is passed.
- Skips protected branches such as `main`, `master`, `develop`, `release/*`, `prod`, and `production` unless `--include-protected` is passed.

## Preview All Branches

```bash
cd /home/zeazdev/zeaz-platform
bash scripts/git/sync-local-branches.sh --all-local
```

## Apply Safe Pull + Push for All Local Branches

```bash
cd /home/zeazdev/zeaz-platform
bash scripts/git/sync-local-branches.sh --apply --all-local
```

## Include `main` and Other Protected Branches

```bash
bash scripts/git/sync-local-branches.sh --apply --all-local --include-protected
```

## Push Local Branches Without Upstream

```bash
bash scripts/git/sync-local-branches.sh --apply --all-local --push-new
```

## Push Only

```bash
bash scripts/git/sync-local-branches.sh --apply --push-only --all-local
```

## Pull Only

```bash
bash scripts/git/sync-local-branches.sh --apply --pull-only --all-local
```

## Current Branch Only

```bash
bash scripts/git/sync-local-branches.sh --apply --current-only --include-protected
```

## Recommended Daily Flow

```bash
cd /home/zeazdev/zeaz-platform

git status -sb
bash scripts/git/sync-local-branches.sh --all-local
bash scripts/git/sync-local-branches.sh --apply --all-local --include-protected
```

## Handling Skipped Branches

If a branch is skipped as diverged, resolve it manually:

```bash
git checkout <branch>
git fetch origin
git status -sb
git log --oneline --left-right --graph @{upstream}...HEAD
```

Then choose a normal manual strategy such as rebase or merge. Do not use force push unless you explicitly intend to rewrite the remote branch history.
