# Cloudflare Disaster Recovery Governance

## Overview

This document defines the Disaster Recovery (DR) governance model for Cloudflare infrastructure within the ZeaZ Platform. It ensures human-in-the-loop decision-making, clear ownership, and rigorous evidence capture for recovery actions.

## Relationship to Other Phases

- **Phase 13 (Break-Glass)**: Defines the emergency rollback policy and authorization process. DR recovery often utilizes Phase 13 procedures.
- **Phase 15 (Review Board)**: DR events and tabletop exercises are reviewed by the Review Board.
- **Phase 16 (Evidence Archive)**: All recovery actions must have evidence stored in the Phase 16 archive.
- **Phase 17 (Risk Scoring)**: Post-recovery permanent fixes must undergo risk scoring.

## DR Scenarios

The following scenarios are covered under this governance model:

1. **DNS misroute** — A DNS record change routes prod traffic to wrong service.
2. **Worker route collision** — A Worker route pattern overlaps, breaking a prod service.
3. **Tunnel outage** — `cloudflared` service stops or tunnel disconnects.
4. **Credential leak or suspected leak** — Tunnel token or API token potentially exposed.
5. **Terraform state drift** — Terraform state diverges from live Cloudflare state.
6. **Access policy lockout** — A Zero Trust access policy blocks legitimate users.
7. **Production rollback required** — A change must be rolled back (see Phase 13).
8. **Evidence archive unavailable** — The evidence archive is inaccessible when needed for audit.

## Decision Making

- **Human-in-the-Loop**: Automated recovery is prohibited for high-impact scenarios. A recovery owner must manually verify the trigger and authorize the recovery path.
- **Emergency Authorization**: If the designated owner is unavailable, the Backup Owner or Engineering Manager may authorize recovery.

## Evidence Requirements

After any DR recovery action, the following evidence is mandatory:
- Incident timeline (detection, authorization, recovery, verification).
- Screenshots or logs showing the failure state.
- Command output of all [READ-ONLY CHECK] steps.
- Verification results showing services are restored.
- Sign-off from the Recovery Owner and at least one Review Board member.

## Post-DR Review

Every DR event (including tabletop exercises) must trigger a post-mortem review within 5 business days to:
- Identify the root cause.
- Evaluate recovery effectiveness.
- Update recovery checklists and matrices.
- Track remediation items for permanent fixes.
