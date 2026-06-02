#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() {
  cat <<'EOF'
Usage: scripts/zdash/import-zdash-subtree.sh [--from <path-or-url>] [--branch <branch>]
EOF
}

source_repo="${ZDASH_SOURCE_REPO:-https://github.com/cvsz/zdash.git}"
branch="main"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --from)
      shift
      source_repo="${1:-}"
      ;;
    --branch)
      shift
      branch="${1:-}"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift || true
done

trap 'echo "ERROR: subtree import failed at line $LINENO" >&2' ERR

echo "=== zDash Subtree Import ==="
echo "Source: $source_repo"
echo "Target: apps/zdash"
echo "Branch: $branch"
echo ""

if [ -d apps/zdash/.git ]; then
  echo "ERROR: apps/zdash/.git exists; nested repository detected. Aborting." >&2
  exit 1
fi

if ! git diff --quiet --ignore-submodules --; then
  echo "ERROR: working tree has uncommitted changes. Commit or stash first." >&2
  exit 1
fi

if [ ! -d apps/zdash ]; then
  echo "ERROR: apps/zdash missing. Create the target path before importing." >&2
  exit 1
fi

if git remote get-url zdash-source >/dev/null 2>&1; then
  git remote set-url zdash-source "$source_repo"
else
  git remote add zdash-source "$source_repo"
fi

git fetch zdash-source "$branch"

if [ -n "$(git ls-files apps/zdash | head -n 1)" ]; then
  git subtree pull --prefix=apps/zdash --squash zdash-source "$branch"
else
  git subtree add --prefix=apps/zdash --squash zdash-source "$branch"
fi

echo "Import complete."
