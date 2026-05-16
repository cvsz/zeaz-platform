#!/usr/bin/env bash
set -Eeuo pipefail

echo "🚀 Finalizing repo (clean commit + push)..."

# -----------------------------------------------------------------------------
# Ensure .gitignore is clean
# -----------------------------------------------------------------------------
echo "🧹 Updating .gitignore..."

cat >> .gitignore <<'GITIGNORE'

# Terraform
.terraform/
*.tfstate*
*.tfplan

# Backups
.backup-refactor-*
*.bak.*

# Env / secrets
.env
.env.*
.env.cloudflare

# Node
node_modules/

# Misc
.DS_Store
GITIGNORE

# -----------------------------------------------------------------------------
# Remove unwanted staged files if any
# -----------------------------------------------------------------------------
echo "🧹 Cleaning unwanted files..."

git restore --staged .backup-refactor-* 2>/dev/null || true

# -----------------------------------------------------------------------------
# Stage only required files
# -----------------------------------------------------------------------------
echo "📦 Staging files..."

git add \
  scripts/ \
  terraform/ \
  .github/workflows/ \
  wrangler.toml \
  .gitignore

# -----------------------------------------------------------------------------
# Show status
# -----------------------------------------------------------------------------
echo
echo "📊 Git status:"
git status --short

# -----------------------------------------------------------------------------
# Commit
# -----------------------------------------------------------------------------
echo
echo "📝 Creating commit..."

git commit -m "feat(terraform): zero-global-key architecture + multi-env + CI/CD pipeline" || {
  echo "⚠️ Nothing to commit (already up to date)"
}

# -----------------------------------------------------------------------------
# Push
# -----------------------------------------------------------------------------
echo
echo "🚀 Pushing to remote..."

# detect branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

git push origin "$BRANCH"

echo
echo "✅ DONE"
echo
echo "Next:"
echo "👉 Check GitHub Actions"
echo "   gh run list"
echo
