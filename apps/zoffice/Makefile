SHELL := /usr/bin/env bash
.SHELLFLAGS := -Eeuo pipefail -c
.DEFAULT_GOAL := help

APP_DIR := app
RUNTIME_DIR ?= .runtime
FEATURE_ENV ?= .env.full-local.example
FEATURE_REPORT ?= .zoffice-feature-status.md
PID_FILE := $(RUNTIME_DIR)/zoffice.pid
LOG_FILE := $(RUNTIME_DIR)/zoffice.log
WHISPER_PID := $(RUNTIME_DIR)/zoffice-whisper.pid
WHISPER_LOG := $(RUNTIME_DIR)/zoffice-whisper.log
METRICS_PID := $(RUNTIME_DIR)/zoffice-metrics.pid
METRICS_LOG := $(RUNTIME_DIR)/zoffice-metrics.log
PORT ?= 8091
WS_PORT ?= 8092
HOST ?= 127.0.0.1
VO_STATUS_DIR ?= $(CURDIR)/.runtime/data
VO_OPENCLAW_PATH ?= $(HOME)/.openclaw
VO_GATEWAY_URL ?= ws://127.0.0.1:18789
VO_GATEWAY_HTTP ?= http://127.0.0.1:18789

.PHONY: help info start stop restart status stop-all
.PHONY: server-start server-stop server-restart server-status server-report server-logs health-check smoke-test
.PHONY: start-whisper stop-whisper start-metrics stop-metrics feature-env feature-unlock-local feature-status validate-local clean
.PHONY: license-status license-activate license-deactivate license-agent-limit license-feature license-audit dev-internal-start

help: ## Show targets
	@awk 'BEGIN {FS = ":.*##"; printf "\nzOffice Makefile\n\n"} /^[a-zA-Z0-9_.-]+:.*##/ {printf "  %-24s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

info: ## Print local runtime info
	@echo "App: zoffice"
	@echo "HTTP: http://$(HOST):$(PORT) -> https://zoffice.zeaz.dev"
	@echo "WS:   ws://$(HOST):$(WS_PORT)"
	@echo "Data: $(VO_STATUS_DIR)"
	@echo "Feature env: $(FEATURE_ENV)"

start: server-start ## Alias for server-start

server-start: ## Start zoffice server without internal license override
	@mkdir -p "$(RUNTIME_DIR)" "$(VO_STATUS_DIR)"
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		echo "zoffice is already running (PID $$(cat $(PID_FILE)))"; \
	else \
		echo "Starting zoffice (HTTP $(HOST):$(PORT), WS $(HOST):$(WS_PORT))..."; \
		cd $(APP_DIR) && nohup env PYTHONUNBUFFERED=1 VO_PORT=$(PORT) VO_WS_PORT=$(WS_PORT) VO_STATUS_DIR="$(VO_STATUS_DIR)" VO_OPENCLAW_PATH="$(VO_OPENCLAW_PATH)" VO_GATEWAY_URL="$(VO_GATEWAY_URL)" VO_GATEWAY_HTTP="$(VO_GATEWAY_HTTP)" python3 -u server.py > ../$(LOG_FILE) 2>&1 & \
		echo $$! > $(PID_FILE); \
		sleep 1; \
		if kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then echo "Started PID $$(cat $(PID_FILE))"; else echo "Failed to start — check $(LOG_FILE)"; fi; \
	fi

dev-internal-start: ## Start owner/developer internal mode; not for public license bypass
	@mkdir -p "$(RUNTIME_DIR)" "$(VO_STATUS_DIR)"
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		echo "zoffice is already running (PID $$(cat $(PID_FILE)))"; \
	else \
		echo "Starting zoffice developer/internal mode (HTTP $(HOST):$(PORT), WS $(HOST):$(WS_PORT))..."; \
		cd $(APP_DIR) && nohup env _VO_INT=1 PYTHONUNBUFFERED=1 VO_PORT=$(PORT) VO_WS_PORT=$(WS_PORT) VO_STATUS_DIR="$(VO_STATUS_DIR)" VO_OPENCLAW_PATH="$(VO_OPENCLAW_PATH)" VO_GATEWAY_URL="$(VO_GATEWAY_URL)" VO_GATEWAY_HTTP="$(VO_GATEWAY_HTTP)" python3 -u server.py > ../$(LOG_FILE) 2>&1 & \
		echo $$! > $(PID_FILE); \
		sleep 1; \
		if kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then echo "Started PID $$(cat $(PID_FILE))"; else echo "Failed to start — check $(LOG_FILE)"; fi; \
	fi

stop: server-stop ## Alias for server-stop

server-stop: ## Stop zoffice server
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		echo "Stopping zoffice (PID $$(cat $(PID_FILE)))..."; \
		kill $$(cat $(PID_FILE)) 2>/dev/null || true; \
		rm -f $(PID_FILE); \
		echo "Stopped"; \
	else \
		echo "zoffice is not running"; \
	fi

restart: server-restart ## Alias for server-restart

server-restart: server-stop server-start ## Restart zoffice server

status: server-status ## Alias for server-status

server-status: ## Show server status
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		echo "zoffice is running (PID $$(cat $(PID_FILE)))"; \
		echo "  HTTP : http://$(HOST):$(PORT)"; \
		echo "  WS   : ws://$(HOST):$(WS_PORT)"; \
		echo "  Log  : $(LOG_FILE)"; \
		if curl -sf http://$(HOST):$(PORT)/health >/dev/null 2>&1; then echo "  Health: OK"; else echo "  Health: unreachable"; fi; \
	else \
		echo "zoffice is NOT running"; \
	fi

server-report: ## Write local server report
	@{ echo "# zoffice server report"; echo; echo "Generated: $$(date -u +%Y-%m-%dT%H:%M:%SZ)"; echo; echo "HTTP: http://$(HOST):$(PORT)"; echo "WS: ws://$(HOST):$(WS_PORT)"; echo "Data: $(VO_STATUS_DIR)"; } > .zoffice-server-status.md
	@echo "Report: .zoffice-server-status.md"

server-logs: ## Tail server logs
	@tail -f $(LOG_FILE)

health-check: ## Check zoffice health endpoint
	@curl -fsS http://$(HOST):$(PORT)/health

smoke-test: ## Check zoffice root and health endpoint
	@curl -fsS --max-time 3 http://$(HOST):$(PORT)/health >/dev/null
	@curl -fsS --max-time 3 http://$(HOST):$(PORT)/ >/dev/null
	@echo "PASSED: zoffice smoke test"

start-whisper: ## Start optional Whisper STT server
	@mkdir -p "$(RUNTIME_DIR)"
	@if [ -f $(WHISPER_PID) ] && kill -0 $$(cat $(WHISPER_PID)) 2>/dev/null; then \
		echo "Whisper STT is already running (PID $$(cat $(WHISPER_PID)))"; \
	else \
		echo "Starting Whisper STT server..."; \
		cd $(APP_DIR) && nohup python3 whisper-server.py > ../$(WHISPER_LOG) 2>&1 & \
		echo $$! > $(WHISPER_PID); \
		sleep 1; \
		if kill -0 $$(cat $(WHISPER_PID)) 2>/dev/null; then echo "Started PID $$(cat $(WHISPER_PID))"; else echo "Failed to start — check $(WHISPER_LOG)"; fi; \
	fi

stop-whisper: ## Stop optional Whisper STT server
	@if [ -f $(WHISPER_PID) ] && kill -0 $$(cat $(WHISPER_PID)) 2>/dev/null; then \
		echo "Stopping Whisper STT (PID $$(cat $(WHISPER_PID)))..."; \
		kill $$(cat $(WHISPER_PID)) 2>/dev/null || true; rm -f $(WHISPER_PID); \
		echo "Stopped"; \
	else \
		echo "Whisper STT is not running"; \
	fi

start-metrics: ## Start optional PC metrics server
	@mkdir -p "$(RUNTIME_DIR)"
	@if [ -f $(METRICS_PID) ] && kill -0 $$(cat $(METRICS_PID)) 2>/dev/null; then \
		echo "PC Metrics server is already running (PID $$(cat $(METRICS_PID)))"; \
	else \
		echo "Starting PC Metrics server..."; \
		cd $(APP_DIR) && nohup python3 pc-metrics-server.py > ../$(METRICS_LOG) 2>&1 & \
		echo $$! > $(METRICS_PID); \
		sleep 1; \
		if kill -0 $$(cat $(METRICS_PID)) 2>/dev/null; then echo "Started PID $$(cat $(METRICS_PID))"; else echo "Failed to start — check $(METRICS_LOG)"; fi; \
	fi

stop-metrics: ## Stop optional PC metrics server
	@if [ -f $(METRICS_PID) ] && kill -0 $$(cat $(METRICS_PID)) 2>/dev/null; then \
		echo "Stopping PC Metrics (PID $$(cat $(METRICS_PID)))..."; \
		kill $$(cat $(METRICS_PID)) 2>/dev/null || true; rm -f $(METRICS_PID); \
		echo "Stopped"; \
	else \
		echo "PC Metrics is not running"; \
	fi

stop-all: server-stop stop-whisper stop-metrics ## Stop all zoffice services
	@echo "All services stopped"

feature-env: ## Generate safe full-feature local env example
	@bash scripts/feature-local-env.sh "$(FEATURE_ENV)"

feature-unlock-local: feature-env ## Generate safe full-feature local env and show activation step
	@echo "Safe full-feature local env generated: $(FEATURE_ENV)"
	@echo "Apply manually with: cp $(FEATURE_ENV) .env"
	@echo "Safe mode: optional panels enabled, external actions remain provider/config gated"

feature-status: ## Write local feature status report
	@{ echo "# zoffice feature status"; echo; echo "Generated: $$(date -u +%Y-%m-%dT%H:%M:%SZ)"; echo; echo "Feature env: $(FEATURE_ENV)"; echo "HTTP: http://$(HOST):$(PORT)"; echo "WS: ws://$(HOST):$(WS_PORT)"; echo "Optional: whisper, metrics, browser panel, SMS panel, Hermes, OpenClaw gateway"; } > "$(FEATURE_REPORT)"
	@echo "Report: $(FEATURE_REPORT)"

license-status: ## Show current license status
	@bash scripts/license-tool.sh status

license-activate: ## Activate with valid key; run make license-activate KEY=<valid-key>
	@test -n "$${KEY:-}" || { echo "ERROR: set KEY=<valid-license-key>" >&2; exit 2; }
	@bash scripts/license-tool.sh activate "$${KEY}"

license-deactivate: ## Remove local license receipt
	@bash scripts/license-tool.sh deactivate

license-agent-limit: ## Show current licensed agent limit
	@bash scripts/license-tool.sh agent-limit

license-feature: ## Check feature; run make license-feature FEATURE=browserPanel
	@test -n "$${FEATURE:-}" || { echo "ERROR: set FEATURE=<feature-name>" >&2; exit 2; }
	@bash scripts/license-tool.sh feature "$${FEATURE}"

license-audit: ## Audit commonly locked features
	@echo "License status:"; bash scripts/license-tool.sh status
	@for feature in browserPanel smsPanel cronManager whisper apiUsage; do echo; bash scripts/license-tool.sh feature "$$feature"; done
	@echo; bash scripts/license-tool.sh agent-limit

validate-local: ## Run basic local validation
	@python3 -m py_compile app/server.py app/gateway_presence.py app/discovery.py app/license.py
	@bash scripts/license-tool.sh status >/dev/null
	@echo "PASSED: zoffice local validation"

clean: stop-all ## Remove local runtime files
	@rm -rf "$(RUNTIME_DIR)" .zoffice-server-status.md "$(FEATURE_REPORT)"
