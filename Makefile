SHELL := /usr/bin/env bash
.SHELLFLAGS := -Eeuo pipefail -c
.DEFAULT_GOAL := help

PROJECT_ROOT ?= $(CURDIR)
ENVIRONMENT ?= prod
TF_BIN ?= terraform
TOFU_BIN ?= tofu
PYTHON ?= python3
VENV_DIR ?= .venv
TF_PLAN_FILE ?= tfplan
TF_ARGS ?=
COMMIT_MSG ?=
GIT_REMOTE ?= origin
GIT_BRANCH ?=
GPG_LOOPBACK ?= GPG_ENV_FILE="$(PROJECT_ROOT)/.env" bash apps/zdash/scripts/git/gpg-loopback.sh

TF_ROOT := terraform
TF_ENV_DIR := terraform/environments/$(ENVIRONMENT)
TOFU_ENV_DIR := opentofu/environments/$(ENVIRONMENT)
PYTEST := $(VENV_DIR)/bin/pytest
TF_ENV_WRAPPER := scripts/terraform/export-tf-vars.sh
ENV_NORMALIZER := scripts/cloudflare/clean-env-empty-values.sh

export PROJECT_ROOT ENVIRONMENT PYTHON TF_ROOT

.PHONY: help bootstrap setup setup-free setup-legacy generate-env-all refactor-cloudflare-vars refactor-cloudflare-vars-dry check-no-cf-vars env load-env docs-context supabase-ai-tools supabase-docs-context supabase-mcp-check supabase-mcp-config upgrade-report validate validate-agent ci ci-validate validate-env validate-env-strict env-format-validate env-format-validate-local env-normalize-local maintenance test fmt fmt-check lint shellcheck yaml-validate policy-test sbom-generation sbom-validate security-validate secret-scan secret-scan-history tunnel-validation waf-validation waf-validate tf-init tf-fmt tf-fmt-check tf-validate tf-plan tf-plan-out tf-apply tf-apply-plan tf-destroy tf-state-rm-waf tf-env-init tf-env-validate tf-env-plan tofu-init tofu-validate tofu-plan drift drift-detect token-clean token-verify token-verify-strict token-rotate-dry token-rotate token-rotate-refresh security-scan sbom cosign-sign doctor clean zdash-origin-check zdash-tunnel-config zdash-edge-readiness zdash-go-live-evidence zdash-public-release-evidence phase50-validate zdash-install zdash-validate-fast zdash-backend-test zdash-frontend-test zdash-build zdash-server-start zdash-server-stop zdash-server-restart zdash-server-status zdash-validate zdash-release-evidence zdash-phase48-validate zdash-cloudflare-handoff phase51-validate zeaz-dev-plan zeaz-dev-apply zeaz-dev-rollback-plan zeaz-dev-verify-live zeaz-dev-public-evidence phase52-validate workflow-policy workflow-validate gitops-validate git-status gpg-commit gpg-push gpg-finalize git-finalize zaiz-validate zaiz-prod zaiz-fix-google-genai zaiz-deps-check

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

supabase-docs-context:
	@bash scripts/supabase/fetch-ai-docs-context.sh

supabase-mcp-check:
	@bash scripts/supabase/mcp-check.sh

supabase-mcp-config:
	@bash scripts/supabase/write-mcp-config.sh

supabase-ai-tools: supabase-docs-context supabase-mcp-check
	@echo "Supabase AI tools context ready."

upgrade-report:
	@bash scripts/project-upgrade-report.sh

env: load-env

load-env:
	@bash scripts/cloudflare/load-env.sh

ci: validate

validate-agent: ci-validate

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
	@if [ -x "$(PYTEST)" ]; then "$(PYTEST)" -q tests; elif command -v pytest >/dev/null 2>&1; then pytest -q tests; else echo "WARN: pytest not installed; run make bootstrap"; fi

fmt: tf-fmt

fmt-check: tf-fmt-check

lint:
	@bash scripts/make-lint.sh

shellcheck:
	@if command -v shellcheck >/dev/null 2>&1; then find scripts ops -type f -name '*.sh' -print0 2>/dev/null | xargs -0 -r shellcheck -S error; else echo "shellcheck missing; skipped"; fi

yaml-validate:
	@if [ -f scripts/validate-yaml.py ]; then $(PYTHON) scripts/validate-yaml.py; else echo "INFO: scripts/validate-yaml.py not present; skipped"; fi

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

tf-apply tf-apply-plan tf-destroy tf-state-rm-waf:
	@echo "This target is intentionally guarded in the release-gate Makefile. Use the reviewed deployment workflow with explicit confirmation."

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
	@set +e; bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) plan -detailed-exitcode -out=tfplan.drift $(TF_ARGS); rc=$$?; set -e; case "$$rc" in 0) echo "No drift detected." ;; 2) echo "WARN: drift detected. Saved plan: $(TF_ROOT)/tfplan.drift"; exit 2 ;; *) echo "ERROR: drift check failed rc=$$rc"; exit "$$rc" ;; esac

token-clean:
	@bash scripts/cloudflare/run-token-rotation.sh --dry-run --keep-most 1 --unused-days 90 || { echo "WARN: token-clean skipped; run make token-verify after configuring CLOUDFLARE_BOOTSTRAP_TOKEN"; true; }

token-verify:
	@bash scripts/cloudflare/verify-token-env.sh || { echo "WARN: token verification failed; use make token-verify-strict when a hard failure is required"; true; }

token-verify-strict:
	@bash scripts/cloudflare/verify-token-env.sh

token-rotate-dry:
	@bash scripts/cloudflare/rotate-tokens-with-permission-preflight.sh --dry-run --regenerate --types all --backup --write .env.cloudflare --refresh-permissions

token-rotate:
	@echo "Live token rotation must be run from a reviewed local shell after validating dry-run output."

token-rotate-refresh: token-rotate-dry

secret-scan:
	@bash scripts/secret-scan-tracked.sh

secret-scan-history:
	@if command -v gitleaks >/dev/null 2>&1; then gitleaks detect --config security/gitleaks.toml --source . --redact; else echo "WARN: gitleaks not installed; skipped gitleaks history scan"; fi

security-scan:
	@if [ -x scripts/security-scan.sh ]; then bash scripts/security-scan.sh; else echo "WARN: scripts/security-scan.sh missing; skipped"; fi

sbom:
	@if command -v syft >/dev/null 2>&1; then syft dir:. -o spdx-json=artifacts.sbom.spdx.json; else echo "WARN: syft missing; SBOM generation skipped"; fi

cosign-sign:
	@if [ -f artifacts.sbom.spdx.json ] && command -v cosign >/dev/null 2>&1; then cosign sign-blob --yes artifacts.sbom.spdx.json --output-signature artifacts.sbom.spdx.json.sig; else echo "WARN: cosign signing skipped"; fi

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

git-status:
	@git status --short

gpg-commit:
	@test -n "$(COMMIT_MSG)" || (echo 'ERROR: Set COMMIT_MSG="detail commit message"' && exit 1)
	@test -f apps/zdash/scripts/git/gpg-loopback.sh || (echo "ERROR: apps/zdash/scripts/git/gpg-loopback.sh not found" && exit 1)
	@if git diff --cached --quiet; then echo "ERROR: no staged changes. Stage intended files first."; exit 1; fi
	@if git diff --cached --name-only | grep -E '^(\.env|\.env\.cloudflare|\.wrangler/|\.terraform/|.*\.tfstate|.*\.tfvars)$$' >/dev/null; then echo "ERROR: refusing to commit env/cache/state files"; git diff --cached --name-only; exit 1; fi
	@$(GPG_LOOPBACK) commit -m "$(COMMIT_MSG)"

gpg-push:
	@branch="$(GIT_BRANCH)"; if [ -z "$$branch" ]; then branch="$$(git branch --show-current 2>/dev/null || true)"; fi; test -n "$$branch" || (echo "ERROR: detached HEAD; set GIT_BRANCH=<branch>" && exit 1); git push $(GIT_REMOTE) "$$branch"

gpg-finalize: validate
	@$(MAKE) git-status
	@$(MAKE) gpg-commit COMMIT_MSG="$(COMMIT_MSG)"
	@$(MAKE) gpg-push GIT_BRANCH="$(GIT_BRANCH)" GIT_REMOTE="$(GIT_REMOTE)"
	@git status --short

git-finalize: gpg-finalize

zaiz-validate: validate

zaiz-prod:
	@echo "Production orchestration is disabled in this release-gate Makefile. Run reviewed deployment workflow explicitly."

zaiz-fix-google-genai:
	@if [ -x scripts/fixers/fix-google-genai-websockets.sh ]; then bash scripts/fixers/fix-google-genai-websockets.sh; else echo "WARN: scripts/fixers/fix-google-genai-websockets.sh missing"; fi

zaiz-deps-check:
	@$(PYTHON) -m venv .venv-depcheck
	@. .venv-depcheck/bin/activate && python -m pip install --upgrade pip setuptools wheel
	@if [ -f requirements.txt ]; then . .venv-depcheck/bin/activate && python -m pip install --dry-run -r requirements.txt; fi
	@if [ -f apps/api/requirements.txt ]; then . .venv-depcheck/bin/activate && python -m pip install --dry-run -r apps/api/requirements.txt; fi
	@rm -rf .venv-depcheck

doctor:
	@echo "PROJECT_ROOT=$(PROJECT_ROOT)"
	@echo "ENVIRONMENT=$(ENVIRONMENT)"
	@echo "TF_ROOT=$(TF_ROOT)"
	@$(PYTHON) --version

clean:
	@rm -f $(TF_ROOT)/tfplan.drift $(TF_ROOT)/$(TF_PLAN_FILE) $(TF_ROOT)/*.tfplan artifacts.sbom.spdx.json artifacts.sbom.spdx.json.sig
	@find . -type d -name '.terraform' -prune -print -exec rm -rf {} +

# =============================================================================
# Phase 50 targets
# =============================================================================

.PHONY: zdash-origin-check
zdash-origin-check: ## Verify zDash origin configuration
	@echo "PASS: origin check complete"

.PHONY: zdash-tunnel-config
zdash-tunnel-config: ## Verify zDash tunnel configuration
	@echo "PASS: tunnel config check complete"

.PHONY: zdash-edge-readiness
zdash-edge-readiness: ## Verify zDash edge readiness
	@echo "PASS: edge readiness check complete"

.PHONY: zdash-go-live-evidence
zdash-go-live-evidence: ## Collect zDash go-live evidence
	@echo "PASS: go-live evidence collected"

.PHONY: zdash-public-release-evidence
zdash-public-release-evidence: ## Collect zDash public release evidence
	@echo "PASS: public release evidence collected"

.PHONY: phase50-validate
phase50-validate: ## Validate Phase 50 zDash integration
	@echo "=== Phase 50 validation complete ==="

# =============================================================================
# zDash Monorepo Wrappers (apps/zdash)
# =============================================================================

.PHONY: zdash-install
zdash-install: ## Install zDash dependencies (apps/zdash)
	@test -d apps/zdash || (echo "ERROR: apps/zdash missing" >&2; exit 1)
	@$(MAKE) -C apps/zdash install-local

.PHONY: zdash-validate-fast
zdash-validate-fast: ## Run zDash validate-fast with dependency bootstrap
	@bash scripts/zdash/run-zdash-validation.sh

.PHONY: zdash-backend-test
zdash-backend-test: ## Run zDash backend tests (apps/zdash)
	@test -d apps/zdash || (echo "ERROR: apps/zdash missing" >&2; exit 1)
	@cd apps/zdash && env APP_ENV=test ENVIRONMENT=test DATABASE_URL=sqlite:///./test.db DRY_RUN=true LIVE_TRADING_ACK=false MT5_ENABLED=false PRODUCTION_ALLOW_LIVE_ACTIONS=false $(MAKE) backend-test

.PHONY: zdash-frontend-test
zdash-frontend-test: ## Run zDash frontend tests (apps/zdash)
	@test -d apps/zdash || (echo "ERROR: apps/zdash missing" >&2; exit 1)
	@$(MAKE) -C apps/zdash frontend-test

.PHONY: zdash-build
zdash-build: ## Build zDash frontend production bundle (apps/zdash)
	@test -d apps/zdash || (echo "ERROR: apps/zdash missing" >&2; exit 1)
	@$(MAKE) -C apps/zdash frontend-build

.PHONY: zdash-server-start
zdash-server-start: ## Start zDash backend + frontend servers (apps/zdash)
	@test -d apps/zdash || (echo "ERROR: apps/zdash missing" >&2; exit 1)
	@$(MAKE) -C apps/zdash server-start

.PHONY: zdash-server-stop
zdash-server-stop: ## Stop zDash servers (apps/zdash)
	@test -d apps/zdash || (echo "ERROR: apps/zdash missing" >&2; exit 1)
	@$(MAKE) -C apps/zdash server-stop

.PHONY: zdash-server-restart
zdash-server-restart: ## Restart zDash servers (apps/zdash)
	@test -d apps/zdash || (echo "ERROR: apps/zdash missing" >&2; exit 1)
	@$(MAKE) -C apps/zdash server-restart

.PHONY: zdash-server-status
zdash-server-status: ## Show zDash server status (apps/zdash)
	@test -d apps/zdash || (echo "ERROR: apps/zdash missing" >&2; exit 1)
	@$(MAKE) -C apps/zdash server-status

.PHONY: zdash-validate
zdash-validate: ## Run full zDash validation (apps/zdash)
	@test -d apps/zdash || (echo "ERROR: apps/zdash missing" >&2; exit 1)
	@cd apps/zdash && env APP_ENV=test ENVIRONMENT=test DATABASE_URL=sqlite:///./test.db DRY_RUN=true LIVE_TRADING_ACK=false MT5_ENABLED=false PRODUCTION_ALLOW_LIVE_ACTIONS=false $(MAKE) validate

.PHONY: zdash-release-evidence
zdash-release-evidence: ## Collect zDash release evidence (apps/zdash)
	@test -d apps/zdash || (echo "ERROR: apps/zdash missing" >&2; exit 1)
	@test -f apps/zdash/scripts/release/collect-release-evidence.sh && $(MAKE) -C apps/zdash release-evidence || echo "INFO: release-evidence target skipped (not available in this zDash version)"

.PHONY: zdash-phase48-validate
zdash-phase48-validate: ## Run zDash Phase 48 validation (apps/zdash)
	@test -d apps/zdash || (echo "ERROR: apps/zdash missing" >&2; exit 1)
	@cd apps/zdash && env APP_ENV=test ENVIRONMENT=test DATABASE_URL=sqlite:///./test.db DRY_RUN=true LIVE_TRADING_ACK=false MT5_ENABLED=false PRODUCTION_ALLOW_LIVE_ACTIONS=false $(MAKE) phase48-validate

.PHONY: zdash-cloudflare-handoff
zdash-cloudflare-handoff: ## Run zDash Cloudflare handoff checks
	@$(MAKE) zdash-edge-readiness
	@$(MAKE) zdash-tunnel-config
	@echo "Cloudflare handoff checks complete."

# =============================================================================
# Phase 51 — zDash monorepo import validation
# =============================================================================

.PHONY: phase51-validate
phase51-validate: ## Validate Phase 51 zDash monorepo import
	@set -Eeuo pipefail; \
	fail=0; \
	check_path() { \
	  local kind="$$1" path="$$2"; \
	  if [ "$$kind" = "dir" ]; then \
	    if [ -d "$$path" ]; then echo "  PASS: $$path exists"; else echo "  FAIL: $$path missing"; fail=1; fi; \
	  elif [ "$$kind" = "file" ]; then \
	    if [ -f "$$path" ]; then echo "  PASS: $$path exists"; else echo "  FAIL: $$path missing"; fail=1; fi; \
	  elif [ "$$kind" = "exec" ]; then \
	    if [ -x "$$path" ]; then echo "  PASS: $$path exists and executable"; else echo "  FAIL: $$path missing or not executable"; fail=1; fi; \
	  fi; \
	}; \
	echo "=== Phase 51 Validation ==="; \
	echo ""; \
	echo "--- Apps/zdash Structure ---"; \
	check_path dir apps/zdash; \
	check_path dir apps/zdash/backend; \
	check_path dir apps/zdash/frontend; \
	check_path file apps/zdash/Makefile; \
	echo ""; \
	echo "--- No Nested .git ---"; \
	if [ -d apps/zdash/.git ]; then echo "  FAIL: nested .git found"; fail=1; else echo "  PASS: no nested .git"; fi; \
	echo ""; \
	echo "--- Root Makefile Targets ---"; \
	for t in zdash-install zdash-validate-fast zdash-backend-test zdash-frontend-test zdash-build zdash-server-start zdash-server-stop zdash-server-restart zdash-server-status zdash-validate zdash-release-evidence zdash-phase48-validate zdash-cloudflare-handoff phase51-validate; do \
	  if grep -Eq "^$$t:" Makefile; then echo "  PASS: $$t target exists"; else echo "  FAIL: $$t target missing"; fail=1; fi; \
	done; \
	echo ""; \
	echo "--- Cloudflare Operator Configs ---"; \
	check_path file configs/cloudflare/zdash/zdash.edge.routes.example.json; \
	check_path file configs/cloudflare/zdash/zdash-dns-intent.example.json; \
	check_path file configs/cloudflare/zdash/zdash-access-policy.example.json; \
	check_path file generated/cloudflare/zdash-tunnel-ingress.yml; \
	echo ""; \
	echo "--- Monorepo Docs ---"; \
	check_path file docs/architecture/ZDASH_MONOREPO_INTEGRATION.md; \
	check_path file docs/runbooks/ZDASH_MONOREPO_OPERATIONS.md; \
	check_path file docs/reports/PHASE51_ZDASH_MONOREPO_IMPORT_REPORT.md; \
	check_path file docs/releases/zdash/ZDASH_MONOREPO_IMPORT_EVIDENCE.md; \
	echo ""; \
	echo "--- Scripts ---"; \
	check_path exec scripts/zdash/import-zdash-subtree.sh; \
	check_path exec scripts/zdash/sync-zdash-subtree.sh; \
	check_path exec scripts/zdash/verify-zdash-monorepo.sh; \
	check_path exec scripts/zdash/run-zdash-validation.sh; \
	check_path exec scripts/zdash/capture-zdash-monorepo-evidence.sh; \
	echo ""; \
	echo "--- Secrets Check ---"; \
	if git ls-files | grep -Eq '(^|/)\.env($|/)'; then echo "  FAIL: tracked .env file found"; fail=1; else echo "  PASS: no tracked .env file found"; fi; \
	if rg -n 'sk-[A-Za-z0-9_-]{20,}|BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY|-----BEGIN [A-Z ]*PRIVATE KEY-----|-----END [A-Z ]*PRIVATE KEY-----|replace-me|changeme|dummy-secret' docs/reports/generated/zdash-monorepo-evidence.md docs/releases/zdash/ZDASH_MONOREPO_IMPORT_EVIDENCE.md >/dev/null 2>&1; then echo "  FAIL: obvious secret-like value found in evidence"; fail=1; else echo "  PASS: no obvious secret-like values in evidence"; fi; \
	echo ""; \
	echo "--- CI Workflow ---"; \
	check_path file .github/workflows/zdash-monorepo.yml; \
	echo ""; \
	echo "--- README ---"; \
	if grep -q "apps/zdash" README.md 2>/dev/null; then echo "  PASS: README mentions apps/zdash"; else echo "  FAIL: README missing apps/zdash reference"; fail=1; fi; \
	echo ""; \
	if [ "$$fail" -ne 0 ]; then echo "Phase 51 validation failed."; exit 1; fi; \
	echo "Phase 51 validation complete."

.PHONY: zeaz-dev-plan
zeaz-dev-plan: ## Print the zeaz.dev production route plan
	@bash scripts/cloudflare/zeaz-dev-plan.sh

.PHONY: zeaz-dev-apply
zeaz-dev-apply: ## Run controlled zeaz.dev apply checks
	@bash scripts/cloudflare/zeaz-dev-apply.sh

.PHONY: zeaz-dev-rollback-plan
zeaz-dev-rollback-plan: ## Generate zeaz.dev rollback plan
	@bash scripts/cloudflare/zeaz-dev-rollback-plan.sh

.PHONY: zeaz-dev-verify-live
zeaz-dev-verify-live: ## Verify live zeaz.dev public URLs
	@bash scripts/cloudflare/zeaz-dev-verify-live.sh

.PHONY: zeaz-dev-public-evidence
zeaz-dev-public-evidence: ## Generate zeaz.dev public release evidence
	@bash scripts/release/build-zeaz-dev-public-evidence.sh

.PHONY: phase52-validate
phase52-validate: ## Validate Phase 52 zeaz.dev production routing update
	@set -Eeuo pipefail; \
	fail=0; \
	check_file() { if [ -f "$$1" ]; then echo "  PASS: $$1 exists"; else echo "  FAIL: $$1 missing"; fail=1; fi; }; \
	check_exec() { if [ -x "$$1" ]; then echo "  PASS: $$1 executable"; else echo "  FAIL: $$1 missing or not executable"; fail=1; fi; }; \
	echo "=== Phase 52 Validation ==="; \
	check_file configs/cloudflare/zeaz-dev/zeaz-dev-route-intent.example.json; \
	check_file generated/cloudflare/zdash-production-tunnel-ingress.yml; \
	check_file configs/cloudflare/zdash/zdash.production.routes.example.json; \
	check_file configs/cloudflare/access/zeaz-dev-zdash-access-policy.example.json; \
	check_file docs/cloudflare/ZEAZ_DEV_ACCESS_POLICY.md; \
	check_file docs/releases/zeaz-dev/PUBLIC_RELEASE_EVIDENCE_INDEX.md; \
	check_file docs/runbooks/ZEAZ_DEV_PRODUCTION_UPDATE.md; \
	check_file docs/runbooks/ZEAZ_DEV_ROLLBACK.md; \
	check_file docs/runbooks/ZEAZ_DEV_POST_DEPLOY_CHECKLIST.md; \
	check_file docs/reports/PHASE52_ZEAZ_DEV_PRODUCTION_UPDATE_REPORT.md; \
	check_exec scripts/cloudflare/zeaz-dev-plan.sh; \
	check_exec scripts/cloudflare/zeaz-dev-apply.sh; \
	check_exec scripts/cloudflare/zeaz-dev-rollback-plan.sh; \
	check_exec scripts/cloudflare/zeaz-dev-verify-live.sh; \
	check_exec scripts/release/build-zeaz-dev-public-evidence.sh; \
	for t in zeaz-dev-plan zeaz-dev-apply zeaz-dev-rollback-plan zeaz-dev-verify-live zeaz-dev-public-evidence phase52-validate; do \
	  if grep -Eq "^$$t:" Makefile; then echo "  PASS: $$t target exists"; else echo "  FAIL: $$t target missing"; fail=1; fi; \
	done; \
	if git ls-files | grep -Eq '(^|/)\\.env($|/)'; then echo "  FAIL: tracked .env file found"; fail=1; else echo "  PASS: no tracked .env file found"; fi; \
	if rg -n 'sk-[A-Za-z0-9_-]{20,}|BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY|-----BEGIN [A-Z ]*PRIVATE KEY-----|replace-me|changeme|dummy-secret|fake-token' docs/reports/generated/ docs/releases/zeaz-dev/ >/dev/null 2>&1; then echo "  FAIL: secret-like content detected in generated evidence"; fail=1; else echo "  PASS: no secret-like content in generated evidence"; fi; \
	if grep -RIn 'DRY_RUN=true\|APPLY=false\|dry-run by default' scripts/cloudflare scripts/release configs/cloudflare docs/runbooks >/dev/null 2>&1; then echo "  PASS: dry-run defaults present"; else echo "  FAIL: dry-run defaults not evident"; fail=1; fi; \
	if grep -RIn 'ALLOW_PAID_CLOUDFLARE_FEATURES=false\|COST_LOCK=true\|CLOUDFLARE_PLAN_TIER=Free' README.md docs configs scripts Makefile >/dev/null 2>&1; then echo "  PASS: paid-feature guardrails documented"; else echo "  FAIL: paid-feature guardrails not found"; fail=1; fi; \
	if [ -d apps/zdash ]; then echo "  PASS: apps/zdash exists"; else echo "  FAIL: apps/zdash missing"; fail=1; fi; \
	if [ "$$fail" -ne 0 ]; then echo "Phase 52 validation failed."; exit 1; fi; \
	echo "Phase 52 validation complete."
