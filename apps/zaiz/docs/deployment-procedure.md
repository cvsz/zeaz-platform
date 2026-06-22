# ZeaZ Platform — Deployment Procedure

This document outlines the standard operating procedure for deploying ZeaZ Platform services.

## 1. Pre-Deployment
- Validate configuration using `make validate`.
- Verify security scans (`scripts/security-scan.sh`) have passed.
- Ensure all environment variables are set and validated via `scripts/validate-env.sh`.

## 2. Deployment
- Deploy via `workflow_dispatch` in GitHub Actions for approved environments.
- Environments require manual approval from authorized operators.

## 3. Post-Deployment
- Verify service health via monitoring dashboard.
- Perform service acceptance testing.
- Complete the Post-Deploy Review signoff.
