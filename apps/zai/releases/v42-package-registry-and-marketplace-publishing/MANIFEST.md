# v42 Package Registry and Marketplace Publishing Manifest

Package: `zai-coder-control-plane-v42-package-registry-and-marketplace-publishing.zip`

## Purpose

Add internal package registry and marketplace publishing draft workflows.

## Planned systems

- package metadata registry
- agent/skill/plugin listing catalog
- marketplace submission drafts
- publishing checklist
- package validation policy
- version compatibility matrix
- license and attribution checks
- registry export bundle
- marketplace dashboard routes
- tests and docs

## Planned commands

```bash
make package-registry-marketplace
make package-registry-status
make package-catalog
make marketplace-draft
make publishing-checklist
make package-validation
make registry-export APPLY=1
make marketplace-audit
make marketplace-dashboard-export
```

## Planned routes

```text
/api/marketplace/status
/marketplace
/marketplace/packages
/marketplace/submissions
/marketplace/validation
/marketplace/checklist
```

## Safety posture

- draft-only publishing
- no external marketplace publish
- license/attribution review required
- no binary upload through connector
- demo writes require APPLY=1
