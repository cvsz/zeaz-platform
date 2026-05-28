#!/usr/bin/env bash

set -Eeuo pipefail

# =============================================================================
# GitHub Environment Bootstrap From .env
# =============================================================================
#
# PURPOSE:
# - Read .env
# - Create GitHub Environment
# - Upload variables -> GitHub Environment Variables
# - Upload secrets -> GitHub Environment Secrets
#
# REQUIREMENTS:
# - gh auth login
# - repository admin access
#
# USAGE:
#
# chmod +x scripts/bootstrap-gh-env.sh
#
# ./scripts/bootstrap-gh-env.sh \
#   --repo cvsz/zeaz-platform \
#   --env production \
#   --file .env
#
# =============================================================================

# -----------------------------------------------------------------------------
# DEFAULTS
# -----------------------------------------------------------------------------

ENV_FILE=".env"
GH_ENV="production"
REPO=""

# -----------------------------------------------------------------------------
# ARG PARSER
# -----------------------------------------------------------------------------

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)
      REPO="$2"
      shift 2
      ;;
    --env)
      GH_ENV="$2"
      shift 2
      ;;
    --file)
      ENV_FILE="$2"
      shift 2
      ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

# -----------------------------------------------------------------------------
# VALIDATION
# -----------------------------------------------------------------------------

[[ -n "${REPO}" ]] || {
  echo "ERROR: --repo required" >&2
  exit 1
}

[[ -f "${ENV_FILE}" ]] || {
  echo "ERROR: env file missing: ${ENV_FILE}" >&2
  exit 1
}

command -v gh >/dev/null 2>&1 || {
  echo "ERROR: gh CLI missing" >&2
  exit 1
}

gh auth status >/dev/null 2>&1 || {
  echo "ERROR: gh auth login required" >&2
  exit 1
}

# -----------------------------------------------------------------------------
# CREATE ENVIRONMENT
# -----------------------------------------------------------------------------

echo
echo "==> Creating GitHub environment: ${GH_ENV}"

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}/environments/${GH_ENV}" \
  >/dev/null

# -----------------------------------------------------------------------------
# SECRET KEY MAP
# -----------------------------------------------------------------------------
# Everything else becomes GitHub Variables automatically.
# -----------------------------------------------------------------------------

declare -A SECRET_KEYS=(
  ["CLOUDFLARE_ACCOUNT_ID"]=1
  ["CLOUDFLARE_ZONE_ID"]=1
  ["CLOUDFLARE_BOOTSTRAP_TOKEN"]=1
  ["CLOUDFLARE_API_TOKEN"]=1
  ["CLOUDFLARE_DNS_TOKEN"]=1
  ["CLOUDFLARE_ZT_TOKEN"]=1
  ["CLOUDFLARE_WORKERS_TOKEN"]=1
  ["CLOUDFLARE_PAGES_TOKEN"]=1
  ["CLOUDFLARE_WAF_TOKEN"]=1
  ["CLOUDFLARE_TUNNEL_TOKEN"]=1
  ["CLOUDFLARE_R2_TOKEN"]=1
  ["CLOUDFLARE_D1_TOKEN"]=1
)

# -----------------------------------------------------------------------------
# LOAD ENV
# -----------------------------------------------------------------------------

echo
echo "==> Processing ${ENV_FILE}"

while IFS='=' read -r raw_key raw_value; do
  # ---------------------------------------------------------------------------
  # Skip comments / empty
  # ---------------------------------------------------------------------------

  [[ -n "${raw_key// }" ]] || continue
  [[ "${raw_key}" =~ ^# ]] && continue

  # ---------------------------------------------------------------------------
  # Normalize
  # ---------------------------------------------------------------------------

  key="$(echo "${raw_key}" | xargs)"
  value="$(echo "${raw_value:-}" | sed 's/^ *//;s/ *$//')"

  # Remove optional surrounding quotes
  value="${value%\"}"
  value="${value#\"}"

  echo
  echo "==> Processing: ${key}"

  # ---------------------------------------------------------------------------
  # Secrets
  # ---------------------------------------------------------------------------

  if [[ -n "${SECRET_KEYS[$key]:-}" ]]; then
    gh secret set "${key}" \
      --env "${GH_ENV}" \
      --repo "${REPO}" \
      --body "${value}"

    echo "   type: secret"

  # ---------------------------------------------------------------------------
  # Variables
  # ---------------------------------------------------------------------------

  else
    gh variable set "${key}" \
      --env "${GH_ENV}" \
      --repo "${REPO}" \
      --body "${value}"

    echo "   type: variable"
  fi

done < "${ENV_FILE}"

# -----------------------------------------------------------------------------
# VERIFY
# -----------------------------------------------------------------------------

echo
echo "=================================================================="
echo "Environment Variables"
echo "=================================================================="

gh variable list \
  --env "${GH_ENV}" \
  --repo "${REPO}"

echo
echo "=================================================================="
echo "Environment Secrets"
echo "=================================================================="

gh secret list \
  --env "${GH_ENV}" \
  --repo "${REPO}"

echo
echo "=================================================================="
echo "Bootstrap completed successfully"
echo "=================================================================="
