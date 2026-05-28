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
  make refactor-cloudflare-vars-dry  Preview CF_* to CLOUDFLARE_* changes
  make refactor-cloudflare-vars      Apply CF_* to CLOUDFLARE_* tracked-file migration
  make check-no-cf-vars              Fail if active tracked CF_* env names remain

Validation:
  make validate               Run source checks; deployment env is advisory
  make validate-agent         CI-safe validation without secrets
  make ci                     Alias for validate
  make validate-env           Advisory env check; does not fail on missing secrets
  make validate-env-strict    Strict deployment env validator; requires real values
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
  make tf-init                terraform -chdir=terraform init
  make tf-validate            terraform -chdir=terraform validate
  make tf-plan                terraform -chdir=terraform plan
  make tf-plan-out            terraform plan -out=TF_PLAN_FILE
  make tf-apply-plan CONFIRM_APPLY=yes
  make tf-state-rm-waf CONFIRM_APPLY=yes
  make tf-apply CONFIRM_APPLY=yes
  make tf-destroy CONFIRM_APPLY=yes
  make drift                  terraform plan -detailed-exitcode

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
  make token-rotate-dry       Dry-run token regeneration
  make token-rotate           Live token regeneration; requires CLOUDFLARE_BOOTSTRAP_TOKEN and CLOUDFLARE_ZONE_ID

Compatibility:
  make secret-scan            Run gitleaks-only scan when available
  make policy-test sbom-generation security-validate tunnel-validation waf-validation waf-validate

Phases:
  make phase-f1 ... phase-f7
HELP
