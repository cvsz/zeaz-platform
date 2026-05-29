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
  make lint                   Run optional shellcheck/tflint/yaml checks

Zeaz platform ops:
  make health-zveo            Run ZVEO health checks
  make health-zwallet         Run zWallet health checks
  make health-platform        Run full platform health checks
  make ssh-origin-setup       Configure hardened SSH origin on 127.0.0.1:22022
  make ssh-origin-health      Check local SSH origin readiness
  make ssh-route              Upsert or print Cloudflare SSH route instructions
  make ssh-public-health      Check client/public Cloudflare Access SSH readiness
  make backup-platform        Run platform backup script
  make install-platform-ops   Install ops scripts into /usr/local/bin

Terraform root:
  make tf-init                Load scoped env, then terraform -chdir=terraform init
  make tf-validate            Init, then terraform -chdir=terraform validate
  make tf-plan                Init, then terraform -chdir=terraform plan
  make tf-plan-out            Save plan to terraform/$(TF_PLAN_FILE), default tfplan
  make tf-apply-plan CONFIRM_APPLY=yes
                              Apply saved terraform/$(TF_PLAN_FILE)
  make tf-apply CONFIRM_APPLY=yes
                              Auto-approve direct apply after explicit confirmation
  make tf-destroy CONFIRM_APPLY=yes
                              Auto-approve destroy after explicit confirmation
  make tf-state-rm-waf CONFIRM_APPLY=yes
                              Remove module.waf resources from Terraform state only
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
  make token-rotate           Live token regeneration; writes .env.cloudflare

Compatibility:
  make secret-scan            Run gitleaks-only scan when available
  make policy-test sbom-generation security-validate tunnel-validation waf-validation waf-validate

Phases:
  make phase-f1 ... phase-f7
HELP
