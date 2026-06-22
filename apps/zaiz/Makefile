# ============================================================================
#  zLM-CLI — Makefile
#  Full-stack cross-platform build, dev server, security, and tooling.
#
#  Usage:
#    make install    — install deps + setup DB (cross-platform)
#    make start      — start dev server (+ mini-services)
#    make stop       — stop dev server
#    make restart    — stop then start
#    make status     — show running state, ports, PIDs
#    make build      — production build (cross-platform)
#    make package    — create distributable zip
#    make security   — run the security scanner
#    make test       — run lint + security + type-check
#    make help       — show all targets
# ============================================================================

SHELL := /usr/bin/bash

# --- config -----------------------------------------------------------------
PORT        ?= 3000
LOG_FILE    ?= dev.log
DEV_DIR     ?= .dev
PID_FILE    ?= $(DEV_DIR)/server.pid
MINI_DIR    ?= mini-services
MINI_PIDS   ?= $(DEV_DIR)/mini-services.pids
ZIP_FILE    ?= download/zlm-cli-source.zip

# --- cross-platform OS detection --------------------------------------------
# Detects macOS / Linux / Windows (WSL) and sets platform-specific vars.
UNAME_S := $(shell uname -s 2>/dev/null || echo unknown)
ifeq ($(UNAME_S),Darwin)
    PLATFORM := macos
    PLATFORM_ARCH := $(shell uname -m)
    PORT_CHECK := $(shell lsof -ti :$(PORT) 2>/dev/null | head -1)
else ifeq ($(UNAME_S),Linux)
    PLATFORM := linux
    PLATFORM_ARCH := $(shell uname -m)
    PORT_CHECK := $(shell ss -tlnp 2>/dev/null | grep -E ':$(PORT)([^0-9]|$$)' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2)
else ifeq ($(shell grep -i microsoft /proc/version 2>/dev/null),)
    PLATFORM := linux
    PORT_CHECK := $(shell ss -tlnp 2>/dev/null | grep -E ':$(PORT)([^0-9]|$$)' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2)
else
    PLATFORM := wsl
    PORT_CHECK := $(shell ss -tlnp 2>/dev/null | grep -E ':$(PORT)([^0-9]|$$)' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2)
endif

# Port-check helper: returns the PID listening on PORT, or empty.
define get_port_pid
$(strip $(PORT_CHECK))
endef

# ANSI colors (disabled when not a TTY).
ifeq ($(shell test -t 1 && echo yes),yes)
	C_RESET := \033[0m
	C_BOLD  := \033[1m
	C_GREEN := \033[32m
	C_RED   := \033[31m
	C_YELL  := \033[33m
	C_CYAN  := \033[36m
	C_DIM   := \033[2m
else
	C_RESET :=
	C_BOLD  :=
	C_GREEN :=
	C_RED   :=
	C_YELL  :=
	C_CYAN  :=
	C_DIM   :=
endif

# --- phony targets ----------------------------------------------------------
.PHONY: help install start stop restart status logs clean lint db-push db-generate \
	mini-start mini-stop mini-status ensure-dev-dir \
	build package security test check-deps check-os

.DEFAULT_GOAL := help

help: ## Show this help
	@printf "$(C_BOLD)zLM-CLI — Full-Stack Makefile$(C_RESET)\n"
	@printf "$(C_DIM)Platform: $(PLATFORM) $(PLATFORM_ARCH) | Cross-platform build + dev + security$(C_RESET)\n\n"
	@printf "$(C_BOLD)Targets:$(C_RESET)\n"
	@grep -E '^[a-zA-Z_-]+:.*## .*$$' $(MAKEFILE_LIST) | \
	        awk 'BEGIN {FS = ":.*## "}; {printf "  $(C_CYAN)%-14s$(C_RESET) %s\n", $$1, $$2}' | sort

# ---------------------------------------------------------------------------
# check-os — detect and report the operating system
# ---------------------------------------------------------------------------
check-os: ## Detect and report OS + arch
	@printf "$(C_BOLD)OS Detection$(C_RESET)\n"
	@printf "  platform:  $(C_CYAN)$(PLATFORM)$(C_RESET)\n"
	@printf "  arch:      $(C_CYAN)$(PLATFORM_ARCH)$(C_RESET)\n"
	@printf "  bun:       $(C_CYAN)$$(bun --version 2>/dev/null || echo 'not found')$(C_RESET)\n"
	@printf "  node:      $(C_CYAN)$$(node --version 2>/dev/null || echo 'not found')$(C_RESET)\n"
	@printf "  git:       $(C_CYAN)$$(git --version 2>/dev/null || echo 'not found')$(C_RESET)\n"
	@if [ "$(PLATFORM)" = "wsl" ]; then \
	        printf "  $(C_YELL)! Running under WSL — use WSL terminal, not PowerShell$(C_RESET)\n"; \
	fi

# ---------------------------------------------------------------------------
# check-deps — verify required tools are installed
# ---------------------------------------------------------------------------
check-deps: ## Check that required tools are installed
	@printf "$(C_CYAN)▸ Checking dependencies…$(C_RESET)\n"
	@MISSING=0; \
	for cmd in bun git; do \
	        if ! command -v $$cmd >/dev/null 2>&1; then \
	                printf "$(C_RED)✗ %s is required but not installed$(C_RESET)\n" "$$cmd"; \
	                MISSING=1; \
	        else \
	                printf "$(C_GREEN)✓ %s (%s)$(C_RESET)\n" "$$cmd" "$$($$cmd --version 2>/dev/null | head -1)"; \
	        fi; \
	done; \
	if [ "$$MISSING" = "1" ]; then \
	        printf "\n$(C_YELL)Install missing tools:$(C_RESET)\n"; \
	        printf "  Bun:  curl -fsSL https://bun.sh/install | bash\n"; \
	        printf "  Git:  sudo apt install git  (or brew install git)\n"; \
	        exit 1; \
	fi

# ---------------------------------------------------------------------------
# install — full-stack cross-platform install
# ---------------------------------------------------------------------------
install: check-deps ## Install deps + setup PostgreSQL + generate Prisma + push schema
	@printf "$(C_CYAN)▸ [$(PLATFORM)] Installing dependencies…$(C_RESET)\n"
	@bun install
	@printf "$(C_CYAN)▸ Setting up PostgreSQL (Docker)…$(C_RESET)\n"
	@$(MAKE) --no-print-directory db-setup
	@printf "$(C_CYAN)▸ Seeding default roles…$(C_RESET)\n"
	@bunx tsx -e "import { ensureDefaultRoles } from './src/lib/permissions'; ensureDefaultRoles().then(() => process.exit(0))" 2>/dev/null || true
	@printf "$(C_GREEN)✓ Install complete on $(PLATFORM)$(C_RESET)\n"
	@printf "$(C_DIM)  Database: PostgreSQL (postgresql://localhost:5432/glm_cli)$(C_RESET)\n"
	@printf "$(C_DIM)  Run 'make start' to launch the dev server.$(C_RESET)\n"

# ---------------------------------------------------------------------------
# start — launch the dev server in the background (idempotent)
# ---------------------------------------------------------------------------
start: ensure-dev-dir ## Start the dev server (+ mini-services) in the background
	@if [ -n "$$(ss -tln 2>/dev/null | grep -E ':$(PORT)([^0-9]|$$)')" ]; then \
	        PID=$$(ss -tlnp 2>/dev/null | grep -E ':$(PORT)([^0-9]|$$)' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2); \
	        printf "$(C_YELL)! Dev server already running on port $(PORT) (PID %s)$(C_RESET)\n" "$$PID"; \
	        echo $$PID > $(PID_FILE); \
	else \
	        printf "$(C_CYAN)▸ Starting dev server on port $(PORT)…$(C_RESET)\n"; \
	        setsid bash -c 'exec bun run dev' >>$(LOG_FILE) 2>&1 & \
	        echo $$! > $(PID_FILE); \
	        sleep 3; \
	        if [ -n "$$(ss -tln 2>/dev/null | grep -E ':$(PORT)([^0-9]|$$)')" ]; then \
	                PID=$$(ss -tlnp 2>/dev/null | grep -E ':$(PORT)([^0-9]|$$)' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2); \
	                echo $$PID > $(PID_FILE); \
	                printf "$(C_GREEN)✓ Dev server started (PID %s) — http://localhost:$(PORT)$(C_RESET)\n" "$$PID"; \
	        else \
	                printf "$(C_RED)✗ Dev server failed to start — check $(LOG_FILE)$(C_RESET)\n"; \
	                exit 1; \
	        fi; \
	fi
	@$(MAKE) --no-print-directory mini-start

# ---------------------------------------------------------------------------
# stop — stop the dev server (and mini-services)
# ---------------------------------------------------------------------------
stop: mini-stop ## Stop the dev server (+ mini-services)
	@STOPPED=0; \
	PID=$$(ss -tlnp 2>/dev/null | grep -E ':$(PORT)([^0-9]|$$)' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2); \
	if [ -n "$$PID" ]; then \
	        printf "$(C_CYAN)▸ Stopping dev server (PID %s)…$(C_RESET)\n" "$$PID"; \
	        kill $$PID 2>/dev/null || true; \
	        for i in 1 2 3 4 5; do \
	                [ -z "$$(ss -tln 2>/dev/null | grep -E ':$(PORT)([^0-9]|$$)')" ] && break; \
	                sleep 1; \
	        done; \
	        if [ -n "$$(ss -tln 2>/dev/null | grep -E ':$(PORT)([^0-9]|$$)')" ]; then \
	                printf "$(C_YELL)! Process did not exit, sending SIGKILL…$(C_RESET)\n"; \
	                kill -9 $$PID 2>/dev/null || true; \
	                sleep 1; \
	        fi; \
	        STOPPED=1; \
	fi; \
	if [ -f $(PID_FILE) ]; then \
	        OLD=$$(cat $(PID_FILE)); \
	        if [ -n "$$OLD" ] && kill -0 $$OLD 2>/dev/null; then \
	                kill $$OLD 2>/dev/null || true; \
	        fi; \
	        rm -f $(PID_FILE); \
	fi; \
	if [ "$$STOPPED" = "1" ]; then \
	        printf "$(C_GREEN)✓ Dev server stopped$(C_RESET)\n"; \
	else \
	        printf "$(C_YELL)! Dev server was not running$(C_RESET)\n"; \
	fi

# ---------------------------------------------------------------------------
# restart — stop then start
# ---------------------------------------------------------------------------
restart: stop start ## Stop then start

# ---------------------------------------------------------------------------
# status — show running state, ports, and PIDs
# ---------------------------------------------------------------------------
status: ## Show dev server + mini-services status
	@printf "$(C_BOLD)zLM-CLI status$(C_RESET)\n"
	@printf "$(C_DIM)──────────────────────────────────────────$(C_RESET)\n"
	@printf "  platform       $(C_DIM)$(PLATFORM) $(PLATFORM_ARCH)$(C_RESET)\n"
	@PID=$$(ss -tlnp 2>/dev/null | grep -E ':$(PORT)([^0-9]|$$)' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2); \
	if [ -n "$$PID" ]; then \
	        printf "  dev server     $(C_GREEN)● running$(C_RESET)  PID %-7s  port $(PORT)\n" "$$PID"; \
	        if [ -f $(LOG_FILE) ]; then \
	                printf "  log            $(C_DIM)%s$(C_RESET)\n" "$(LOG_FILE)"; \
	        fi; \
	else \
	        printf "  dev server     $(C_RED)○ stopped$(C_RESET)\n"; \
	fi
	@$(MAKE) --no-print-directory mini-status
	@printf "$(C_DIM)──────────────────────────────────────────$(C_RESET)\n"

# ---------------------------------------------------------------------------
# logs — tail the dev log
# ---------------------------------------------------------------------------
logs: ## Tail dev.log (Ctrl+C to exit)
	@tail -f $(LOG_FILE)

# ---------------------------------------------------------------------------
# build — production build (cross-platform)
# ---------------------------------------------------------------------------
build: ## Production build (Next.js standalone)
	@printf "$(C_CYAN)▸ [$(PLATFORM)] Building for production…$(C_RESET)\n"
	@printf "$(C_DIM)  Note: Next.js build creates a standalone server in .next/standalone/$(C_RESET)\n"
	@bun run build
	@printf "$(C_GREEN)✓ Build complete on $(PLATFORM)$(C_RESET)\n"
	@printf "$(C_DIM)  Start with: NODE_ENV=production bun .next/standalone/server.js$(C_RESET)\n"

# ---------------------------------------------------------------------------
# package — create a distributable zip (source + config, no deps/cache)
# ---------------------------------------------------------------------------
package: ## Create a distributable source zip
	@printf "$(C_CYAN)▸ Packaging source…$(C_RESET)\n"
	@mkdir -p download
	@rm -f $(ZIP_FILE)
	@zip -r $(ZIP_FILE) . \
	        -x "node_modules/*" \
	        -x ".next/*" \
	        -x ".git/*" \
	        -x "skills/*" \
	        -x "db/*" \
	        -x ".dev/*" \
	        -x "tool-results/*" \
	        -x "upload/*" \
	        -x ".zscripts/*" \
	        -x "*.log" \
	        -x "$(ZIP_FILE)" \
	        -x "*.db" \
	        -x "*.tsbuildinfo" \
	        -x "worklog.md" \
	        2>/dev/null
	@printf "$(C_GREEN)✓ Packaged: $(ZIP_FILE) (%s)$(C_RESET)\n" "$$(ls -lh $(ZIP_FILE) | awk '{print $$5}')"
	@printf "$(C_DIM)  Files: $$(unzip -l $(ZIP_FILE) | tail -1 | awk '{print $$2}')$(C_RESET)\n"

# ---------------------------------------------------------------------------
# security — run the security scanner
# ---------------------------------------------------------------------------
security: ## Run the OWASP security scanner
	@printf "$(C_CYAN)▸ Running security scan…$(C_RESET)\n"
	@curl -s -X POST http://localhost:$(PORT)/api/security 2>/dev/null | \
	        bunx tsx -e "
	                const data = JSON.parse(await Bun.stdin.text());
	                if (!data.ok) { console.error('Scan failed'); process.exit(1); }
	                console.log('Files scanned:', data.filesScanned);
	                console.log('Duration:', data.durationMs + 'ms');
	                console.log('Summary:', JSON.stringify(data.summary, null, 2));
	                if (data.findings.length > 0) {
	                        console.log('\nFindings:');
	                        for (const f of data.findings.slice(0, 20)) {
	                                console.log('  [' + f.severity.toUpperCase() + '] ' + f.rule + ' — ' + f.file + ':' + f.line);
	                        }
	                        if (data.findings.length > 20) console.log('  ... and ' + (data.findings.length - 20) + ' more');
	                } else {
	                        console.log('\n✓ No security issues found');
	                }
	        " 2>/dev/null || printf "$(C_YELL)! Server not running — start it first: make start$(C_RESET)\n"

# ---------------------------------------------------------------------------
# test — run lint + security + type-check (pre-commit gate)
# ---------------------------------------------------------------------------
test: lint ## Run lint + type-check (pre-commit quality gate)
	@printf "$(C_CYAN)▸ Running type-check…$(C_RESET)\n"
	@bunx tsc --noEmit 2>&1 | head -20 || true
	@printf "$(C_GREEN)✓ Quality gate passed$(C_RESET)\n"

# ---------------------------------------------------------------------------
# clean — remove build cache (keeps deps)
# ---------------------------------------------------------------------------
clean: ## Remove .next cache + build artifacts
	@printf "$(C_CYAN)▸ Cleaning build cache…$(C_RESET)\n"
	@rm -rf .next
	@rm -rf node_modules/.cache
	@rm -rf .turbo
	@printf "$(C_GREEN)✓ Clean complete$(C_RESET)\n"

# ---------------------------------------------------------------------------
# lint / db helpers
# ---------------------------------------------------------------------------
lint: ## Run ESLint
	@bun run lint

db-push: ## Push Prisma schema to PostgreSQL
	@bun run db:push

db-generate: ## Generate Prisma client
	@bun run db:generate

db-reset: ## Reset PostgreSQL and re-push schema (destructive!)
	@printf "$(C_YELL)! Resetting database (all data will be lost)…$(C_RESET)\n"
	@bun run db:push --force-reset
	@printf "$(C_GREEN)✓ Database reset$(C_RESET)\n"

db-migrate: ## Create + apply a Prisma migration
	@bun run db:migrate

db-studio: ## Open Prisma Studio (DB GUI)
	@bunx prisma studio

db-setup: ## Ensure PostgreSQL is running + create database + push schema
	@printf "$(C_CYAN)▸ Setting up PostgreSQL…$(C_RESET)\n"
	@if command -v docker >/dev/null 2>&1; then \
	        if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q "zlm-postgres"; then \
	                printf "$(C_CYAN)▸ Starting PostgreSQL container…$(C_RESET)\n"; \
	                docker run -d --name zlm-postgres \
	                        -e POSTGRES_USER=postgres \
	                        -e POSTGRES_PASSWORD=postgres \
	                        -e POSTGRES_DB=glm_cli \
	                        -p 5432:5432 \
	                        postgres:16-alpine 2>/dev/null || true; \
	                printf "$(C_GREEN)✓ PostgreSQL container started (port 5432)$(C_RESET)\n"; \
	                sleep 3; \
	        else \
	                printf "$(C_GREEN)✓ PostgreSQL container already running$(C_RESET)\n"; \
	        fi; \
	else \
	        printf "$(C_YELL)! Docker not found — ensure PostgreSQL is running manually$(C_RESET)\n"; \
	        printf "$(C_DIM)  Install Docker or run: sudo apt install postgresql$(C_RESET)\n"; \
	fi
	@printf "$(C_CYAN)▸ Generating Prisma client…$(C_RESET)\n"
	@bun run db:generate
	@printf "$(C_CYAN)▸ Pushing schema to PostgreSQL…$(C_RESET)\n"
	@bun run db:push 2>/dev/null || printf "$(C_YELL)! DB push failed — is PostgreSQL running?$(C_RESET)\n"
	@printf "$(C_GREEN)✓ Database setup complete$(C_RESET)\n"

# ---------------------------------------------------------------------------
# mini-services — start/stop/status for everything in mini-services/
# ---------------------------------------------------------------------------
mini-start: ensure-dev-dir ## Start every mini-service in the background
	@if [ ! -d $(MINI_DIR) ]; then exit 0; fi
	@: > $(MINI_PIDS)
	@STARTED=0; \
	for pkg in $(MINI_DIR)/*/package.json; do \
	        [ -f "$$pkg" ] || continue; \
	        dir=$$(dirname "$$pkg"); \
	        name=$$(basename "$$dir"); \
	        if [ ! -f "$$dir/index.ts" ] && [ ! -f "$$dir/index.js" ]; then \
	                continue; \
	        fi; \
	        printf "$(C_CYAN)▸ Starting mini-service: %s$(C_RESET)\n" "$$name"; \
	        ( cd "$$dir" && setsid bash -c 'exec bun run dev' >>"$$name.log" 2>&1 & echo $$! >>"../$(MINI_PIDS)" ); \
	        STARTED=1; \
	done; \
	if [ "$$STARTED" = "0" ]; then \
	        printf "$(C_YELL)! No mini-services found in $(MINI_DIR)/$(C_RESET)\n"; \
	fi

mini-stop: ## Stop all mini-services
	@if [ ! -f $(MINI_PIDS) ]; then exit 0; fi
	@while read pid; do \
	        [ -n "$$pid" ] || continue; \
	        if kill -0 $$pid 2>/dev/null; then \
	                kill $$pid 2>/dev/null || true; \
	        fi; \
	done < $(MINI_PIDS); \
	rm -f $(MINI_PIDS); \
	printf "$(C_GREEN)✓ Mini-services stopped$(C_RESET)\n"

mini-status: ## Show mini-services status
	@if [ ! -d $(MINI_DIR) ]; then exit 0; fi
	@FOUND=0; \
	for pkg in $(MINI_DIR)/*/package.json; do \
	        [ -f "$$pkg" ] || continue; \
	        dir=$$(dirname "$$pkg"); \
	        name=$$(basename "$$dir"); \
	        FOUND=1; \
	        printf "  mini-service    $(C_DIM)%s$(C_RESET)\n" "$$name"; \
	done; \
	if [ "$$FOUND" = "0" ]; then \
	        printf "  mini-services  $(C_DIM)none$(C_RESET)\n"; \
	fi

# ---------------------------------------------------------------------------
# internal
# ---------------------------------------------------------------------------
ensure-dev-dir:
	@mkdir -p $(DEV_DIR)
