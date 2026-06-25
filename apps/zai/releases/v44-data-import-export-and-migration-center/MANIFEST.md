# v44 Data Import Export and Migration Center Manifest

Package: `zai-coder-control-plane-v44-data-import-export-and-migration-center.zip`

## Purpose

Add local import, export, and migration planning workflows with schema checks and rollback previews.

## Planned systems

- data import planner
- data export planner
- migration job registry
- schema compatibility checks
- rollback preview plans
- data mapping catalog
- migration evidence reports
- migration dashboard routes
- migration audit log
- tests and docs

## Planned commands

```bash
make data-migration-center
make migration-status
make import-plan
make export-plan
make schema-check
make rollback-preview
make migration-report
make migration-export APPLY=1
make migration-audit
make migration-dashboard-export
```

## Planned routes

```text
/api/migration/status
/migration
/migration/import
/migration/export
/migration/schema
/migration/rollback
```

## Safety posture

- dry-run migration planning by default
- no direct data modification by default
- no production database access by default
- rollback previews only
- demo writes require APPLY=1
