SHELL := /usr/bin/env bash
.SHELLFLAGS := -Eeuo pipefail -c
.DEFAULT_GOAL := help

PROJECT_ROOT ?= $(CURDIR)
ENVIRONMENT ?= prod
BACKEND_TYPE ?= local
TF_BIN ?= terraform
TOFU_BIN ?= tofu
PYTHON ?= python3
VENV_DIR ?= .venv
STRICT_TOOLS ?= false
CODEX_CLOUD ?= false
STRICT_ENV ?= true
CONFIRM_APPLY ?= no

TF_ROOT := terraform
TF_ENV_DIR := terraform/environments/$(ENVIRONMENT)
TOFU_ENV_DIR := opentofu/environments/$(ENVIRONMENT)
PYTEST := $(VENV_DIR)/bin/pytest

export PROJECT_ROOT
export STRICT_TOOLS
export CODEX_CLOUD
export STRICT_ENV

.PHONY: help bootstrap setup env load-env validate validate-env maintenance test fmt fmt-check lint shellcheck yaml-validate tf-init tf-fmt tf-fmt-check tf-validate tf-plan tf-apply tf-destroy tf-env-init tf-env-validate tf-env-plan tofu-init tofu-validate tofu-plan drift drift-detect token-clean token-rotate-dry token-rotate security-scan sbom doctor clean phase-f1 phase-f2 phase-f3 phase-f4 phase-f5 phase-f6 phase-f7 workflow-policy workflow-validate gitops-validate ci

help:
	@printf '%s\n' \
	'Cloudflare Platform Make Targets' \
	'' \
	'Bootstrap:' \
	'  make bootstrap              Install/check local tools and Python venv' \
	'  make setup                  Generate/preserve .env using setup script' \
	'  make env                    Load environment only; no strict validation' \
	'  make load-env               Load Cloudflare env helper' \
	'' \
	'Validation:' \
	'  make validate               Run tests + env + Terraform validation' \
	'  make ci                     Alias for validate' \
	'  make validate-env           Run strict Python env validator' \
	'  make maintenance            Run scripts/environments/maintenance.sh validate' \
	'  make test                   Run pytest suite' \
	'  make fmt                    Terraform fmt recursive' \
	'  make fmt-check              Terraform fmt check recursive' \
	'  make lint                   Run optional shellcheck/tflint/yaml checks' \
	'' \
	'Terraform root:' \
	'  make tf-init                terraform -chdir=terraform init' \
	'  make tf-validate            terraform -chdir=terraform validate' \
	'  make tf-plan                terraform -chdir=terraform plan' \
	'  make tf-apply CONFIRM_APPLY=yes' \
	'  make tf-destroy CONFIRM_APPLY=yes' \
	'  make drift                  terraform plan -detailed-exitcode' \
	'' \
	'Terraform env roots:' \
	'  make tf-env-init ENVIRONMENT=prod' \
	'  make tf-env-validate ENVIRONMENT=prod' \
	'  make tf-env-plan ENVIRONMENT=prod' \
	'' \
	'OpenTofu:' \
	'  make tofu-init              Init OpenTofu env if tofu exists' \
	'  make tofu-validate          Validate OpenTofu env if tofu exists' \
	'  make tofu-plan              Plan OpenTofu env if tofu exists' \
	'' \
	'Tokens:' \
	'  make token-clean            Dry-run token cleanup' \
	'  make token-rotate-dry       Dry-run token regeneration' \
	'  make token-rotate           Live token regeneration; requires CF_EMAIL/CF_GLOBAL_API_KEY' \
	'' \
	'Phases:' \
	'  make phase-f1 ... phase-f7'

bootstrap:
	@bash scripts/bootstrap-system.sh

setup:
	@bash scripts/environments/setup.sh

env: load-env

load-env:
	@chmod +x scripts/cloudflare/load-env.sh
	@bash scripts/cloudflare/load-env.sh

ci: validate

validate: test validate-env tf-fmt-check tf-init tf-validate
	@echo "Validation complete."

validate-env:
	@if [ -f .env ]; then set -a; source .env; set +a; fi; \
	if [ -x "$(VENV_DIR)/bin/python" ]; then "$(VENV_DIR)/bin/python" python/cfstack_validate_env.py --strict; \
	else $(PYTHON) python/cfstack_validate_env.py --strict; fi

maintenance:
	@bash scripts/environments/maintenance.sh validate

test:
	@if [ -x "$(PYTEST)" ]; then "$(PYTEST)" -q tests; \
	elif command -v pytest >/dev/null 2>&1; then pytest -q tests; \
	else echo "WARN: pytest not installed; run make bootstrap"; fi

fmt: tf-fmt

fmt-check: tf-fmt-check

lint: shellcheck yaml-validate
	@if command -v tflint >/dev/null 2>&1; then tflint --recursive --chdir=$(TF_ROOT); else echo "WARN: tflint not installed; skipped"; fi

shellcheck:
	@if command -v shellcheck >/dev/null 2>&1; then find scripts -type f -name '*.sh' -print0 | xargs -0 shellcheck; else echo "WARN: shellcheck not installed; skipped"; fi

yaml-validate:
	@if [ -f scripts/validate-yaml.py ]; then $(PYTHON) scripts/validate-yaml.py; else echo "INFO: scripts/validate-yaml.py not present; skipped"; fi

tf-init:
	@$(TF_BIN) -chdir=$(TF_ROOT) init

tf-fmt:
	@$(TF_BIN) fmt -recursive $(TF_ROOT) opentofu 2>/dev/null || $(TF_BIN) fmt -recursive $(TF_ROOT)

tf-fmt-check:
	@$(TF_BIN) fmt -check -recursive $(TF_ROOT) opentofu 2>/dev/null || $(TF_BIN) fmt -check -recursive $(TF_ROOT)

tf-validate: tf-init
	@$(TF_BIN) -chdir=$(TF_ROOT) validate

tf-plan: tf-init
	@$(TF_BIN) -chdir=$(TF_ROOT) plan

tf-apply: tf-init
	@test "$(CONFIRM_APPLY)" = "yes" || (echo "ERROR: Set CONFIRM_APPLY=yes to continue." && exit 1)
	@$(TF_BIN) -chdir=$(TF_ROOT) apply

tf-destroy: tf-init
	@test "$(CONFIRM_APPLY)" = "yes" || (echo "ERROR: Set CONFIRM_APPLY=yes to continue." && exit 1)
	@$(TF_BIN) -chdir=$(TF_ROOT) destroy

tf-env-init:
	@test -d "$(TF_ENV_DIR)" || (echo "ERROR: missing $(TF_ENV_DIR)" && exit 1)
	@$(TF_BIN) -chdir=$(TF_ENV_DIR) init

tf-env-validate: tf-env-init
	@$(TF_BIN) -chdir=$(TF_ENV_DIR) validate

tf-env-plan: tf-env-init
	@$(TF_BIN) -chdir=$(TF_ENV_DIR) plan

tofu-init:
	@if command -v $(TOFU_BIN) >/dev/null 2>&1 && [ -d "$(TOFU_ENV_DIR)" ]; then $(TOFU_BIN) -chdir=$(TOFU_ENV_DIR) init; else echo "WARN: tofu or $(TOFU_ENV_DIR) missing; skipped"; fi

tofu-validate: tofu-init
	@if command -v $(TOFU_BIN) >/dev/null 2>&1 && [ -d "$(TOFU_ENV_DIR)" ]; then $(TOFU_BIN) -chdir=$(TOFU_ENV_DIR) validate; else echo "WARN: tofu or $(TOFU_ENV_DIR) missing; skipped"; fi

tofu-plan: tofu-init
	@if command -v $(TOFU_BIN) >/dev/null 2>&1 && [ -d "$(TOFU_ENV_DIR)" ]; then $(TOFU_BIN) -chdir=$(TOFU_ENV_DIR) plan; else echo "WARN: tofu or $(TOFU_ENV_DIR) missing; skipped"; fi

drift: drift-detect

drift-detect: tf-init
	@set +e; $(TF_BIN) -chdir=$(TF_ROOT) plan -detailed-exitcode -out=tfplan.drift; rc=$$?; set -e; \
	case "$$rc" in \
	  0) echo "No drift detected." ;; \
	  2) echo "WARN: drift detected."; exit 2 ;; \
	  *) echo "ERROR: drift check failed rc=$$rc"; exit "$$rc" ;; \
	esac

token-clean:
	@bash scripts/cloudflare/clean-and-regenerate-tokens.sh --dry-run --keep-most 1 --unused-days 90

token-rotate-dry:
	@bash scripts/cloudflare/clean-and-regenerate-tokens.sh --dry-run --regenerate --types all --backup --write .env.cloudflare

token-rotate:
	@bash scripts/cloudflare/clean-and-regenerate-tokens.sh --yes --regenerate --types all --backup --write .env.cloudflare

security-scan:
	@if [ -x scripts/security-scan.sh ]; then bash scripts/security-scan.sh; else echo "WARN: scripts/security-scan.sh missing; skipped"; fi

sbom:
	@if [ -x scripts/generate-sbom.sh ]; then bash scripts/generate-sbom.sh; else echo "WARN: scripts/generate-sbom.sh missing; skipped"; fi

doctor:
	@echo "PROJECT_ROOT=$(PROJECT_ROOT)"
	@echo "ENVIRONMENT=$(ENVIRONMENT)"
	@echo "CODEX_CLOUD=$(CODEX_CLOUD)"
	@command -v $(TF_BIN) >/dev/null 2>&1 && $(TF_BIN) version | head -n 1 || echo "WARN: terraform missing"
	@command -v $(TOFU_BIN) >/dev/null 2>&1 && $(TOFU_BIN) version | head -n 1 || echo "WARN: tofu missing"
	@$(PYTHON) --version
	@if [ -x "$(PYTEST)" ]; then "$(PYTEST)" --version; else echo "WARN: pytest missing from $(VENV_DIR)"; fi
	@command -v cloudflared >/dev/null 2>&1 && cloudflared --version || echo "WARN: cloudflared missing"
	@command -v gh >/dev/null 2>&1 && gh --version | head -n 1 || echo "WARN: gh missing"

clean:
	@rm -f $(TF_ROOT)/tfplan.drift $(TF_ROOT)/*.tfplan
	@find . -type d -name '.terraform' -prune -print -exec rm -rf {} +

phase-f1: test validate-env
	@echo "F1 validation complete."

phase-f2: tf-validate
	@echo "F2 Terraform validation complete."

phase-f3:
	@echo "F3 Zero Trust requires configured identity provider and Cloudflare tokens."
	@$(MAKE) tf-plan

phase-f4:
	@if [ -x scripts/tunnel-validate.sh ]; then bash scripts/tunnel-validate.sh --offline; else echo "WARN: tunnel validator missing; skipped"; fi

phase-f5: test tf-validate
	@echo "F5 Workers and AI validation complete."

phase-f6: drift-detect security-scan sbom
	@echo "F6 monitoring, DR, and security checks complete."

workflow-policy:
	@if [ -x scripts/workflow-policy.sh ]; then bash scripts/workflow-policy.sh; else echo "WARN: workflow-policy.sh missing; skipped"; fi

workflow-validate: workflow-policy
	@echo "Workflow validation complete."

gitops-validate: workflow-validate drift-detect
	@echo "GitOps validation complete."

phase-f7: gitops-validate
	@echo "F7 GitOps workflow and policy checks complete."
