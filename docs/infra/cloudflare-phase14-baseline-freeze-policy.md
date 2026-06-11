# Cloudflare Baseline Freeze Policy

## Why baseline freeze exists
To prevent accidental infrastructure regressions, traffic misrouting, or security bypasses, we explicitly freeze the intended state of Cloudflare configuration as visible in the repository. The baseline serves as a reference point for all future changes.

## What is frozen
- hostname ownership
- route ownership
- tunnel ownership
- source-of-truth mapping
- CI gate posture
- manual release governance requirements

## What is not frozen
- application code
- local development-only config
- documentation wording that does not affect ownership

## Change classification
- **documentation-only**: Formatting or typo fixes in documentation. Requires standard PR review.
- **ownership-affecting**: Changing a hostname from Tunnel to Worker, or adding a new DNS record. Requires baseline diff report and architecture review.
- **release-affecting**: Changing manual release gates or CI workflows. Requires strict governance approval.
- **emergency/break-glass-affecting**: Changes to the rollback runbooks. Requires post-incident review.

## Required review evidence
Each classification requires a valid `docs/infra/cloudflare-phase14-baseline-diff-report.md` with the corresponding boxes checked. 

Phase 14 is not a deployment authorization.
