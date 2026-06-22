#!/usr/bin/env bash
# ============================================================================
#  tech-stack-scaner.sh — Scan the project's tech stack and report versions
#  Usage: bash scripts/tech-stack-scaner.sh
# ============================================================================
set -euo pipefail

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELL="\033[33m"
RED="\033[31m"
DIM="\033[2m"
RESET="\033[0m"

printf "${BOLD}zLM-CLI Tech Stack Scanner${RESET}\n"
printf "${DIM}──────────────────────────────────${RESET}\n\n"

# --- Runtime ---
printf "${BOLD}Runtime${RESET}\n"
for cmd in bun node npx git; do
  if command -v "$cmd" >/dev/null 2>&1; then
    ver=$("$cmd" --version 2>/dev/null | head -1)
    printf "  ${GREEN}✓${RESET} %-10s %s\n" "$cmd" "$ver"
  else
    printf "  ${RED}✗${RESET} %-10s ${DIM}not installed${RESET}\n" "$cmd"
  fi
done

# --- Package.json deps ---
printf "\n${BOLD}Dependencies (from package.json)${RESET}\n"
if [ -f package.json ]; then
  # Extract key dependencies
  for dep in next react typescript tailwindcss prisma z-ai-web-dev-sdk; do
    ver=$(grep -oP "\"$dep\"\s*:\s*\"\^\K[^\"]+" package.json 2>/dev/null || echo "")
    if [ -n "$ver" ]; then
      printf "  ${GREEN}✓${RESET} %-20s ^%s\n" "$dep" "$ver"
    else
      printf "  ${DIM}  %-20s not in package.json${RESET}\n" "$dep"
    fi
  done
else
  printf "  ${RED}✗ package.json not found${RESET}\n"
fi

# --- Installed (node_modules) ---
printf "\n${BOLD}Installed (node_modules)${RESET}\n"
for dep in next react z-ai-web-dev-sdk prisma; do
  if [ -d "node_modules/$dep" ]; then
    ver=$(grep -oP '"version"\s*:\s*"\K[^"]+' "node_modules/$dep/package.json" 2>/dev/null || echo "unknown")
    printf "  ${GREEN}✓${RESET} %-20s %s\n" "$dep" "$ver"
  else
    printf "  ${RED}✗${RESET} %-20s ${DIM}not installed${RESET}\n" "$dep"
  fi
done

# --- Framework detection ---
printf "\n${BOLD}Framework Detection${RESET}\n"
if [ -f next.config.ts ] || [ -f next.config.js ]; then
  printf "  ${CYAN}▸${RESET} Next.js (App Router)\n"
fi
if [ -f tailwind.config.ts ] || [ -f tailwind.config.js ]; then
  printf "  ${CYAN}▸${RESET} Tailwind CSS\n"
fi
if [ -f prisma/schema.prisma ]; then
  printf "  ${CYAN}▸${RESET} Prisma ORM\n"
  models=$(grep -c "^model " prisma/schema.prisma 2>/dev/null || echo "?")
  printf "  ${DIM}  └ %s models${RESET}\n" "$models"
fi
if [ -f tsconfig.json ]; then
  printf "  ${CYAN}▸${RESET} TypeScript\n"
fi
if [ -f Makefile ]; then
  printf "  ${CYAN}▸${RESET} Make (build system)\n"
fi

# --- API routes ---
printf "\n${BOLD}API Routes${RESET}\n"
routes=$(find src/app/api -name "route.ts" 2>/dev/null | wc -l)
printf "  ${CYAN}▸${RESET} %s routes found\n" "$routes"
find src/app/api -name "route.ts" 2>/dev/null | sort | while read -r f; do
  printf "  ${DIM}  └ %s${RESET}\n" "$(echo "$f" | sed 's|src/app/api/||; s|/route.ts||')"
done

# --- Components ---
printf "\n${BOLD}Components${RESET}\n"
ui_count=$(find src/components/ui -name "*.tsx" 2>/dev/null | wc -l)
term_count=$(find src/components/terminal -name "*.tsx" 2>/dev/null | wc -l)
printf "  ${CYAN}▸${RESET} %s shadcn/ui components\n" "$ui_count"
printf "  ${CYAN}▸${RESET} %s terminal components\n" "$term_count"

# --- Lib files ---
printf "\n${BOLD}Library Files${RESET}\n"
lib_count=$(find src/lib -name "*.ts" 2>/dev/null | wc -l)
printf "  ${CYAN}▸${RESET} %s lib files\n" "$lib_count"

# --- Docs ---
printf "\n${BOLD}Documentation${RESET}\n"
root_docs=$(find . -maxdepth 1 -name "*.md" 2>/dev/null | wc -l)
docs_dir=$(find docs -name "*.md" 2>/dev/null | wc -l)
printf "  ${CYAN}▸${RESET} %s root docs\n" "$root_docs"
printf "  ${CYAN}▸${RESET} %s docs/ files\n" "$docs_dir"

printf "\n${GREEN}✓ Tech stack scan complete${RESET}\n"
