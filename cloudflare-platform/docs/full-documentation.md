# Cloudflare Platform — Full Project Documentation

## 1) Purpose and Scope
This repository implements an enterprise-grade Cloudflare platform with Terraform/OpenTofu-compatible infrastructure definitions, environment validation, drift detection, backup/restore, and security automation for Zero Trust, DNS, Workers, WAF, API Shield, R2, D1, and Tunnels.

The repository is organized to support:
- Deterministic deployments through version-pinned IaC and validated variables.
- GitOps workflows through environment-scoped Terraform entrypoints.
- Least-privilege Cloudflare API token segmentation.
- Observability through structured JSON script logging and deterministic checks.
- Rollback and disaster-recovery support through state-aware workflows and backup/restore scripts.

---

## 2) Repository Structure

- `cloudflare-platform/Makefile`: Primary operator entrypoint for validate/plan/apply/drift/test/backup/restore workflows.
- `cloudflare-platform/scripts/`: Operational automation for validation, install/apply orchestration, drift detection, token controls, rotation, backend rendering, repair, and lifecycle operations.
- `cloudflare-platform/scripts/contracts/environment-contract.json`: Contract definition used for environment governance.
- `cloudflare-platform/terraform/`: Root Terraform composition and providers.
- `cloudflare-platform/terraform/envs/{dev,staging,prod}/`: Environment overlays and tfvars examples.
- `cloudflare-platform/terraform/modules/`: Reusable Cloudflare modules.
- `cloudflare-platform/secrets/bootstrap.env.example`: Baseline environment variable template.
- `cloudflare-platform/docs/plan-matrix.md`: Plan-tier capability mapping.

---

## 3) Core Platform Capabilities

### 3.1 Security-first enforcement
- API token scope validation is executed by `scripts/validate-token-scopes.sh` via `scripts/validate.sh`.
- Mandatory environment variable checks and format validation are enforced before provisioning.
- TLS and identity metadata URL constraints are validated (`https://` required).
- Secret rotation automation is included through `scripts/rotate-secrets.sh` and Cloudflare token rotation helpers.

### 3.2 Drift detection
- `scripts/drift-detect.sh` runs `terraform plan -detailed-exitcode`.
- Exit code interpretation:
  - `0`: no drift.
  - `2`: drift detected.
  - `1`: plan failure requiring remediation.

### 3.3 Rollback and recoverability
- `scripts/backup.sh` and `scripts/restore.sh` support backup/restore workflows.
- `scripts/repair.sh` and `scripts/uninstall.sh` support controlled remediation and lifecycle rollback operations.

### 3.4 Observability
- Script-level logs use JSON shape with timestamp/level/message for machine-parsable pipeline telemetry.
- Validation trap handlers provide explicit failing line observability.

### 3.5 GitOps compatibility
- Environment isolation exists under `terraform/envs/dev`, `terraform/envs/staging`, and `terraform/envs/prod`.
- CI/CD can map branch or tag policy directly onto `make plan ENV=...` and `make apply ENV=...` gates.

---

## 4) Supported Environments and Promotion

### Environments
- `dev`: rapid validation and integration testing.
- `staging`: pre-production verification and policy hardening.
- `prod`: production change control.

### Promotion model
1. Commit changes to Terraform modules/root definitions.
2. Run `make validate`.
3. Run `make plan ENV=dev`; apply if approved.
4. Promote unchanged artifact/config commit to `staging` and then `prod` with plan/apply gates.
5. Run `make drift ENV=prod` on schedule for governance.

---

## 5) Operational Runbook

From repository root `cloudflare-platform`:

```bash
make validate
make plan ENV=dev
make apply ENV=dev
make drift ENV=dev
make backup
make restore
```

### Make targets
- `validate`: runs platform variable and token validation.
- `plan`: runs planned infrastructure changes for selected environment.
- `apply`: applies reviewed Terraform plan.
- `drift`: checks unmanaged drift.
- `backup` / `restore`: executes resilience workflows.
- `contract`: verifies environment contract presence.
- `plan-tier`: auto-detects Cloudflare plan tier.
- `backend`: renders backend configuration.
- `sops-bootstrap`: bootstraps SOPS prerequisites.

---

## 6) Required Runtime Variables

Validation enforces all of the following as required:

- `CF_ACCOUNT_ID`
- `CF_ZONE_ID`
- `CF_API_TOKEN`
- `CF_DNS_TOKEN`
- `CF_WORKERS_TOKEN`
- `CF_ZT_TOKEN`
- `CF_WAF_TOKEN`
- `CF_TUNNEL_TOKEN`
- `CF_R2_TOKEN`
- `IDENTITY_PROVIDER_TYPE`
- `IDENTITY_PROVIDER_VENDOR`
- `IDENTITY_PROVIDER_METADATA_URL`
- `ENVIRONMENT`
- `REGION`
- `PRIMARY_DOMAIN`
- `ORIGIN_INFRA_TYPE`
- `ORIGIN_HOSTS`
- `TERRAFORM_BACKEND_TYPE`
- `TERRAFORM_STATE_BUCKET`
- `TERRAFORM_LOCK_TABLE`
- `SOPS_AGE_KEY`
- `SECRET_ROTATION_INTERVAL`
- `CLOUDFLARE_PLAN_TIER`

### Validation semantics
- `CF_ACCOUNT_ID` / `CF_ZONE_ID`: must be 32-char lowercase hex.
- `PRIMARY_DOMAIN`: lowercase domain-safe pattern.
- `IDENTITY_PROVIDER_METADATA_URL`: must be HTTPS.
- `SECRET_ROTATION_INTERVAL`: must match `<number>d`.
- `IDENTITY_PROVIDER_TYPE`: `saml` or `oidc`.
- `TERRAFORM_BACKEND_TYPE`: `s3`, `local`, `gcs`, `azurerm`, or `pg`.

---

## 7) Terraform Design

### Root composition
- `terraform/versions.tf` and module-local `versions.tf` enforce engine/provider compatibility.
- `terraform/providers.tf` configures Cloudflare provider wiring.
- `terraform/main.tf` composes reusable modules by capability domain.

### Reusable modules currently included
- `cloudflare-access-app`
- `cloudflare-access-policy`
- `cloudflare-api-shield`
- `cloudflare-d1`
- `cloudflare-dns`
- `cloudflare-r2`
- `cloudflare-saml-provider`
- `cloudflare-tunnel`
- `cloudflare-waf`
- `cloudflare-workers`

Each module provides `variables.tf`, `main.tf`, `outputs.tf`, `providers.tf`, and `README.md` for modular consumption.

---

## 8) Security Control Model

### Least privilege
Use distinct Cloudflare tokens per capability domain (DNS, Workers, Zero Trust, WAF, Tunnel, R2) to reduce blast radius and align with separation-of-duties.

### Identity and Zero Trust
- Identity provider integration is mandatory via `IDENTITY_PROVIDER_*` controls.
- Zero Trust and Access modules are structured for policy-based admission and MFA-centric access.

### Secret management
- SOPS bootstrap support exists via `scripts/sops-bootstrap.sh`.
- Token and secret rotation helpers are provided under `scripts/cloudflare/` and `scripts/rotate-secrets.sh`.

---

## 9) CI/CD Integration Blueprint

Recommended deterministic pipeline stages:

1. **Lint & static checks**
   - `terraform fmt -check -recursive`
   - `terraform validate` per environment
2. **Contract + environment checks**
   - `make contract`
   - `make validate`
3. **Plan**
   - `make plan ENV=dev|staging|prod`
4. **Manual/Policy approval**
5. **Apply**
   - `make apply ENV=...`
6. **Post-apply drift guard**
   - `make drift ENV=...`
7. **Scheduled drift + rotation jobs**
   - `scripts/drift-detect.sh`
   - `scripts/rotate-secrets.sh`

---

## 10) Disaster Recovery and Rollback Strategy

### Recovery primitives
- `make backup`
- `make restore`

### Rollback workflow
1. Revert offending Git commit.
2. Re-run `make validate`.
3. Re-plan target environment.
4. Apply reverted desired state.
5. Confirm no drift via `make drift ENV=...`.

### Incident governance
- Preserve JSON logs from scripts for forensic traceability.
- Retain plan outputs and state operation logs in CI artifacts.

---

## 11) Compliance and Audit Readiness

- Deterministic validations enforce environment and policy conformance.
- Token segmentation supports least-privilege attestations.
- Drift checks provide continuous control verification.
- Environment-scoped IaC supports clear change traceability from commit to apply.

---

## 12) Known Expansion Paths

- Add policy-as-code gates (OPA/Conftest) on Terraform plans.
- Add signed plan promotion (artifact hash verification between stages).
- Add centralized metrics export for validation/drift job outcomes.
- Expand Zero Trust posture checks and automated policy assertions.

