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

export PROJECT_ROOT
export ENVIRONMENT
export PYTHON
export TF_ROOT

.PHONY: help bootstrap setup setup-free setup-legacy generate-env-all refactor-cloudflare-vars refactor-cloudflare-vars-dry check-no-cf-vars env load-env docs-context upgrade-report validate validate-agent ci ci-validate validate-env validate-env-strict env-format-validate maintenance test fmt fmt-check lint shellcheck yaml-validate policy-test sbom-generation sbom-validate security-validate secret-scan tunnel-validation waf-validation waf-validate tf-init tf-fmt tf-fmt-check tf-validate tf-plan tf-plan-out tf-apply tf-apply-plan tf-destroy tf-state-rm-waf tf-env-init tf-env-validate tf-env-plan tofu-init tofu-validate tofu-plan drift drift-detect token-clean token-verify token-verify-strict token-rotate-dry token-rotate token-rotate-refresh security-scan sbom cosign-sign doctor clean phase-f1 phase-f2 phase-f3 phase-f4 phase-f5 phase-f6 phase-f7 workflow-policy workflow-validate gitops-validate health-zveo health-zwallet health-platform ssh-origin-setup ssh-origin-health ssh-route ssh-public-health backup-platform install-platform-ops

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

ci-validate: test env-format-validate yaml-validate check-no-cf-vars tf-fmt-check tf-init tf-validate
	@echo "CI validation complete."

validate: test validate-env env-format-validate yaml-validate check-no-cf-vars tf-fmt-check tf-init tf-validate
	@echo "Validation complete."

validate-env:
	@bash scripts/env-report-check.sh advisory

validate-env-strict:
	@bash scripts/env-report-check.sh strict

env-format-validate:
	@$(PYTHON) scripts/validate-env-files.py .env.example

maintenance:
	@bash scripts/environments/maintenance.sh validate

test:
	@if [ -x "$(PYTEST)" ]; then "$(PYTEST)" -q tests; \
	elif command -v pytest >/dev/null 2>&1; then pytest -q tests; \
	else echo "WARN: pytest not installed; run make bootstrap"; fi

lint:
	@bash scripts/make-lint.sh

shellcheck:
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

phase-f1: test validate-env
	@echo "F1 validation complete."

phase-f2: tf-validate
	@echo "F2 Terraform validation complete."

phase-f3:
	@echo "F3 Zero Trust requires configured identity provider and Cloudflare tokens."
	@$(MAKE) tf-plan

phase-f4: tunnel-validation
	@echo "F4 tunnel validation complete."

phase-f5: test tf-validate
	@echo "F5 Workers and AI validation complete."

phase-f6: drift-detect security-scan sbom
	@echo "F6 monitoring, DR, and security checks complete."

phase-f7: gitops-validate
	@echo "F7 GitOps workflow and policy checks complete."
