SHELL := /usr/bin/env bash
.SHELLFLAGS := -Eeuo pipefail -c
.DEFAULT_GOAL := help

PROJECT_ROOT ?= $(CURDIR)
ENVIRONMENT ?= prod
TF_BIN ?= terraform
TOFU_BIN ?= tofu
PYTHON ?= python3
VENV_DIR ?= .venv
CONFIRM_APPLY ?= no
TF_PLAN_FILE ?= tfplan
TF_ARGS ?=

TF_ROOT := terraform
TF_ENV_DIR := terraform/environments/$(ENVIRONMENT)
TOFU_ENV_DIR := opentofu/environments/$(ENVIRONMENT)
PYTEST := $(VENV_DIR)/bin/pytest
TF_ENV_WRAPPER := scripts/terraform/export-tf-vars.sh
ENV_NORMALIZER := scripts/cloudflare/clean-env-empty-values.sh

export PROJECT_ROOT
export ENVIRONMENT
export PYTHON
export TF_ROOT

.PHONY: help bootstrap setup setup-free setup-legacy generate-env-all refactor-cloudflare-vars refactor-cloudflare-vars-dry check-no-cf-vars env load-env docs-context upgrade-report validate validate-agent ci ci-validate validate-env validate-env-strict env-format-validate env-format-validate-local env-normalize-local maintenance test fmt fmt-check lint shellcheck yaml-validate policy-test sbom-generation sbom-validate security-validate secret-scan tunnel-validation waf-validation waf-validate tf-init tf-fmt tf-fmt-check tf-validate tf-plan tf-plan-out tf-apply tf-apply-plan tf-destroy tf-state-rm-waf tf-env-init tf-env-validate tf-env-plan tofu-init tofu-validate tofu-plan drift drift-detect token-clean token-verify token-verify-strict token-rotate-dry token-rotate token-rotate-refresh security-scan sbom cosign-sign doctor clean phase-f1 phase-f2 phase-f3 phase-f4 phase-f5 phase-f6 phase-f7 workflow-policy workflow-validate gitops-validate health-zveo health-zwallet health-platform ssh-origin-setup ssh-origin-health ssh-route ssh-public-health backup-platform install-platform-ops devex devex-up devex-down devex-logs

help:
	@bash scripts/make-help.sh

bootstrap:
	@bash scripts/bootstrap-system.sh

setup: setup-free

setup-free:
	@bash scripts/environments/setup-free.sh

setup-legacy:
	@bash scripts/environments/setup.sh

generate-env-all:
	@bash scripts/environments/generate-env-all.sh

refactor-cloudflare-vars-dry:
	@bash scripts/refactor-cloudflare-vars.sh --dry-run

refactor-cloudflare-vars:
	@bash scripts/refactor-cloudflare-vars.sh --apply

check-no-cf-vars:
	@bash scripts/check-no-cf-vars.sh

docs-context:
	@bash scripts/cloudflare/fetch-cloudflare-llms-context.sh

upgrade-report:
	@bash scripts/project-upgrade-report.sh

env: load-env

load-env:
	@bash scripts/cloudflare/load-env.sh

ci: validate

validate-agent: ci-validate

validate-ai-stack:
	@echo "Validating AI Stack config and agent environment..."
	@bash scripts/validate-ai-gateway.sh --offline
	@bash -c "source scripts/cloudflare/load-env.sh && bash scripts/ai/validate-agent-env.sh"
	@echo "AI Stack validation passed."

ci-validate: test env-format-validate yaml-validate check-no-cf-vars tf-fmt-check
	@echo "CI validation complete."

validate: test validate-env env-format-validate yaml-validate check-no-cf-vars tf-fmt-check
	@echo "Validation complete."

validate-env:
	@bash scripts/env-report-check.sh advisory

validate-env-strict:
	@bash scripts/env-report-check.sh strict

env-format-validate:
	@$(PYTHON) scripts/validate-env-files.py .env.example

env-format-validate-local:
	@$(PYTHON) scripts/validate-env-files.py --skip-missing .env .env.cloudflare .env.example

env-normalize-local:
	@if [ -f .env ]; then bash $(ENV_NORMALIZER) .env; chmod 600 .env; echo "normalized .env"; else echo "skip .env: not found"; fi
	@if [ -f .env.cloudflare ]; then bash $(ENV_NORMALIZER) .env.cloudflare; chmod 600 .env.cloudflare; echo "normalized .env.cloudflare"; else echo "skip .env.cloudflare: not found"; fi

maintenance:
	@bash scripts/environments/maintenance.sh validate

test:
	@if [ -x "$(PYTEST)" ]; then "$(PYTEST)" -q tests; \
	elif command -v pytest >/dev/null 2>&1; then pytest -q tests; \
	else echo "WARN: pytest not installed; run make bootstrap"; fi

lint:
	@bash scripts/make-lint.sh

shellcheck:
	@# find xargs shellcheck
	@bash scripts/shellcheck-tracked.sh

yaml-validate:
	@if [ -f scripts/validate-yaml.py ]; then $(PYTHON) scripts/validate-yaml.py; else echo "INFO: scripts/validate-yaml.py not present; skipped"; fi

fmt: tf-fmt

fmt-check: tf-fmt-check

tf-init:
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) init $(TF_ARGS)

tf-fmt:
	@$(TF_BIN) fmt -recursive $(TF_ROOT) opentofu 2>/dev/null || $(TF_BIN) fmt -recursive $(TF_ROOT)

tf-fmt-check:
	@$(TF_BIN) fmt -check -recursive $(TF_ROOT) opentofu 2>/dev/null || $(TF_BIN) fmt -check -recursive $(TF_ROOT)

tf-validate: tf-init
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) validate

tf-plan: tf-init
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) plan $(TF_ARGS)

tf-plan-out: tf-init
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) plan -out=$(TF_PLAN_FILE) $(TF_ARGS)
	@echo "Saved Terraform plan: $(TF_ROOT)/$(TF_PLAN_FILE)"

tf-apply: tf-init
	@test "$(CONFIRM_APPLY)" = "yes" || (echo "ERROR: Set CONFIRM_APPLY=yes to continue." && exit 1)
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) apply -auto-approve $(TF_ARGS)

tf-apply-plan:
	@test "$(CONFIRM_APPLY)" = "yes" || (echo "ERROR: Set CONFIRM_APPLY=yes to continue." && exit 1)
	@test -f "$(TF_ROOT)/$(TF_PLAN_FILE)" || (echo "ERROR: missing saved plan $(TF_ROOT)/$(TF_PLAN_FILE). Run: make tf-plan-out" && exit 1)
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) apply $(TF_PLAN_FILE)

tf-destroy: tf-init
	@test "$(CONFIRM_APPLY)" = "yes" || (echo "ERROR: Set CONFIRM_APPLY=yes to continue." && exit 1)
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) destroy -auto-approve $(TF_ARGS)

tf-state-rm-waf: tf-init
	@test "$(CONFIRM_APPLY)" = "yes" || (echo "ERROR: Set CONFIRM_APPLY=yes to remove WAF resources from Terraform state only." && exit 1)
	@set +e; \
	addresses="$$(bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) state list 2>/dev/null | grep '^module\.waf' || true)"; \
	set -e; \
	if [ -z "$$addresses" ]; then echo "No module.waf resources found in Terraform state."; exit 0; fi; \
	printf '%s\n' "$$addresses" | while IFS= read -r addr; do \
	  [ -n "$$addr" ] || continue; \
	  echo "Removing $$addr"; \
	  bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) state rm "$$addr"; \
	done

tf-env-init:
	@test -d "$(TF_ENV_DIR)" || (echo "ERROR: missing $(TF_ENV_DIR)" && exit 1)
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ENV_DIR) init $(TF_ARGS)

tf-env-validate: tf-env-init
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ENV_DIR) validate

tf-env-plan: tf-env-init
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ENV_DIR) plan $(TF_ARGS)

tofu-init:
	@if command -v $(TOFU_BIN) >/dev/null 2>&1 && [ -d "$(TOFU_ENV_DIR)" ]; then $(TOFU_BIN) -chdir=$(TOFU_ENV_DIR) init $(TF_ARGS); else echo "WARN: tofu or $(TOFU_ENV_DIR) missing; skipped"; fi

tofu-validate: tofu-init
	@if command -v $(TOFU_BIN) >/dev/null 2>&1 && [ -d "$(TOFU_ENV_DIR)" ]; then $(TOFU_BIN) -chdir=$(TOFU_ENV_DIR) validate; else echo "WARN: tofu or $(TOFU_ENV_DIR) missing; skipped"; fi

tofu-plan: tofu-init
	@if command -v $(TOFU_BIN) >/dev/null 2>&1 && [ -d "$(TOFU_ENV_DIR)" ]; then $(TOFU_BIN) -chdir=$(TOFU_ENV_DIR) plan $(TF_ARGS); else echo "WARN: tofu or $(TOFU_ENV_DIR) missing; skipped"; fi

drift: drift-detect

drift-detect: tf-init
	@set +e; bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) plan -detailed-exitcode -out=tfplan.drift $(TF_ARGS); rc=$$?; set -e; \
	case "$$rc" in \
	  0) echo "No drift detected." ;; \
	  2) echo "WARN: drift detected. Saved plan: $(TF_ROOT)/tfplan.drift"; exit 2 ;; \
	  *) echo "ERROR: drift check failed rc=$$rc"; exit "$$rc" ;; \
	esac

token-clean:
	@bash scripts/cloudflare/run-token-rotation.sh --dry-run --keep-most 1 --unused-days 90 || { echo "WARN: token-clean skipped; run make token-verify after configuring CLOUDFLARE_BOOTSTRAP_TOKEN"; true; }

token-verify:
	@bash scripts/cloudflare/verify-token-env.sh || { echo "WARN: token verification failed; use make token-verify-strict when a hard failure is required"; true; }

token-verify-strict:
	@bash scripts/cloudflare/verify-token-env.sh

token-rotate-dry:
	@bash scripts/cloudflare/rotate-tokens-with-permission-preflight.sh --dry-run --regenerate --types all --backup --write .env.cloudflare --refresh-permissions

token-rotate:
	@bash scripts/cloudflare/rotate-tokens-with-permission-preflight.sh --yes --regenerate --types all --backup --write .env.cloudflare --refresh-permissions

token-rotate-refresh: token-rotate-dry

secret-scan:
	@if command -v gitleaks >/dev/null 2>&1; then gitleaks detect --config security/gitleaks.toml --source . --redact; else echo "WARN: gitleaks not installed; skipped gitleaks scan"; fi

security-scan:
	@if [ -x scripts/security-scan.sh ]; then bash scripts/security-scan.sh; else echo "WARN: scripts/security-scan.sh missing; skipped"; fi

sbom:
	@if command -v syft >/dev/null 2>&1; then syft dir:. -o spdx-json=artifacts.sbom.spdx.json; else echo "WARN: syft missing; SBOM generation skipped"; fi

cosign-sign:
	@if [ ! -f artifacts.sbom.spdx.json ]; then echo "No SBOM artifact found; cosign signing skipped"; \
	elif ! command -v cosign >/dev/null 2>&1; then echo "WARN: cosign not installed; signing skipped"; \
	else cosign sign-blob --yes artifacts.sbom.spdx.json --output-signature artifacts.sbom.spdx.json.sig; fi

policy-test: workflow-policy
	@echo "Policy testing complete."

sbom-generation: sbom
sbom-validate: sbom
security-validate: security-scan
waf-validate: waf-validation

waf-validation:
	@if [ "$${ENABLE_WAF:-false}" = "true" ] || [ "$${TF_VAR_enable_waf:-false}" = "true" ]; then $(MAKE) tf-validate; else echo "WAF validation skipped because ENABLE_WAF=false"; fi

tunnel-validation:
	@if [ -n "$${ORIGIN_HOSTS:-}" ]; then bash scripts/tunnel-validate.sh --offline; else echo "Tunnel validation skipped because ORIGIN_HOSTS is not configured"; fi

workflow-policy:
	@if [ -x scripts/workflow-policy.sh ]; then bash scripts/workflow-policy.sh; else echo "WARN: workflow-policy.sh missing; skipped"; fi

workflow-validate: workflow-policy
	@echo "Workflow validation complete."

gitops-validate: workflow-validate drift-detect
	@echo "GitOps validation complete."

health-zveo:
	@bash ops/bin/zveo-health

health-zwallet:
	@bash ops/bin/zwallet-health

health-platform:
	@bash ops/bin/zeaz-health

ssh-origin-setup:
	@bash ops/bin/zeaz-ssh-origin-setup

ssh-origin-health:
	@bash ops/bin/zeaz-ssh-origin-health

ssh-route:
	@bash ops/bin/zeaz-cloudflare-ssh-route

ssh-public-health:
	@bash ops/bin/zeaz-ssh-public-health

backup-platform:
	@bash ops/scripts/backup-platform.sh

install-platform-ops:
	@bash ops/install-platform-ops.sh

doctor:
	@echo "PROJECT_ROOT=$(PROJECT_ROOT)"
	@echo "ENVIRONMENT=$(ENVIRONMENT)"
	@echo "COST_LOCK=$${COST_LOCK:-true}"
	@command -v $(TF_BIN) >/dev/null 2>&1 && $(TF_BIN) version | head -n 1 || echo "WARN: terraform missing"
	@command -v $(TOFU_BIN) >/dev/null 2>&1 && $(TOFU_BIN) version | head -n 1 || echo "WARN: tofu missing"
	@$(PYTHON) --version
	@if [ -x "$(PYTEST)" ]; then "$(PYTEST)" --version; else echo "WARN: pytest missing from $(VENV_DIR)"; fi
	@command -v cloudflared >/dev/null 2>&1 && cloudflared --version || echo "WARN: cloudflared missing"
	@command -v gh >/dev/null 2>&1 && gh --version | head -n 1 || echo "WARN: gh missing"

clean:
	@rm -f $(TF_ROOT)/tfplan.drift $(TF_ROOT)/$(TF_PLAN_FILE) $(TF_ROOT)/*.tfplan artifacts.sbom.spdx.json artifacts.sbom.spdx.json.sig
	@find . -type d -name '.terraform' -prune -print -exec rm -rf {} +

zaiz: zaiz-up

zaiz-up:
	@echo "Starting Zeaz Meta OS via unified root compose and deployment scripts..."
	docker compose up -d --build
	@bash scripts/meta_os_deploy.sh

zaiz-down:
	@echo "Stopping Zeaz Meta OS..."
	docker compose down
	pkill -f "uvicorn main:app" || true
	pkill -f "npm start" || true
	pkill -f "python self_healing_runtime.py" || true
	pkill -f "python queue_supervisor.py" || true

zaiz-logs:
	docker compose logs -f

zaiz-validate:
	@bash scripts/validation.sh

zaiz-install:
	@bash scripts/install.sh

zaiz-heal-runtime:
	@echo "Triggering self-healing runtime..."
	@python3 runtime/self_healing_runtime.py

zaiz-risk:
	@echo "Evaluating deployment risk..."
	@python3 runtime/risk_engine.py

zaiz-release:
	@echo "Starting autonomous release governor..."
	@python3 runtime/release_governor.py

zaiz-rollback:
	@echo "Executing rollback engine..."
	@python3 runtime/rollback_engine.py

zaiz-memory:
	@echo "Initializing platform memory..."
	@python3 runtime/platform_memory/memory_engine.py

zaiz-report:
	@echo "Generating Ops AI report..."
	@python3 runtime/ops_ai.py

zaiz-core:
	docker compose -f compose/core.yaml up -d

zaiz-edge:
	docker compose -f compose/edge.yaml up -d

zaiz-ai:
	docker compose -f compose/ai.yaml up -d

zaiz-obs:
	docker compose -f compose/observability.yaml up -d

zaiz-heal:
	docker compose -f compose/healing.yaml up -d

zaiz-prod:
	docker compose -f compose/core.yaml -f compose/edge.yaml -f compose/auth.yaml -f compose/observability.yaml -f compose/runtime.yaml -f compose/governance.yaml -f compose/healing.yaml up -d

zaiz-trader-up:
	docker compose -f compose/trading.yaml up -d

zaiz-trader-down:
	docker compose -f compose/trading.yaml down

zaiz-trader-logs:
	docker compose -f compose/trading.yaml logs -f

zaiz-trader-risk:
	@python3 runtime/trading/risk_engine.py

zaiz-trader-heal:
	@echo "Healing Trading Engine..."

zaiz-trader-replay:
	@echo "Replaying Trading Events..."

zaiz-trader-chaos:
	@echo "Injecting Trading Chaos..."

zaiz-trader-safe:
	@echo "Entering Trading Safe Mode..."

zaiz-trader-stop:
	@echo "Emergency Trading Stop..."

zaiz-restart:
	docker compose restart

zaiz-auth:
	docker compose -f compose/auth.yaml up -d

zaiz-trader:
	docker compose -f compose/trading-core.yaml -f compose/trading-ai.yaml -f compose/trading-risk.yaml up -d

zaiz-cloudflare-sync:
	terraform -chdir=terraform/cloudflare apply -auto-approve

zaiz-tunnel:
	cloudflared tunnel run zeaz-meta-os-tunnel

zaiz-ws-test:
	@echo "Testing websocket multiplexing..."

zaiz-ports:
	bash scripts/validation/validate_ports.sh

zaiz-firewall:
	@echo "Applying zero-trust firewall rules..."
###############################################################################
# GOOGLE VERTEX AI
###############################################################################

zaiz-vertex-test:
	python3 scripts/test_vertex.py

zaiz-gcloud-env:
	@bash scripts/google_vertex_runtime.sh

zaiz-llm-v2:
	@echo "Initializing Cognitive Fabric v2 Mesh..."
	docker compose up -d redis postgres grafana prometheus
	@bash -c "source .venv/bin/activate && uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload"

zaiz-vertex-v2:
	@echo "Testing Vertex AI Cognitive Mesh connectivity..."
	@bash scripts/validate_cognitive_fabric.sh --provider vertex-ai

zaiz-token-metrics:
	@echo "Fetching token burn analytics..."
	curl -s http://localhost:8000/api/runtime/llm/metrics | jq .

zaiz-scheduler:
	@echo "Initializing Cognitive Scheduler Worker..."
	@bash -c "source .venv/bin/activate && python3 -c 'import asyncio; from runtime.scheduler.scheduler_engine import SchedulerEngine; from runtime.scheduler.lease_manager import LeaseManager; from runtime.scheduler.execution_journal import ExecutionJournal; from runtime.scheduler.workload_balancer import WorkloadBalancer; from runtime.scheduler.backpressure_manager import BackpressureManager; from runtime.scheduler.affinity_engine import AffinityEngine; from runtime.llm.provider_registry import ProviderRegistry; from runtime.llm.token_budget_engine import TokenBudgetEngine; from runtime.policy_engine import PolicyEngine; r=ProviderRegistry(); b=TokenBudgetEngine(); a=AffinityEngine(r); bal=WorkloadBalancer(r,b,a); bp=BackpressureManager(); l=LeaseManager(); j=ExecutionJournal(); p=PolicyEngine(); s=SchedulerEngine(\"redis://localhost:6379/0\",l,j,bal,bp,p); asyncio.run(s.process_tasks(\"worker-1\"))'"

zaiz-scheduler-test:
	@echo "Submitting test task to Cognitive Scheduler..."
	curl -s -X POST http://localhost:8000/api/runtime/scheduler/tasks \
	  -H "Content-Type: application/json" \
	  -d '{"action_type": "HEALING", "tenant_id": "test-tenant", "payload": {"target": "worker-pool-1"}}' | jq .

zaiz-swarm:
	@echo "Initializing Autonomous Agent Swarm (Full Roster)..."
	@bash -c "source .venv/bin/activate && python3 -c 'import asyncio; \
	from runtime.swarm.agents.telemetry_agent import TelemetryAgent; \
	from runtime.swarm.agents.security_agent import SecurityAgent; \
	from runtime.swarm.agents.healing_agent import HealingAgent; \
	from runtime.swarm.agents.governance_agent import GovernanceAgent; \
	from runtime.swarm.agents.reasoning_agent import ReasoningAgent; \
	from runtime.swarm.agents.deployment_agent import DeploymentAgent; \
	from runtime.swarm.agents.predictive_agent import PredictiveAgent; \
	from runtime.swarm.orchestrator import SwarmOrchestrator; \
	async def start(): \
		t=TelemetryAgent(); s=SecurityAgent(); h=HealingAgent(); \
		g=GovernanceAgent(); r=ReasoningAgent(); d=DeploymentAgent(); p=PredictiveAgent(); \
		o=SwarmOrchestrator(); \
		await asyncio.gather(t.start(), s.start(), h.start(), g.start(), r.start(), d.start(), p.start(), o.manage_swarm()); \
	asyncio.run(start())'"

zaiz-swarm-incident:
	@echo "Triggering test incident in Agent Swarm..."
	curl -s -X POST http://localhost:8000/api/runtime/swarm/marketplace \
	  -H "Content-Type: application/json" \
	  -d '{"task_id": "incident-oom-1", "task_type": "HEAL_RUNTIME", "requirements": ["HEAL_RUNTIME"], "payload": {"service": "worker-1", "severity": "CRITICAL"}}' | jq .
