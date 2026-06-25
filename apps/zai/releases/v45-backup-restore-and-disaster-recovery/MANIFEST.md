# v45 Backup Restore and Disaster Recovery Manifest

Package: `zai-coder-control-plane-v45-backup-restore-and-disaster-recovery.zip`

## Purpose

Add backup planning, restore drill previews, DR evidence, and RPO/RTO dashboards.

## Planned systems

- backup plan registry
- restore drill preview runner
- RPO/RTO target catalog
- DR scenario library
- recovery evidence reports
- backup validation checks
- restore readiness gate
- DR dashboard routes
- DR audit log
- tests and docs

## Planned commands

```bash
make backup-restore-dr
make dr-status
make backup-plan
make restore-drill-preview
make rpo-rto-targets
make dr-scenarios
make recovery-evidence
make dr-export APPLY=1
make dr-audit
make dr-dashboard-export
```

## Planned routes

```text
/api/dr/status
/dr
/dr/backups
/dr/restore-drills
/dr/rpo-rto
/dr/evidence
```

## Safety posture

- restore workflows are preview-only by default
- no direct production restore by default
- evidence export is local-only
- manual approval required for real operations
- demo writes require APPLY=1
