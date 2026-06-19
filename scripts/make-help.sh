#!/usr/bin/env bash
set -Eeuo pipefail

cat <<'HELP'
zeaz-platform Make Targets

Bootstrap:
  make bootstrap              Install/check local tools and Python venv
  make setup                  Alias for setup-free; safe Free/no-cost bootstrap
  make setup-free             Generate/preserve .env with Free/no-cost defaults
  make generate-env-all       Generate complete .env skeleton with local secrets
  make setup-legacy           Run legacy setup script; may perform Terraform init
  make env                    Load environment only; no strict validation
  make load-env               Load Cloudflare env helper
  make docs-context           Cache Cloudflare LLM docs context locally
  make upgrade-report         Generate reports/project-upgrade-report.md

Migration:
  make refactor-cloudflare-vars-dry  Preview short env-name to CLOUDFLARE_* changes
  make refactor-cloudflare-vars      Apply short env-name to CLOUDFLARE_* migration
  make check-no-cf-vars              Fail if active tracked short Cloudflare env names remain

Validation:
  make validate               Run source checks; deployment env is advisory
  make validate-agent         CI-safe validation without secrets
  make ci                     Alias for validate
  make validate-env           Advisory env check; does not fail on missing secrets
  make validate-env-strict    Strict deployment env validator; requires real values
  make env-format-validate    CI-safe env format check for .env.example only
  make env-format-validate-local
                              Local env format check for .env, .env.cloudflare, and .env.example when present
  make env-normalize-local    Normalize local .env and .env.cloudflare when present
  make maintenance            Run scripts/environments/maintenance.sh validate
  make test                   Run pytest suite
  make fmt                    Terraform fmt recursive
  make fmt-check              Terraform fmt check recursive
  make lint                   Run shellcheck, YAML validation, and TFLint when installed
  make shellcheck             Run shellcheck through find/xargs for workflow-policy compatibility
  make yaml-validate          Validate YAML files with repository ignore rules

Security:
  make secret-scan            Run tracked-file gitleaks release gate
  make secret-scan-history    Run full git-history gitleaks scan for remediation work
  make security-scan          Run aggregate advisory scanner script when present
  make agent-scan             Run Snyk Agent Scan wrapper with repo-safe defaults
  make policy-test            Validate workflow policy rules
  make sbom                   Generate SBOM when syft is installed
  make cosign-sign            Sign SBOM when cosign and SBOM artifact exist

Supabase AI tools:
  make supabase-docs-context  Cache Supabase llms.txt and guides context locally
  make supabase-mcp-check     Validate Supabase MCP env without printing secrets
  make supabase-mcp-config    Write local .agent/supabase-mcp.json with token placeholder
  make supabase-ai-tools      Run docs cache and MCP env validation

Terraform root:
  make tf-init                Load scoped env, then terraform -chdir=terraform init
  make tf-validate            Init, then terraform -chdir=terraform validate
  make tf-plan                Init, then terraform -chdir=terraform plan
  make tf-plan-out            Save plan to terraform/$(TF_PLAN_FILE), default tfplan
  make tf-apply-plan          Guarded in release-gate Makefile; use reviewed deployment workflow
  make tf-apply               Guarded in release-gate Makefile; use reviewed deployment workflow
  make tf-destroy             Guarded in release-gate Makefile; use reviewed deployment workflow
  make tf-state-rm-waf        Guarded in release-gate Makefile; use reviewed deployment workflow
  make drift                  Run terraform plan -detailed-exitcode; exits 2 on drift

Terraform options:
  TF_PLAN_FILE=myplan         Override saved plan file name
  TF_ARGS='-refresh=false'    Pass extra args to init/plan/apply/destroy/drift

Terraform env roots:
  make tf-env-init ENVIRONMENT=prod
  make tf-env-validate ENVIRONMENT=prod
  make tf-env-plan ENVIRONMENT=prod

OpenTofu:
  make tofu-init              Init OpenTofu env if tofu exists
  make tofu-validate          Validate OpenTofu env if tofu exists
  make tofu-plan              Plan OpenTofu env if tofu exists

Tokens:
  make token-clean            Dry-run token cleanup
  make token-verify           Verify Cloudflare token env without printing token values
  make token-verify-strict    Strict token verification; fails on invalid token
  make token-rotate-dry       Dry-run token regeneration with permission preflight
  make token-rotate           Guarded; run live rotation from reviewed local shell
  make token-rotate-refresh   Alias for token-rotate-dry

Git finalization:
  make git-status             Print git status --short
  make gpg-commit COMMIT_MSG="message"
                              Commit staged changes with bash gpg-loopback.sh only
  make gpg-push               Push current branch to origin; set GIT_BRANCH when detached
  make gpg-finalize COMMIT_MSG="message"
                              Run validate, gpg commit, push, and final status
  make git-finalize COMMIT_MSG="message"
                              Alias for gpg-finalize

Release gate:
  make zaiz-validate          Alias for validate
  make zaiz-prod              Disabled in release-gate Makefile; use reviewed deployment workflow
  make zaiz-fix-google-genai  Run google-genai/websockets fixer if present
  make zaiz-deps-check        Dry-run Python dependency resolution in temp venv

General:
  make doctor                 Print local tool/runtime inventory
  make clean                  Remove Terraform plans, SBOM artifacts, and .terraform dirs
HELP
