# Cloudflare CI/PR Gates (Phase 10)

This document describes the PR and CI gates enforcing the zero-mutation policy for Cloudflare.

## Phase 11 Handoff

Phase 10 blocks unsafe PR behavior.
Phase 11 adds release-readiness evidence before any future manual deployment or Terraform/OpenTofu apply.

## Phase 13 — Break-Glass Governance Gate
- PR workflows validate governance only.
- Break-glass is not executable from PR.
- Runtime rollback evidence must exist before future emergency manual action.
- Phase 13 checker enforces structure only.
- Phase 13 does not approve execution.
- Phase 13 does not bypass Phase 10/11/12.
