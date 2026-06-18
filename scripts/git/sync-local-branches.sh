#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# Safe local branch sync helper.
# Defaults to dry-run. Pass --apply to execute.
# No force push. No reset. No clean. No automatic conflict resolution.

SCRIPT_NAME="$(basename "$0")"
REMOTE="${GIT_REMOTE:-origin}"
MODE="all"
DO_PULL=true
DO_PUSH=true
APPLY=false
PUSH_NEW=false
PRUNE=false
INCLUDE_PROTECTED=false

PROTECTED_BRANCH_REGEX='^(main|master|develop|release/.+|production|prod)$'

usage() {
  cat <<'USAGE'
Usage:
  scripts/git/sync-local-branches.sh [options]

Purpose:
  Safely pull and push local Git branches against a remote.

Default behavior:
  - Dry-run only. Nothing changes unless --apply is provided.
  - Scans all local branches.
  - Fetches remote first.
  - Fast-forward pulls tracked branches only when safe.
  - Pushes tracked branches only when local is ahead and not behind.
  - Skips diverged branches.
  - Skips branches without upstream unless --push-new is provided.
  - Skips protected branches unless --include-protected is provided.

Options:
  --apply                 Execute commands. Without this, script is dry-run.
  --remote NAME           Remote name. Default: origin or $GIT_REMOTE.
  --current-only          Sync only the current branch.
  --tracked-only          Sync only local branches that already have upstream.
  --all-local             Sync all local branches. This is the default scan mode.
  --pull-only             Only fast-forward pull.
  --push-only             Only push safe ahead branches.
  --push-new              Push local branches without upstream using git push -u.
  --include-protected     Include main/master/develop/release/prod branches.
  --prune                 Use git fetch --prune.
  -h, --help              Show help.

Examples:
  # Preview everything
  scripts/git/sync-local-branches.sh

  # Pull + push all safe local branches
  scripts/git/sync-local-branches.sh --apply --all-local

  # Push all local branches that are safe, including new branches
  scripts/git/sync-local-branches.sh --apply --push-only --push-new

  # Sync only current branch
  scripts/git/sync-local-branches.sh --apply --current-only
USAGE
}

log() { printf '[%s] %s\n' "$SCRIPT_NAME" "$*"; }
warn() { printf '[%s] WARN: %s\n' "$SCRIPT_NAME" "$*" >&2; }
err() { printf '[%s] ERROR: %s\n' "$SCRIPT_NAME" "$*" >&2; }

quote_cmd() {
  local out=()
  local arg
  for arg in "$@"; do
    out+=("$(printf '%q' "$arg")")
  done
  printf '%s' "${out[*]}"
}

run() {
  if [[ "$APPLY" == "true" ]]; then
    log "RUN: $(quote_cmd "$@")"
    "$@"
  else
    log "DRY-RUN: $(quote_cmd "$@")"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply) APPLY=true ;;
    --remote) REMOTE="${2:-}"; shift ;;
    --current-only) MODE="current" ;;
    --tracked-only) MODE="tracked" ;;
    --all-local) MODE="all" ;;
    --pull-only) DO_PULL=true; DO_PUSH=false ;;
    --push-only) DO_PULL=false; DO_PUSH=true ;;
    --push-new) PUSH_NEW=true ;;
    --include-protected) INCLUDE_PROTECTED=true ;;
    --prune) PRUNE=true ;;
    -h|--help) usage; exit 0 ;;
    *) err "unknown option: $1"; usage; exit 2 ;;
  esac
  shift
done

if [[ -z "$REMOTE" ]]; then
  err 'remote cannot be empty'
  exit 2
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  err 'not inside a Git work tree'
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  err "remote not found: $REMOTE"
  exit 1
fi

if ! git diff --quiet --ignore-submodules --; then
  err 'working tree has unstaged changes. Commit/stash first.'
  git status --short
  exit 1
fi

if ! git diff --cached --quiet --ignore-submodules --; then
  err 'index has staged changes. Commit/unstage first.'
  git status --short
  exit 1
fi

if [[ -n "$(git status --porcelain --untracked-files=normal)" ]]; then
  err 'working tree is not clean, including untracked files. Commit/stash/remove first.'
  git status --short
  exit 1
fi

current_branch="$(git branch --show-current 2>/dev/null || true)"
if [[ -z "$current_branch" ]]; then
  err 'detached HEAD is not supported'
  exit 1
fi

restore_branch() {
  local active
  active="$(git branch --show-current 2>/dev/null || true)"
  if [[ -n "$current_branch" && "$active" != "$current_branch" ]]; then
    git checkout --quiet "$current_branch" >/dev/null 2>&1 || true
  fi
}
trap restore_branch EXIT

if [[ "$PRUNE" == "true" ]]; then
  run git fetch --prune "$REMOTE"
else
  run git fetch "$REMOTE"
fi

mapfile -t branches < <(git for-each-ref --format='%(refname:short)' refs/heads | sort)

if [[ "$MODE" == "current" ]]; then
  branches=("$current_branch")
elif [[ "$MODE" == "tracked" ]]; then
  filtered=()
  for branch in "${branches[@]}"; do
    if git rev-parse --abbrev-ref --symbolic-full-name "$branch@{upstream}" >/dev/null 2>&1; then
      filtered+=("$branch")
    fi
  done
  branches=("${filtered[@]}")
fi

if [[ ${#branches[@]} -eq 0 ]]; then
  warn 'no branches matched the selected mode'
  exit 0
fi

log "repo: $repo_root"
log "remote: $REMOTE"
log "mode: $MODE"
log "apply: $APPLY"
log "branches: ${#branches[@]}"

merged_count=0
pulled_count=0
pushed_count=0
skipped_count=0

for branch in "${branches[@]}"; do
  log "--- branch: $branch"

  if [[ "$INCLUDE_PROTECTED" != "true" && "$branch" =~ $PROTECTED_BRANCH_REGEX ]]; then
    warn "skip protected branch: $branch"
    ((skipped_count+=1))
    continue
  fi

  upstream=""
  if upstream="$(git rev-parse --abbrev-ref --symbolic-full-name "$branch@{upstream}" 2>/dev/null)"; then
    :
  else
    upstream=""
  fi

  if [[ -z "$upstream" ]]; then
    warn "branch has no upstream: $branch"
    if [[ "$DO_PUSH" == "true" && "$PUSH_NEW" == "true" ]]; then
      run git checkout --quiet "$branch"
      run git push --no-verify -u "$REMOTE" "$branch"
      ((pushed_count+=1))
    else
      ((skipped_count+=1))
    fi
    continue
  fi

  if [[ "$upstream" != "$REMOTE/"* ]]; then
    warn "upstream is not on selected remote ($REMOTE): $branch -> $upstream"
  fi

  counts="$(git rev-list --left-right --count "$upstream...$branch" 2>/dev/null || true)"
  if [[ -z "$counts" ]]; then
    warn "cannot compare branch with upstream: $branch -> $upstream"
    ((skipped_count+=1))
    continue
  fi

  behind="${counts%%[[:space:]]*}"
  ahead="${counts##*[[:space:]]}"
  log "upstream: $upstream | behind=$behind ahead=$ahead"

  if [[ "$behind" != "0" && "$ahead" != "0" ]]; then
    warn "skip diverged branch; resolve manually: $branch"
    ((skipped_count+=1))
    continue
  fi

  if [[ "$DO_PULL" == "true" && "$behind" != "0" ]]; then
    run git checkout --quiet "$branch"
    run git merge --ff-only "$upstream"
    ((pulled_count+=1))
    ((merged_count+=1))
  fi

  if [[ "$DO_PUSH" == "true" && "$ahead" != "0" ]]; then
    run git checkout --quiet "$branch"
    run git push --no-verify "$REMOTE" "$branch"
    ((pushed_count+=1))
  fi

  if [[ "$behind" == "0" && "$ahead" == "0" ]]; then
    log "already in sync: $branch"
  fi
done

log "summary: pulled=$pulled_count pushed=$pushed_count skipped=$skipped_count"
if [[ "$APPLY" != "true" ]]; then
  log 'dry-run complete. Re-run with --apply to execute.'
fi
