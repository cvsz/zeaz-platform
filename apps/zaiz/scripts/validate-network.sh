#!/usr/bin/env bash
# ============================================================================
#  validate-network.sh — Validate network connectivity to required services
#  Usage: bash scripts/validate-network.sh
# ============================================================================
set -euo pipefail

BOLD="\033[1m"
GREEN="\033[32m"
YELL="\033[33m"
RED="\033[31m"
DIM="\033[2m"
RESET="\033[0m"

ERRORS=0

printf "${BOLD}zLM-CLI Network Validator${RESET}\n"
printf "${DIM}──────────────────────────────────${RESET}\n\n"

# --- Check localhost:3000 ---
printf "${BOLD}Local dev server${RESET}\n"
if curl -s --max-time 3 http://localhost:3000/ >/dev/null 2>&1; then
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:3000/)
  printf "  ${GREEN}✓${RESET} localhost:3000 responds (HTTP %s)\n" "$code"
else
  printf "  ${YELL}!${RESET} localhost:3000 not responding — run: make start\n"
fi

# --- Check API endpoints ---
if curl -s --max-time 3 http://localhost:3000/api >/dev/null 2>&1; then
  printf "  ${GREEN}✓${RESET} /api endpoint reachable\n"
fi

# --- Check z.ai API ---
printf "\n${BOLD}z.ai API${RESET}\n"
if curl -s --max-time 5 https://api.z.ai >/dev/null 2>&1; then
  printf "  ${GREEN}✓${RESET} api.z.ai reachable\n"
else
  printf "  ${YELL}!${RESET} api.z.ai not reachable (may be blocked or offline)\n"
fi

# --- Check npm registry ---
printf "\n${BOLD}Package registries${RESET}\n"
if curl -s --max-time 5 https://registry.npmjs.org >/dev/null 2>&1; then
  printf "  ${GREEN}✓${RESET} npm registry reachable\n"
else
  printf "  ${RED}✗${RESET} npm registry not reachable\n"
  ERRORS=$((ERRORS + 1))
fi

# --- Check GitHub ---
printf "\n${BOLD}GitHub${RESET}\n"
if curl -s --max-time 5 https://github.com >/dev/null 2>&1; then
  printf "  ${GREEN}✓${RESET} github.com reachable\n"
else
  printf "  ${YELL}!${RESET} github.com not reachable\n"
fi

# --- DNS resolution ---
printf "\n${BOLD}DNS${RESET}\n"
if command -v dig >/dev/null 2>&1; then
  if dig +short google.com >/dev/null 2>&1; then
    printf "  ${GREEN}✓${RESET} DNS resolution works\n"
  else
    printf "  ${RED}✗${RESET} DNS resolution failed\n"
    ERRORS=$((ERRORS + 1))
  fi
else
  printf "  ${DIM}  dig not installed — skipping DNS test${RESET}\n"
fi

# --- Port check ---
printf "\n${BOLD}Port availability${RESET}\n"
if command -v ss >/dev/null 2>&1; then
  if ss -tln 2>/dev/null | grep -q ':3000'; then
    pid=$(ss -tlnp 2>/dev/null | grep ':3000' | grep -oP 'pid=\K[0-9]+' | head -1)
    printf "  ${GREEN}✓${RESET} port 3000 in use (PID %s)\n" "$pid"
  else
    printf "  ${DIM}  port 3000 free${RESET}\n"
  fi
else
  printf "  ${DIM}  ss not installed — skipping port test${RESET}\n"
fi

# --- Summary ---
printf "\n${DIM}──────────────────────────────────${RESET}\n"
if [ "$ERRORS" -eq 0 ]; then
  printf "${GREEN}✓ Network validation passed${RESET}\n"
else
  printf "${RED}✗ %d error(s)${RESET}\n" "$ERRORS"
fi

exit $ERRORS
