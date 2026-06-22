#!/usr/bin/env bash
# ============================================================================
#  validate-env.sh — Validate environment variables and config files
#  Usage: bash scripts/validate-env.sh
# ============================================================================
set -euo pipefail

BOLD="\033[1m"
GREEN="\033[32m"
YELL="\033[33m"
RED="\033[31f"
DIM="\033[2m"
RESET="\033[0m"

ERRORS=0
WARNINGS=0

printf "${BOLD}zLM-CLI Environment Validator${RESET}\n"
printf "${DIM}──────────────────────────────────${RESET}\n\n"

# --- .env file ---
printf "${BOLD}.env file${RESET}\n"
if [ -f .env ]; then
  printf "  ${GREEN}✓${RESET} .env exists\n"
  if grep -q "DATABASE_URL" .env 2>/dev/null; then
    printf "  ${GREEN}✓${RESET} DATABASE_URL is set\n"
  else
    printf "  ${RED}✗${RESET} DATABASE_URL is missing\n"
    ERRORS=$((ERRORS + 1))
  fi
else
  printf "  ${RED}✗${RESET} .env file not found\n"
  ERRORS=$((ERRORS + 1))
fi

# --- .z-ai-config ---
printf "\n${BOLD}z.ai SDK config${RESET}\n"
FOUND_ZAI=false
for cfg in .z-ai-config "$HOME/.z-ai-config" /etc/.z-ai-config; do
  if [ -f "$cfg" ]; then
    printf "  ${GREEN}✓${RESET} Found: %s\n" "$cfg"
    if grep -q "baseUrl" "$cfg" 2>/dev/null && grep -q "apiKey" "$cfg" 2>/dev/null; then
      printf "  ${GREEN}✓${RESET} baseUrl + apiKey present\n"
    else
      printf "  ${RED}✗${RESET} Missing baseUrl or apiKey\n"
      ERRORS=$((ERRORS + 1))
    fi
    FOUND_ZAI=true
    break
  fi
done
if [ "$FOUND_ZAI" = "false" ]; then
  printf "  ${RED}✗${RESET} No .z-ai-config found\n"
  ERRORS=$((ERRORS + 1))
fi

# --- package.json ---
printf "\n${BOLD}package.json${RESET}\n"
if [ -f package.json ]; then
  printf "  ${GREEN}✓${RESET} package.json exists\n"
  name=$(grep -oP '"name"\s*:\s*"\K[^"]+' package.json 2>/dev/null || echo "unknown")
  ver=$(grep -oP '"version"\s*:\s*"\K[^"]+' package.json 2>/dev/null || echo "unknown")
  printf "  ${DIM}  name: %s | version: %s${RESET}\n" "$name" "$ver"
else
  printf "  ${RED}✗${RESET} package.json not found\n"
  ERRORS=$((ERRORS + 1))
fi

# --- node_modules ---
printf "\n${BOLD}Dependencies${RESET}\n"
if [ -d node_modules ]; then
  printf "  ${GREEN}✓${RESET} node_modules exists\n"
  if [ -d node_modules/z-ai-web-dev-sdk ]; then
    printf "  ${GREEN}✓${RESET} z-ai-web-dev-sdk installed\n"
  else
    printf "  ${RED}✗${RESET} z-ai-web-dev-sdk missing — run: bun install\n"
    ERRORS=$((ERRORS + 1))
  fi
  if [ -d node_modules/@prisma/client ]; then
    printf "  ${GREEN}✓${RESET} @prisma/client installed\n"
  else
    printf "  ${RED}✗${RESET} @prisma/client missing — run: bun install\n"
    ERRORS=$((ERRORS + 1))
  fi
else
  printf "  ${RED}✗${RESET} node_modules not found — run: bun install\n"
  ERRORS=$((ERRORS + 1))
fi

# --- Database ---
printf "\n${BOLD}Database${RESET}\n"
if [ -f db/custom.db ]; then
  printf "  ${GREEN}✓${RESET} db/custom.db exists\n"
else
  printf "  ${YELL}!${RESET} db/custom.db not found — run: make db-push\n"
  WARNINGS=$((WARNINGS + 1))
fi

if [ -d node_modules/.prisma/client ]; then
  printf "  ${GREEN}✓${RESET} Prisma client generated\n"
else
  printf "  ${YELL}!${RESET} Prisma client not generated — run: bun run db:generate\n"
  WARNINGS=$((WARNINGS + 1))
fi

# --- .dev directory ---
printf "\n${BOLD}Runtime state${RESET}\n"
if [ -d .dev ]; then
  printf "  ${GREEN}✓${RESET} .dev/ directory exists\n"
  if [ -f .dev/settings.json ]; then
    printf "  ${GREEN}✓${RESET} settings.json exists\n"
  fi
  if [ -f .dev/key-config.json ]; then
    printf "  ${GREEN}✓${RESET} key-config.json exists\n"
  fi
else
  printf "  ${DIM}  .dev/ not created yet (created on first start)${RESET}\n"
fi

# --- Summary ---
printf "\n${DIM}──────────────────────────────────${RESET}\n"
if [ "$ERRORS" -eq 0 ]; then
  printf "${GREEN}✓ Environment valid${RESET}"
else
  printf "${RED}✗ %d error(s)${RESET}" "$ERRORS"
fi
if [ "$WARNINGS" -gt 0 ]; then
  printf " ${YELL}| %d warning(s)${RESET}" "$WARNINGS"
fi
printf "\n"

exit $ERRORS
