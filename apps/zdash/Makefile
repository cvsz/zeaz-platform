SHELL := /usr/bin/env bash
.SHELLFLAGS := -Eeuo pipefail -c
.DEFAULT_GOAL := help

ROOT_DIR := $(CURDIR)
BACKEND_DIR := backend
FRONTEND_DIR := frontend
BACKEND_HOST ?= 0.0.0.0
BACKEND_PORT ?= 8005
FRONTEND_HOST ?= 0.0.0.0
FRONTEND_PORT ?= 5173
RELEASE_HOST ?= 127.0.0.1
RELEASE_PORT ?= 5172
PYTHON ?= python3
NPM ?= npm
NPM_INSTALL_FLAGS ?= --legacy-peer-deps --no-audit --fund=false
RUNTIME_DIR ?= ../../runtime/app-servers
REPORT_DIR ?= ../../reports/platform
BACKEND_PID := $(RUNTIME_DIR)/zdash-backend-$(BACKEND_PORT).pid
FRONTEND_PID := $(RUNTIME_DIR)/zdash-frontend-$(FRONTEND_PORT).pid
BACKEND_LOG := $(RUNTIME_DIR)/zdash-backend-$(BACKEND_PORT).log
FRONTEND_LOG := $(RUNTIME_DIR)/zdash-frontend-$(FRONTEND_PORT).log
SERVER_REPORT := $(REPORT_DIR)/zdash-server.md
FEATURE_ENV := .env.full-local.example
FEATURE_REPORT := .zdash-feature-status.md

.PHONY: help info install-backend install-frontend install-local validate-fast validate-local validate
.PHONY: run-backend run-frontend server-start server-stop server-restart server-status server-report server-logs health-check smoke-test
.PHONY: compose-config compose-up compose-up-detached compose-down compose-ps compose-logs compose-restart
.PHONY: safety-scan env-check port-scan secret-scan feature-env feature-unlock-local feature-status clean

help: ## Show targets
	@awk 'BEGIN {FS = ":.*##"; printf "\nzDash Makefile\n\n"} /^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-24s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

info: ## Print zdash runtime info
	@echo "App: zdash"
	@echo "Backend:  http://$(BACKEND_HOST):$(BACKEND_PORT) -> https://api-zdash.zeaz.dev"
	@echo "Frontend: http://$(FRONTEND_HOST):$(FRONTEND_PORT) -> https://zdash.zeaz.dev"
	@echo "Release:  http://$(RELEASE_HOST):$(RELEASE_PORT) -> https://release.zeaz.dev"
	@echo "Feature env: $(FEATURE_ENV)"

install-backend: ## Install backend dependencies
	@test -d $(BACKEND_DIR)/.venv || $(PYTHON) -m venv $(BACKEND_DIR)/.venv
	@source $(BACKEND_DIR)/.venv/bin/activate; python -m pip install --upgrade pip setuptools wheel
	@source $(BACKEND_DIR)/.venv/bin/activate; cd $(BACKEND_DIR); python -m pip install -e '.[dev]'

install-frontend: ## Install frontend dependencies
	@cd $(FRONTEND_DIR); $(NPM) install $(NPM_INSTALL_FLAGS)

install-local: install-backend install-frontend ## Install backend and frontend

run-backend: ## Run backend in foreground
	@PYTHONPATH=$(BACKEND_DIR) APP_ENV=development BACKEND_HOST=$(BACKEND_HOST) BACKEND_PORT=$(BACKEND_PORT) $(BACKEND_DIR)/.venv/bin/python -m uvicorn app.main:app --host $(BACKEND_HOST) --port $(BACKEND_PORT) --reload

run-frontend: ## Run frontend in foreground
	@cd $(FRONTEND_DIR); VITE_API_BASE_URL=http://$(BACKEND_HOST):$(BACKEND_PORT) $(NPM) run dev -- --host $(FRONTEND_HOST) --port $(FRONTEND_PORT)

server-start: ## Start backend and frontend in background
	@mkdir -p "$(RUNTIME_DIR)" "$(REPORT_DIR)"
	@if [ -f "$(BACKEND_PID)" ] && kill -0 "$$(cat "$(BACKEND_PID)")" >/dev/null 2>&1; then \
		echo "backend already running pid=$$(cat "$(BACKEND_PID)")"; \
	else \
		echo "START backend http://$(BACKEND_HOST):$(BACKEND_PORT)"; \
		PYTHONPATH=$(BACKEND_DIR) APP_ENV=development BACKEND_HOST=$(BACKEND_HOST) BACKEND_PORT=$(BACKEND_PORT) nohup $(BACKEND_DIR)/.venv/bin/python -m uvicorn app.main:app --host $(BACKEND_HOST) --port $(BACKEND_PORT) >> "$(BACKEND_LOG)" 2>&1 & echo $$! > "$(BACKEND_PID)"; \
	fi
	@if [ -f "$(FRONTEND_PID)" ] && kill -0 "$$(cat "$(FRONTEND_PID)")" >/dev/null 2>&1; then \
		echo "frontend already running pid=$$(cat "$(FRONTEND_PID)")"; \
	else \
		echo "START frontend http://$(FRONTEND_HOST):$(FRONTEND_PORT)"; \
		cd $(FRONTEND_DIR); VITE_API_BASE_URL=http://$(BACKEND_HOST):$(BACKEND_PORT) nohup $(NPM) run dev -- --host $(FRONTEND_HOST) --port $(FRONTEND_PORT) >> "../$(FRONTEND_LOG)" 2>&1 & echo $$! > "../$(FRONTEND_PID)"; \
	fi
	@$(MAKE) server-status

server-stop: ## Stop backend and frontend
	@if [ -f "$(FRONTEND_PID)" ]; then pid="$$(cat "$(FRONTEND_PID)")"; echo "STOP frontend pid=$$pid"; kill "$$pid" >/dev/null 2>&1 || true; rm -f "$(FRONTEND_PID)"; fi
	@if [ -f "$(BACKEND_PID)" ]; then pid="$$(cat "$(BACKEND_PID)")"; echo "STOP backend pid=$$pid"; kill "$$pid" >/dev/null 2>&1 || true; rm -f "$(BACKEND_PID)"; fi
	@$(MAKE) server-status

server-restart: ## Restart backend and frontend
	@$(MAKE) server-stop || true
	@$(MAKE) server-start

server-status: ## Show server status and write report
	@mkdir -p "$(REPORT_DIR)"
	@backend_status="STOPPED"; frontend_status="STOPPED"; \
	if [ -f "$(BACKEND_PID)" ] && kill -0 "$$(cat "$(BACKEND_PID)")" >/dev/null 2>&1; then backend_status="RUNNING pid=$$(cat "$(BACKEND_PID)")"; elif command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "http://$(BACKEND_HOST):$(BACKEND_PORT)/health" >/dev/null 2>&1; then backend_status="RUNNING external"; fi; \
	if [ -f "$(FRONTEND_PID)" ] && kill -0 "$$(cat "$(FRONTEND_PID)")" >/dev/null 2>&1; then frontend_status="RUNNING pid=$$(cat "$(FRONTEND_PID)")"; elif command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "http://$(FRONTEND_HOST):$(FRONTEND_PORT)/" >/dev/null 2>&1; then frontend_status="RUNNING external"; fi; \
	echo "backend api-zdash.zeaz.dev -> http://$(BACKEND_HOST):$(BACKEND_PORT) :: $$backend_status"; \
	echo "frontend zdash.zeaz.dev -> http://$(FRONTEND_HOST):$(FRONTEND_PORT) :: $$frontend_status"; \
	{ echo "# zdash server report"; echo; echo "Generated: $$(date -u +%Y-%m-%dT%H:%M:%SZ)"; echo; echo "| Service | Public hostname | Local origin | Status |"; echo "|---|---|---|---|"; echo "| backend | api-zdash.zeaz.dev | http://$(BACKEND_HOST):$(BACKEND_PORT) | $$backend_status |"; echo "| frontend | zdash.zeaz.dev | http://$(FRONTEND_HOST):$(FRONTEND_PORT) | $$frontend_status |"; } > "$(SERVER_REPORT)"

server-report: server-status ## Write server report
	@echo "Report: $(SERVER_REPORT)"

server-logs: ## Tail logs; set SERVICE=backend/frontend
	@if [ "$${SERVICE:-backend}" = "frontend" ]; then tail -f "$(FRONTEND_LOG)"; else tail -f "$(BACKEND_LOG)"; fi

health-check: ## Check backend health endpoint
	@curl -fsS "http://$(BACKEND_HOST):$(BACKEND_PORT)/health"

smoke-test: ## Run local smoke tests
	@curl -fsS --max-time 3 "http://$(BACKEND_HOST):$(BACKEND_PORT)/health" >/dev/null
	@curl -fsS --max-time 3 "http://$(FRONTEND_HOST):$(FRONTEND_PORT)/" >/dev/null
	@echo "PASSED: zdash smoke test"

env-check: ## Validate env syntax without printing values
	@status=0; for file in .env .env.example .env.full-local.example .env.production .env.production.example frontend/.env frontend/.env.local frontend/.env.example; do [ -f "$$file" ] || continue; grep -nEv '^($$|#|[A-Za-z_][A-Za-z0-9_]*=)' "$$file" && status=1 || echo "PASSED: $$file"; done; exit $$status

port-scan: ## Fail if source still references old backend port 8000
	@tmp=$$(mktemp); git grep -nE 'localhost:8000|BACKEND_PORT=8000' -- . ':(exclude)Makefile' ':(exclude)docs/**' ':(exclude)**/*.md' > $$tmp 2>/dev/null || true; if [ -s $$tmp ]; then cat $$tmp; rm -f $$tmp; exit 1; else rm -f $$tmp; echo "PASSED: no old backend port 8000 found"; fi

secret-scan: ## Basic scan for private key blocks in tracked app files
	@tmp=$$(mktemp); git grep -nE 'BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY' -- . ':(exclude)**/*.md' ':(exclude)docs/**' > $$tmp 2>/dev/null || true; if [ -s $$tmp ]; then cat $$tmp; rm -f $$tmp; exit 1; else rm -f $$tmp; echo "PASSED: no private key blocks found"; fi

safety-scan: env-check port-scan secret-scan ## Run safety scans

feature-env: ## Generate safe full-feature local env example
	@bash scripts/feature-local-env.sh "$(FEATURE_ENV)"

feature-unlock-local: feature-env ## Generate safe full-feature local env and show activation step
	@echo "Safe full-feature local env generated: $(FEATURE_ENV)"
	@echo "Apply manually with: cp $(FEATURE_ENV) .env"
	@echo "Safety remains enabled: dry-run=true, safety-lock=true, live actions=false"

feature-status: ## Write local feature key status report
	@echo "# zDash feature status" > "$(FEATURE_REPORT)"
	@echo >> "$(FEATURE_REPORT)"
	@echo "Generated: $$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$(FEATURE_REPORT)"
	@echo >> "$(FEATURE_REPORT)"
	@echo "Feature env: $(FEATURE_ENV)" >> "$(FEATURE_REPORT)"
	@echo "Backend: http://$(BACKEND_HOST):$(BACKEND_PORT)" >> "$(FEATURE_REPORT)"
	@echo "Frontend: http://$(FRONTEND_HOST):$(FRONTEND_PORT)" >> "$(FEATURE_REPORT)"
	@echo >> "$(FEATURE_REPORT)"
	@echo "Safety: dry-run and production safety lock remain enabled by default." >> "$(FEATURE_REPORT)"
	@echo "Report: $(FEATURE_REPORT)"

validate-fast: safety-scan ## Run fast validation
	@PYTHONPATH=$(BACKEND_DIR) $(PYTHON) -m compileall -q $(BACKEND_DIR)/app
	@$(NPM) --prefix $(FRONTEND_DIR) run test -- --run --passWithNoTests
	@echo "PASSED: zdash fast validation"

validate-local: validate-fast ## Alias for local validation

validate: validate-fast frontend-build ## Run validation and frontend build

frontend-build: ## Build frontend
	@$(NPM) --prefix $(FRONTEND_DIR) run build

compose-config: ## Validate Docker Compose config
	docker compose config >/dev/null
	@echo "PASSED: docker compose config"

compose-up: ## Start compose foreground
	docker compose up --build

compose-up-detached: ## Start compose detached
	docker compose up --build -d

compose-restart: compose-down compose-up-detached ## Restart compose detached

compose-down: ## Stop compose
	docker compose down

compose-ps: ## Show compose services
	docker compose ps

compose-logs: ## Follow compose logs
	docker compose logs -f --tail=200

clean: ## Clean caches
	@find . -type d \( -name __pycache__ -o -name .pytest_cache -o -name .ruff_cache -o -name dist -o -name build \) -prune -exec rm -rf {} +
