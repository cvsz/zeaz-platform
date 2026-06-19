#!/usr/bin/env bash
set -Eeuo pipefail

REPO="/home/zeazdev/zeaz-platform"
BRANCH="${BRANCH:-main}"
REMOTE="${REMOTE:-origin}"
COMMIT_MSG="${COMMIT_MSG:-feat(factory): implement local-first zai factory}"
APPLY="${APPLY:-0}"
PUSH="${PUSH:-0}"

cd "$REPO"

say() {
  printf '\n== %s ==\n' "$*"
}

die() {
  echo "ERROR: $*" >&2
  exit 1
}

run() {
  echo "+ $*"
  "$@"
}

require_clean_forbidden_staged() {
  local bad
  bad="$(git diff --cached --name-only | grep -E '(^apps/zlms/|node_modules|/dist/|vendor/ai-assets|reports/|zai-factory-skills-registry\.json|ai-assets-duplicates-clean-report)' || true)"
  if [[ -n "$bad" ]]; then
    echo "$bad"
    die "forbidden files are staged"
  fi
}

require_no_secret_paths_staged() {
  local bad
  bad="$(
    git diff --cached --name-only |
      grep -E '^(apps/zai-factory/|scripts/zaictl.sh|pnpm-workspace.yaml|pnpm-lock.yaml)' |
      xargs -r grep -InE '/home/zeazdev|GEMINI_API_KEY[[:space:]]*=|GOOGLE_API_KEY[[:space:]]*=|SECRET[[:space:]]*=|PASSWORD[[:space:]]*=|PRIVATE KEY' 2>/dev/null || true
  )"

  if [[ -n "$bad" ]]; then
    echo "$bad"
    die "staged files contain local absolute paths or secret-like text"
  fi
}

say "ZAI Factory one-click GPG finalize"
echo "repo:       $REPO"
echo "branch:     $BRANCH"
echo "remote:     $REMOTE"
echo "apply:      $APPLY"
echo "push:       $PUSH"
echo "commit msg: $COMMIT_MSG"

current_branch="$(git branch --show-current)"
[[ "$current_branch" == "$BRANCH" ]] || die "current branch is '$current_branch', expected '$BRANCH'"

say "Unstage everything first"
git restore --staged . 2>/dev/null || git reset

say "Ensure zai-factory .gitignore"
cat > apps/zai-factory/.gitignore <<'GITIGNORE'
# Local generated AI asset registries/reports
data/zai-factory-skills-registry.json
data/ai-assets-duplicates-clean-report-*.json
reports/

# Local vendored/symlinked AI assets
vendor/ai-assets/

# Runtime/build/cache
logs/*.log
dist/
node_modules/
GITIGNORE

say "Remove untracked/generated zai-factory outputs only"
rm -rf \
  apps/zai-factory/reports \
  apps/zai-factory/vendor/ai-assets \
  apps/zai-factory/node_modules

if [[ -d apps/zai-factory/dist ]]; then
  if [[ -z "$(git ls-files -- apps/zai-factory/dist)" ]]; then
    rm -rf apps/zai-factory/dist
  else
    echo "SKIP removing tracked apps/zai-factory/dist"
  fi
fi

rm -f apps/zai-factory/data/ai-assets-duplicates-clean-report-*.json

say "Final local validation"
run pnpm --filter @zeaz/zai-factory run validate
run pnpm --filter @zeaz/zai-factory run build
run git diff --check

say "Stage explicit allowed files only"
git add \
  pnpm-workspace.yaml \
  pnpm-lock.yaml \
  apps/zai-factory/.gitignore \
  apps/zai-factory/package.json \
  apps/zai-factory/bin/zai-factory.js \
  apps/zai-factory/server.mjs \
  apps/zai-factory/src \
  apps/zai-factory/public \
  apps/zai-factory/data/apps-registry.json \
  apps/zai-factory/data/agents-registry.json \
  apps/zai-factory/data/skills-registry.json \
  apps/zai-factory/data/plugins-registry.json \
  apps/zai-factory/data/extensions-registry.json \
  apps/zai-factory/data/prompts-registry.json \
  apps/zai-factory/data/workflows-registry.json \
  apps/zai-factory/data/jobs.json \
  apps/zai-factory/scripts \
  apps/zai-factory/docs \
  scripts/zaictl.sh

say "Staged files"
git diff --cached --name-only | sed -n '1,240p'

say "Forbidden staged check"
require_clean_forbidden_staged
echo "OK: no forbidden staged files"

say "Secret/path staged check"
require_no_secret_paths_staged
echo "OK: no obvious local path or secret-like staged text"

say "Staged stat"
git diff --cached --stat

if git diff --cached --quiet; then
  die "nothing staged to commit"
fi

if [[ "$APPLY" != "1" ]]; then
  say "DRY RUN complete"
  echo "No commit/pull/finalize/push executed."
  echo ""
  echo "Run apply:"
  echo "  APPLY=1 PUSH=1 bash scripts/omega/oneclick-zai-factory-gpg-finalize.sh"
  exit 0
fi

say "GPG signed commit"
export GPG_TTY="${GPG_TTY:-$(tty)}"
git commit -S -m "$COMMIT_MSG"

say "Pull rebase autostash"
git pull --rebase --autostash "$REMOTE" "$BRANCH"

say "Run gpg-finalize if available"
if grep -q '^gpg-finalize:' Makefile; then
  make gpg-finalize
else
  echo "No gpg-finalize target found; skipping"
fi

say "Final validation after rebase/finalize"
pnpm --filter @zeaz/zai-factory run validate
pnpm --filter @zeaz/zai-factory run build
git diff --check

if [[ "$PUSH" == "1" ]]; then
  say "Push"
  git push "$REMOTE" "$BRANCH"
else
  say "Push skipped"
  echo "Run:"
  echo "  git push $REMOTE $BRANCH"
fi

say "Final status"
git status -sb
git log --show-signature -1 --stat
