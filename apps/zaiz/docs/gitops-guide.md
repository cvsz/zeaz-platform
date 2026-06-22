# ZeaZ Platform — GitOps & CI/CD Guide

This guide defines the standards for CI/CD automation and GitOps orchestration, emphasizing security and deterministic deployments.

## 1. Core Workflow Standards
- **Least-Privilege:** Workflows must use explicitly defined `permissions`.
- **No Secrets:** Never commit secrets, and avoid printing sensitive environment information in logs.
- **Timeouts:** Every job must have a `timeout-minutes` definition.
- **Determinism:** Use specific action versions (e.g., `actions/checkout@v4`).

## 2. Environment Approvals
- Infrastructure mutations must require explicit manual approval via GitHub Environments.
- Production-bound workflows must NOT run automatically on PR/Push; they require `workflow_dispatch`.

## 3. Validation
- Use `make workflow-validate` to confirm compliance with these CI/CD standards.
