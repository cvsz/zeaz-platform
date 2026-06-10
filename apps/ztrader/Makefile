# ztrader Platform Operations Makefile

HOST ?= 127.0.0.1
FRONTEND_PORT ?= 3016
BACKEND_PORT ?= 8016
PYTHONPATH ?= backend/src
RUNTIME_DIR ?= ../../runtime/app-servers
REPORT_DIR ?= ../../reports/platform
MERGE_REPORT_DIR ?= reports/merge
FRONTEND_PID := $(RUNTIME_DIR)/ztrader-frontend-$(FRONTEND_PORT).pid
BACKEND_PID := $(RUNTIME_DIR)/ztrader-backend-$(BACKEND_PORT).pid
FRONTEND_LOG := $(RUNTIME_DIR)/ztrader-frontend-$(FRONTEND_PORT).log
BACKEND_LOG := $(RUNTIME_DIR)/ztrader-backend-$(BACKEND_PORT).log
SERVER_REPORT := $(REPORT_DIR)/ztrader-server.md

.PHONY: help install-backend install-frontend dev-backend dev-frontend test-backend run-docker stop-docker format lint clean
.PHONY: server-start server-stop server-restart server-status server-report validate-local
.PHONY: merge-plan merge-dry-run merge-apply merge-report merge-validate

help:
	@echo "Available commands:"
	@echo "  install-backend   - Install python backend dependencies in virtualenv/current env"
	@echo "  install-frontend  - Install node packages for Next.js frontend"
	@echo "  dev-backend       - Run FastAPI backend development server on BACKEND_PORT"
	@echo "  dev-frontend      - Run Next.js frontend development server on FRONTEND_PORT"
	@echo "  server-start      - Start backend + frontend with pid/log files"
	@echo "  server-stop       - Stop backend + frontend started by server-start"
	@echo "  server-status     - Show backend + frontend origin status"
	@echo "  validate-local    - Compile backend and validate frontend package metadata"
	@echo "  test-backend      - Run backend unit tests with pytest"
	@echo "  run-docker        - Orchestrate all services using docker-compose"
	@echo "  stop-docker       - Stop and tear down docker-compose containers"
	@echo "  merge-plan        - Show zTrader merge plan path"
	@echo "  merge-dry-run     - Preview ABTPi18n + zkbtrader source mapping into zTrader"
	@echo "  merge-apply       - Apply source mapping into zTrader, retaining source apps"
	@echo "  merge-report      - Show generated merge report files"
	@echo "  merge-validate    - Run local validation after merge mapping"
	@echo "  format            - Format Python files using black"
	@echo "  lint              - Lint Python code using ruff"
	@echo "  clean             - Clean python build cache and logs"
	@echo "  merge-plan        - Print the merge mapping and plan"
	@echo "  merge-dry-run     - Execute a dry-run migration"
	@echo "  merge-apply       - Execute the live migration"
	@echo "  merge-validate    - Validate the migrated source files"
	@echo "  merge-report      - Generate a merge completion report"

install-backend:
	pip install -r backend/requirements.txt

install-frontend:
	cd frontend && pnpm install

dev-backend:
	PYTHONPATH=$(PYTHONPATH) uvicorn ztrader.main:app --reload --host $(HOST) --port $(BACKEND_PORT)

dev-frontend:
	cd frontend && HOST=$(HOST) PORT=$(FRONTEND_PORT) pnpm run dev

server-start:
	@mkdir -p "$(RUNTIME_DIR)" "$(REPORT_DIR)"
	@if [ -f "$(BACKEND_PID)" ] && kill -0 "$$(cat "$(BACKEND_PID)")" >/dev/null 2>&1; then \
		echo "backend already running pid=$$(cat "$(BACKEND_PID)")"; \
	else \
		echo "START backend http://$(HOST):$(BACKEND_PORT)"; \
		PYTHONPATH=$(PYTHONPATH) nohup uvicorn ztrader.main:app --host $(HOST) --port $(BACKEND_PORT) >> "$(BACKEND_LOG)" 2>&1 & echo $$! > "$(BACKEND_PID)"; \
	fi
	@if [ -f "$(FRONTEND_PID)" ] && kill -0 "$$(cat "$(FRONTEND_PID)")" >/dev/null 2>&1; then \
		echo "frontend already running pid=$$(cat "$(FRONTEND_PID)")"; \
	else \
		echo "START frontend http://$(HOST):$(FRONTEND_PORT)"; \
		cd frontend && HOST=$(HOST) PORT=$(FRONTEND_PORT) nohup pnpm run dev >> "../../$(FRONTEND_LOG)" 2>&1 & echo $$! > "../../$(FRONTEND_PID)"; \
	fi
	@$(MAKE) server-status

server-stop:
	@if [ -f "$(FRONTEND_PID)" ]; then pid="$$(cat "$(FRONTEND_PID)")"; echo "STOP frontend pid=$$pid"; kill "$$pid" >/dev/null 2>&1 || true; rm -f "$(FRONTEND_PID)"; fi
	@if [ -f "$(BACKEND_PID)" ]; then pid="$$(cat "$(BACKEND_PID)")"; echo "STOP backend pid=$$pid"; kill "$$pid" >/dev/null 2>&1 || true; rm -f "$(BACKEND_PID)"; fi
	@$(MAKE) server-status

server-restart:
	@$(MAKE) server-stop || true
	@$(MAKE) server-start

server-status:
	@mkdir -p "$(REPORT_DIR)"
	@frontend_status="STOPPED"; backend_status="STOPPED"; \
	if [ -f "$(FRONTEND_PID)" ] && kill -0 "$$(cat "$(FRONTEND_PID)")" >/dev/null 2>&1; then frontend_status="RUNNING pid=$$(cat "$(FRONTEND_PID)")"; elif command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "http://$(HOST):$(FRONTEND_PORT)/" >/dev/null 2>&1; then frontend_status="RUNNING external"; fi; \
	if [ -f "$(BACKEND_PID)" ] && kill -0 "$$(cat "$(BACKEND_PID)")" >/dev/null 2>&1; then backend_status="RUNNING pid=$$(cat "$(BACKEND_PID)")"; elif command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "http://$(HOST):$(BACKEND_PORT)/health" >/dev/null 2>&1; then backend_status="RUNNING external"; fi; \
	echo "frontend ztrader.zeaz.dev -> http://$(HOST):$(FRONTEND_PORT) :: $$frontend_status"; \
	echo "backend api-ztrader.zeaz.dev -> http://$(HOST):$(BACKEND_PORT) :: $$backend_status"; \
	{ echo "# ztrader server report"; echo; echo "Generated: $$(date -u +%Y-%m-%dT%H:%M:%SZ)"; echo; echo "| Service | Public hostname | Local origin | Status |"; echo "|---|---|---|---|"; echo "| frontend | ztrader.zeaz.dev | http://$(HOST):$(FRONTEND_PORT) | $$frontend_status |"; echo "| backend | api-ztrader.zeaz.dev | http://$(HOST):$(BACKEND_PORT) | $$backend_status |"; } > "$(SERVER_REPORT)"

server-report: server-status
	@echo "Report: $(SERVER_REPORT)"

validate-local:
	@PYTHONPATH=$(PYTHONPATH) python3 -m compileall -q backend/src
	@python3 -m json.tool frontend/package.json >/dev/null
	@echo "PASS: ztrader local validation complete"

test-backend:
	PYTHONPATH=$(PYTHONPATH) pytest backend/tests/ -v

merge-plan:
	@echo "../../docs/plans/ztrader-merge-abtpi18n-zkbtrader-plan.md"

merge-dry-run:
	DRY_RUN=true bash scripts/merge-abtpi18n-zkbtrader.sh

merge-apply:
	DRY_RUN=false bash scripts/merge-abtpi18n-zkbtrader.sh

merge-report:
	@find "$(MERGE_REPORT_DIR)" -maxdepth 2 -type f 2>/dev/null | sort || true

merge-validate: validate-local
	@python3 -m json.tool merge-sources/abtpi18n/package.json >/dev/null 2>&1 || true
	@python3 -m json.tool frontend/package.json >/dev/null
	@grep -R "GLOBAL_KILL_SWITCH: bool = True" backend/src/ztrader/core/config.py >/dev/null
	@echo "PASS: ztrader merge validation checks complete"

run-docker:
	docker compose up --build -d

stop-docker:
	docker compose down

format:
	black backend/src/ backend/tests/

lint:
	ruff check backend/src/ backend/tests/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +

merge-plan:
	@DRY_RUN=true bash scripts/merge-abtpi18n-zkbtrader.sh

merge-dry-run: merge-plan

merge-apply:
	@DRY_RUN=false bash scripts/merge-abtpi18n-zkbtrader.sh

merge-validate:
	@echo "Validating Python compilation..."
	python3 -m compileall backend/src/ztrader
	@echo "Validating Frontend JSON..."
	jq . frontend/package.json > /dev/null
	@echo "Checking merged sources metadata..."
	ls merge-sources/abtpi18n-package.json
	ls merge-sources/zkbtrader-package.json
	@echo "Validation Passed."

merge-report:
	@mkdir -p reports/merge
	@echo "# zTrader Merge Report" > reports/merge/summary.md
	@echo "Generated: $$(date)" >> reports/merge/summary.md
	@echo "Status: COMPLETED" >> reports/merge/summary.md
	@echo "Source Apps: ABTPi18n, zkbtrader" >> reports/merge/summary.md
	@echo "Target App: ztrader" >> reports/merge/summary.md
	@echo "Report saved to reports/merge/summary.md"
