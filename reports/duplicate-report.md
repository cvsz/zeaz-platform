# ZEAZ PLATFORM OMEGA - Duplicate Cleanup Report

## Duplication Analysis

### 1. Infrastructure as Code (IaC)
- **Terraform vs OpenTofu**: The repository contains both `terraform/` and `opentofu/` directories with similar backend templates and module structures.
- **Root Folders**: `infra/` and `infrastructure/` coexist, creating confusion over the definitive infrastructure source.

### 2. Cloudflare & DNS Configurations
- **Configs**: `configs/cloudflare/` overlaps with Terraform definitions in `opentofu/modules/cloudflare-*`.
- **DNS**: `dns/records.yaml` duplicates state that should be managed exclusively by Terraform.
- **Generated**: `generated/cloudflare/` contains tunnel ingress rules that should be dynamically managed via IaC.

### 3. Container Management (Docker Compose)
- **Compose Files**: 
  - Root `docker-compose.yml`
  - `compose/` directory with `core.yaml`, `edge.yaml`, `trading.yaml`, etc.
  - Sub-app compose files (`apps/zdash/docker-compose.yml`, `apps/zLinebot/docker-compose.yml`, etc.)
  - Infra compose files (`infra/cloudflare/compose.yaml`, `infra/observability/compose.yaml`)

### 4. CI/CD Workflows
- **GitHub Actions**: `.github/workflows/` contains multiple overlapping validation and apply pipelines:
  - `terraform-apply.yml`, `terraform-plan.yml`, `terraform-validate.yml`
  - `validate.yml`, `tunnel-validation.yml`, `waf-validation.yml`
  - These should be consolidated into a few reusable workflows (`.github/workflows/reusable/`).

### 5. Identity & Runtime
- **Authentik**: Duplicated setup found in `infra/authentik/` and `runtime/authentik/`.
- **Scripts**: Multiple duplicate bash installation scripts across `apps/` subdirectories.

## Recommended Cleanup Actions
- [ ] Archive `opentofu/` to `legacy/` and standardize on `terraform/`.
- [ ] Merge `infra/` and `infrastructure/` and move into `terraform/environments/`.
- [ ] Remove `dns/records.yaml` and migrate to `terraform/cloudflare/dns`.
- [ ] Consolidate all GitHub Actions into reusable workflows.
- [ ] Centralize Docker Compose templates under `infra/`.
