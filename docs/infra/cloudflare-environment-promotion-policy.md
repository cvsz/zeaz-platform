# Cloudflare Environment Promotion Policy

## Overview

Configuration changes must flow through environments sequentially to ensure stability and security.

## Promotion Gates

### dev → staging
- **Requirements**:
  - Validated by developer in `dev` environment.
  - Passes `validate-cloudflare-config.sh`.
  - Passes `scan-cloudflare-environment-boundaries.sh`.
- **Approval**: Developer Self-Sign-off.
- **Evidence**: None required.

### staging → prod
- **Requirements**:
  - Successfully integrated in `staging`.
  - Phase 17 Risk Scoring performed.
  - Phase 16 Evidence Archive updated with staging results.
  - Rollback plan verified.
- **Approval**: DevOps Lead + Security Team.
- **Evidence**: Summary + Risk Score.

### Emergency Promotion (prod)
- **Requirements**:
  - Incident ID reference.
  - Post-mortem requirement within 48 hours.
- **Approval**: Engineering Manager.

## Rollback Policy

- **dev**: Immediate local revert.
- **staging**: Revert to last stable commit.
- **prod**:
  - Revert and execute post-rollback verification.
  - Notification to Review Board.
