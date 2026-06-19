# GitOps Workflow Validation

This repository enforces offline workflow policy validation for CI safety checks.

## Commands

- `make workflow-policy` validates workflow policy requirements:
  - top-level `permissions`
  - `timeout-minutes` on jobs
  - mutating apply/destroy workflows cannot be triggered by `push`
- `make workflow-validate` runs the workflow policy checks.
- `make gitops-validate` runs workflow checks plus drift detection.

## Safety guarantees

- Infrastructure mutation is manual-only through `workflow_dispatch`.
- Drift detection is read-only (`plan -detailed-exitcode`) and does not apply infrastructure.
- Validation is deterministic and offline except drift detection provider plugin resolution.
