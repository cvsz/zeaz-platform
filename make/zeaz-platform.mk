# Zeaz Platform Terraform and health helper targets.
# Usage from repo root:
#   make -f Makefile -f make/zeaz-platform.mk platform-tf-plan
#   make -f Makefile -f make/zeaz-platform.mk platform-tf-apply CONFIRM_APPLY=yes

PLATFORM_TF_PLAN_FILE ?= zeaz-platform.tfplan

.PHONY: \
	platform-health \
	platform-health-zveo \
	platform-health-zwallet \
	platform-backup \
	platform-tf-init \
	platform-tf-fmt \
	platform-tf-plan \
	platform-tf-plan-save \
	platform-tf-apply \
	platform-tf-apply-plan \
	platform-tf-drift \
	platform-tf-state-dns \
	platform-tf-import-dns \
	platform-tf-output \
	platform-tf-clean-plans

platform-health: health-platform

platform-health-zveo: health-zveo

platform-health-zwallet: health-zwallet

platform-backup: backup-platform

platform-tf-init:
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) init

platform-tf-fmt:
	@$(TF_BIN) fmt -recursive $(TF_ROOT)

platform-tf-plan: platform-tf-init
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) plan -input=false

platform-tf-plan-save: platform-tf-init
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) plan -input=false -out=$(PLATFORM_TF_PLAN_FILE)
	@echo "Saved platform Terraform plan: $(TF_ROOT)/$(PLATFORM_TF_PLAN_FILE)"

platform-tf-apply: platform-tf-init
	@test "$(CONFIRM_APPLY)" = "yes" || (echo "ERROR: Set CONFIRM_APPLY=yes to continue." && exit 1)
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) apply -input=false

platform-tf-apply-plan:
	@test "$(CONFIRM_APPLY)" = "yes" || (echo "ERROR: Set CONFIRM_APPLY=yes to continue." && exit 1)
	@test -f "$(TF_ROOT)/$(PLATFORM_TF_PLAN_FILE)" || (echo "ERROR: missing saved plan $(TF_ROOT)/$(PLATFORM_TF_PLAN_FILE). Run: make -f Makefile -f make/zeaz-platform.mk platform-tf-plan-save" && exit 1)
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) apply -input=false $(PLATFORM_TF_PLAN_FILE)

platform-tf-drift: platform-tf-init
	@set +e; bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) plan -input=false -detailed-exitcode -out=$(PLATFORM_TF_PLAN_FILE).drift; rc=$$?; set -e; \
	case "$$rc" in \
	  0) echo "No platform Terraform drift detected." ;; \
	  2) echo "WARN: platform Terraform drift detected."; exit 2 ;; \
	  *) echo "ERROR: platform Terraform drift check failed rc=$$rc"; exit "$$rc" ;; \
	esac

platform-tf-state-dns:
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) state list | grep -E 'cloudflare_record\.(tunnel_cname|records)|module\.dns\.cloudflare_record' || true

platform-tf-import-dns:
	@bash $(TF_ENV_WRAPPER) bash ops/scripts/import-existing-tunnel-dns.sh

platform-tf-output:
	@bash $(TF_ENV_WRAPPER) $(TF_BIN) -chdir=$(TF_ROOT) output

platform-tf-clean-plans:
	@rm -f $(TF_ROOT)/$(PLATFORM_TF_PLAN_FILE) $(TF_ROOT)/$(PLATFORM_TF_PLAN_FILE).drift
