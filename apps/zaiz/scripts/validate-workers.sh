#!/usr/bin/env bash
# ============================================================================
#  validate-workers.sh — Validate background workers and mini-services
#  Usage: bash scripts/validate-workers.sh
# ============================================================================
set -euo pipefail

BOLD="\033[1m"
GREEN="\033[32m"
YELL="\033[33m"
RED="\033[31m"
DIM="\033[2m"
RESET="\033[0m"

ERRORS=0
WORKERS_FOUND=0

printf "${BOLD}zLM-CLI Workers Validator${RESET}\n"
printf "${DIM}──────────────────────────────────${RESET}\n\n"

# --- Dev server (main worker) ---
printf "${BOLD}Main dev server${RESET}\n"
if command -v ss >/dev/null 2>&1; then
  if ss -tln 2>/dev/null | grep -q ':3000'; then
    pid=$(ss -tlnp 2>/dev/null | grep ':3000' | grep -oP 'pid=\K[0-9]+' | head -1)
    printf "  ${GREEN}✓${RESET} Dev server running (PID %s, port 3000)\n" "$pid"

    # Check if it responds
    if curl -s --max-time 3 http://localhost:3000/ >/dev/null 2>&1; then
      printf "  ${GREEN}✓${RESET} Dev server responds to HTTP\n"
    else
      printf "  ${YELL}!${RESET} Dev server running but not responding\n"
      ERRORS=$((ERRORS + 1))
    fi
  else
    printf "  ${YELL}!${RESET} Dev server not running — run: make start\n"
  fi
else
  printf "  ${DIM}  ss not available — cannot check${RESET}\n"
fi

# --- PID files ---
printf "\n${BOLD}PID files${RESET}\n"
if [ -f .dev/server.pid ]; then
  pid=$(cat .dev/server.pid)
  if kill -0 "$pid" 2>/dev/null; then
    printf "  ${GREEN}✓${RESET} server.pid → PID %s (alive)\n" "$pid"
  else
    printf "  ${RED}✗${RESET} server.pid → PID %s (dead)\n" "$pid"
    ERRORS=$((ERRORS + 1))
  fi
else
  printf "  ${DIM}  No server.pid file${RESET}\n"
fi

if [ -f .dev/mini-services.pids ]; then
  while IFS= read -r pid; do
    [ -n "$pid" ] || continue
    if kill -0 "$pid" 2>/dev/null; then
      printf "  ${GREEN}✓${RESET} mini-service PID %s (alive)\n" "$pid"
      WORKERS_FOUND=$((WORKERS_FOUND + 1))
    else
      printf "  ${RED}✗${RESET} mini-service PID %s (dead)\n" "$pid"
      ERRORS=$((ERRORS + 1))
    fi
  done < .dev/mini-services.pids
else
  printf "  ${DIM}  No mini-services.pids file${RESET}\n"
fi

# --- Mini-services directory ---
printf "\n${BOLD}Mini-services${RESET}\n"
if [ -d mini-services ]; then
  for pkg in mini-services/*/package.json; do
    [ -f "$pkg" ] || continue
    dir=$(dirname "$pkg")
    name=$(basename "$dir")
    if [ -f "$dir/index.ts" ] || [ -f "$dir/index.js" ]; then
      printf "  ${GREEN}✓${RESET} %s (has entry point)\n" "$name"
      WORKERS_FOUND=$((WORKERS_FOUND + 1))
    else
      printf "  ${DIM}  %s (no entry point)${RESET}\n" "$name"
    fi
  done
  if [ "$WORKERS_FOUND" -eq 0 ]; then
    printf "  ${DIM}  No active mini-services found${RESET}\n"
  fi
else
  printf "  ${DIM}  mini-services/ directory empty${RESET}\n"
fi

# --- Next.js processes ---
printf "\n${BOLD}Next.js processes${RESET}\n"
if command -v pgrep >/dev/null 2>&1; then
  next_count=$(pgrep -f "next dev" 2>/dev/null | wc -l)
  if [ "$next_count" -gt 0 ]; then
    printf "  ${GREEN}✓${RESET} %s next-dev process(es) running\n" "$next_count"
  else
    printf "  ${DIM}  No next-dev processes${RESET}\n"
  fi

  bun_count=$(pgrep -f "bun" 2>/dev/null | wc -l)
  if [ "$bun_count" -gt 0 ]; then
    printf "  ${GREEN}✓${RESET} %s bun process(es) running\n" "$bun_count"
  fi
else
  printf "  ${DIM}  pgrep not available${RESET}\n"
fi

# --- Summary ---
printf "\n${DIM}──────────────────────────────────${RESET}\n"
if [ "$ERRORS" -eq 0 ]; then
  printf "${GREEN}✓ All workers healthy${RESET}"
else
  printf "${RED}✗ %d error(s)${RESET}" "$ERRORS"
fi
printf " ${DIM}| %d worker(s) found${RESET}\n" "$WORKERS_FOUND"

exit $ERRORS
