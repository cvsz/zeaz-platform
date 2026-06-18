#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# Guarded local change publisher.
# This script reviews local changes, blocks sensitive paths/content, stages only
# allowed changes, then commits and pushes through the repo Makefile workflow.
# It never force pushes and never runs git add . directly.

SCRIPT_NAME="$(basename "$0")"
REMOTE="${GIT_REMOTE:-origin}"
BRANCH=""
COMMIT_MSG=""
APPLY=false
INCLUDE_UNTRACKED=false
ALLOW_LARGE=false
MAX_FILE_BYTES=$((20 * 1024 * 1024))
REPORT_DIR=""

usage() {
  cat <<'USAGE'
Usage:
  scripts/git/review-and-publish-local-changes.sh --message "commit message" [options]

Default behavior:
  - Dry-run only unless --apply is passed.
  - Reviews tracked changes.
  - Ignores untracked files unless --include-untracked is passed.
  - Blocks sensitive paths and files.
  - Blocks private-key blocks and likely credential assignments.
  - Blocks files larger than 20 MiB unless --allow-large is passed.
  - Stages explicit safe file paths only; never runs git add .
  - Commits using make gpg-finalize when available.
  - Pushes using make gpg-push when available.
  - Never force-pushes.

Options:
  --apply                 Execute staging, commit, and push. Without this, dry-run only.
  --message TEXT          Commit message. Required with --apply.
  --branch NAME           Branch to publish. Default: current branch.
  --remote NAME           Remote name. Default: origin or $GIT_REMOTE.
  --include-untracked     Include untracked files after scanning.
  --allow-large           Do not block files larger than 20 MiB.
  --report-dir PATH       Write scan reports to a specific directory.
  -h, --help              Show help.

Examples:
  # Preview tracked changes only
  scripts/git/review-and-publish-local-changes.sh --message "chore: publish reviewed local changes"

  # Publish tracked changes only
  scripts/git/review-and-publish-local-changes.sh --apply --message "chore: publish reviewed local changes"

  # Include untracked files after full scan
  scripts/git/review-and-publish-local-changes.sh --apply --include-untracked --message "chore: publish reviewed local changes"
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
    --message) COMMIT_MSG="${2:-}"; shift ;;
    --branch) BRANCH="${2:-}"; shift ;;
    --remote) REMOTE="${2:-}"; shift ;;
    --include-untracked) INCLUDE_UNTRACKED=true ;;
    --allow-large) ALLOW_LARGE=true ;;
    --report-dir) REPORT_DIR="${2:-}"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) err "unknown option: $1"; usage; exit 2 ;;
  esac
  shift
done

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  err 'not inside a Git work tree'
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if [[ -z "$BRANCH" ]]; then
  BRANCH="$(git branch --show-current 2>/dev/null || true)"
fi
if [[ -z "$BRANCH" ]]; then
  err 'detached HEAD is not supported. Pass --branch or checkout a branch.'
  exit 1
fi
if [[ -z "$REMOTE" ]]; then
  err 'remote cannot be empty'
  exit 2
fi
if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  err "remote not found: $REMOTE"
  exit 1
fi
if [[ "$APPLY" == "true" && -z "$COMMIT_MSG" ]]; then
  err '--message is required with --apply'
  exit 2
fi

if [[ -z "$REPORT_DIR" ]]; then
  REPORT_DIR=".git/local-change-review-$(date +%Y%m%d-%H%M%S)"
fi
mkdir -p "$REPORT_DIR"

safe_list="$REPORT_DIR/safe-files.txt"
blocked_paths="$REPORT_DIR/blocked-paths.txt"
blocked_content="$REPORT_DIR/blocked-content.txt"
blocked_large="$REPORT_DIR/blocked-large-files.txt"
all_candidates="$REPORT_DIR/all-candidates.txt"
: > "$safe_list"
: > "$blocked_paths"
: > "$blocked_content"
: > "$blocked_large"
: > "$all_candidates"

log "repo: $repo_root"
log "branch: $BRANCH"
log "remote: $REMOTE"
log "apply: $APPLY"
log "include_untracked: $INCLUDE_UNTRACKED"
log "report_dir: $REPORT_DIR"

run git fetch "$REMOTE" "$BRANCH"

upstream=""
if upstream="$(git rev-parse --abbrev-ref --symbolic-full-name "$BRANCH@{upstream}" 2>/dev/null)"; then
  counts="$(git rev-list --left-right --count "$upstream...$BRANCH" 2>/dev/null || true)"
  if [[ -n "$counts" ]]; then
    behind="${counts%%[[:space:]]*}"
    ahead="${counts##*[[:space:]]}"
    log "upstream: $upstream | behind=$behind ahead=$ahead"
    if [[ "$behind" != "0" ]]; then
      err "branch is behind upstream. Pull/rebase first before publishing local changes."
      exit 1
    fi
  fi
else
  warn "branch has no upstream: $BRANCH"
fi

# Reset only the index, not the working tree, so staging starts clean.
run git reset --mixed

# Tracked changed files.
git diff --name-only --diff-filter=ACMRTUXB >> "$all_candidates"
# Staged files may exist before reset in dry-run mode; include for visibility.
git diff --cached --name-only --diff-filter=ACMRTUXB >> "$all_candidates" || true

if [[ "$INCLUDE_UNTRACKED" == "true" ]]; then
  git ls-files --others --exclude-standard >> "$all_candidates"
fi

sort -u "$all_candidates" -o "$all_candidates"

if [[ ! -s "$all_candidates" ]]; then
  log 'no candidate files found'
  exit 0
fi

path_block_regex='(^|/)(\.env($|\.)|\.envrc$|\.npmrc$|\.pypirc$|\.netrc$|\.kube($|/)|\.ssh($|/)|\.gnupg($|/)|\.terraform($|/)|\.wrangler($|/)|secrets($|/)|secret($|/)|credentials?($|/)|creds\.json$|credentials\.json$|token($|/)|tokens($|/)|.*\.tfstate$|.*\.tfvars$|.*\.pem$|.*\.key$|.*\.p12$|.*\.pfx$|id_rsa$|id_ed25519$)'
private_key_regex='(BEGIN [A-Z ]*PRIVATE KEY|-----BEGIN OPENSSH PRIVATE KEY-----)'
credential_assignment_regex='(^|[^A-Za-z0-9_])(AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|GOOGLE_APPLICATION_CREDENTIALS|CLOUDFLARE_API_TOKEN|GITHUB_TOKEN|OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|DATABASE_URL)[[:space:]]*[:=][[:space:]]*["'"'"'\''"'"'"']?[^[:space:]#"'"'"'\''"'"'"'<>$]'
credential_url_regex='(postgres|mysql|redis)://[^[:space:]@/]+:[^[:space:]@/]+@'

while IFS= read -r file; do
  [[ -z "$file" ]] && continue

  if [[ "$file" =~ $path_block_regex ]]; then
    printf '%s\n' "$file" >> "$blocked_paths"
    continue
  fi

  if [[ -f "$file" ]]; then
    size="$(wc -c < "$file" | tr -d ' ')"
    if [[ "$ALLOW_LARGE" != "true" && "$size" -gt "$MAX_FILE_BYTES" ]]; then
      printf '%s\t%s bytes\n' "$file" "$size" >> "$blocked_large"
      continue
    fi

    if LC_ALL=C grep -Il . -- "$file" >/dev/null 2>&1; then
      if LC_ALL=C grep -IqE "$private_key_regex" -- "$file" 2>/dev/null; then
        printf '%s\n' "$file" >> "$blocked_content"
        continue
      fi
      if LC_ALL=C grep -IqE "$credential_assignment_regex" -- "$file" 2>/dev/null; then
        printf '%s\n' "$file" >> "$blocked_content"
        continue
      fi
      if LC_ALL=C grep -IqE "$credential_url_regex" -- "$file" 2>/dev/null; then
        printf '%s\n' "$file" >> "$blocked_content"
        continue
      fi
    fi
  fi

  printf '%s\n' "$file" >> "$safe_list"
done < "$all_candidates"

blocked_total=0
for report in "$blocked_paths" "$blocked_content" "$blocked_large"; do
  if [[ -s "$report" ]]; then
    blocked_total=$((blocked_total + $(wc -l < "$report" | tr -d ' ')))
  fi
done
safe_total=0
if [[ -s "$safe_list" ]]; then
  safe_total="$(wc -l < "$safe_list" | tr -d ' ')"
fi

log "candidate files: $(wc -l < "$all_candidates" | tr -d ' ')"
log "safe files: $safe_total"
log "blocked files: $blocked_total"

if [[ -s "$blocked_paths" ]]; then
  warn "blocked by path: $blocked_paths"
  sed 's/^/  /' "$blocked_paths" >&2
fi
if [[ -s "$blocked_content" ]]; then
  warn "blocked by content pattern: $blocked_content"
  sed 's/^/  /' "$blocked_content" >&2
fi
if [[ -s "$blocked_large" ]]; then
  warn "blocked large files: $blocked_large"
  sed 's/^/  /' "$blocked_large" >&2
fi

if [[ "$blocked_total" -gt 0 ]]; then
  err 'blocked files were found. Nothing will be committed until they are removed, ignored, or handled manually.'
  exit 1
fi

if [[ ! -s "$safe_list" ]]; then
  log 'no safe files to stage'
  exit 0
fi

log 'safe files selected for staging:'
sed 's/^/  /' "$safe_list"

if [[ "$APPLY" == "true" ]]; then
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    git add -- "$file"
  done < "$safe_list"

  if git diff --cached --quiet; then
    log 'nothing staged after safe selection'
    exit 0
  fi

  git diff --cached --name-only > "$REPORT_DIR/staged-files.txt"
  log "staged files report: $REPORT_DIR/staged-files.txt"

  if [[ -f Makefile ]] && grep -q '^gpg-finalize:' Makefile; then
    make gpg-finalize COMMIT_MSG="$COMMIT_MSG"
  else
    git commit -m "$COMMIT_MSG"
    git push --no-verify "$REMOTE" "$BRANCH"
  fi
else
  log 'dry-run complete. Re-run with --apply to stage, commit, and push.'
fi
