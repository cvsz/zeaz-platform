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
GIT_BRANCH ?= $(shell git branch --show-current 2>/dev/null)
GPG_LOOPBACK ?= bash gpg-loopback.sh

TF_ROOT := terraform
TF_ENV_DIR := terraform/environments/$(ENVIRONMENT)
TOFU_ENV_DIR := opentofu/environments/$(ENVIRONMENT)
PYTEST := $(VENV_DIR)/bin/pytest
TF_ENV_WRAPPER := scripts/terraform/export-tf-vars.sh
ENV_NORMALIZER := scripts/cloudflare/clean-env-empty-values.sh

export PROJECT_ROOT ENVIRONMENT PYTHON TF_ROOT

.PHONY: help bootstrap setup setup-free setup-legacy generate-env-all refactor-cloudflare-vars refactor-cloudflare-vars-dry check-no-cf-vars env load-env docs-context upgrade-report validate validate-agent ci ci-validate validate-env validate-env-strict env-format-validate env-format-validate-local env-normalize-local maintenance test fmt fmt-check lint shellcheck yaml-validate policy-test sbom-generation sbom-validate security-validate secret-scan secret-scan-history tunnel-validation waf-validation waf-validate tf-init tf-fmt tf-fmt-check tf-validate tf-plan tf-plan-out tf-apply tf-apply-plan tf-destroy tf-state-rm-waf tf-env-init tf-env-validate tf-env-plan tofu-init tofu-validate tofu-plan drift drift-detect token-clean token-verify token-verify-strict token-rotate-dry token-rotate token-rotate-refresh security-scan sbom cosign-sign doctor clean workflow-policy workflow-validate gitops-validate git-status gpg-commit gpg-push gpg-finalize git-finalize zaiz-validate zaiz-prod zaiz-fix-google-genai zaiz-deps-check

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
	@if command -v gitleaks >/dev/null 2>&1; then gitleaks detect --no-git --config security/gitleaks.toml --source . --redact; else echo "WARN: gitleaks not installed; skipped gitleaks scan"; fi

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
	@test -f gpg-loopback.sh || (echo "ERROR: gpg-loopback.sh not found" && exit 1)
	@if git diff --cached --quiet; then echo "ERROR: no staged changes. Stage intended files first."; exit 1; fi
	@if git diff --cached --name-only | grep -E '^(\.env|\.env\.cloudflare|\.wrangler/|\.terraform/|.*\.tfstate|.*\.tfvars)$$' >/dev/null; then echo "ERROR: refusing to commit env/cache/state files"; git diff --cached --name-only; exit 1; fi
	@$(GPG_LOOPBACK) commit -m "$(COMMIT_MSG)"

gpg-push:
	@branch="$(GIT_BRANCH)"; test -n "$$branch" || (echo "ERROR: detached HEAD; set GIT_BRANCH=<branch>" && exit 1); git push $(GIT_REMOTE) "$$branch"

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
