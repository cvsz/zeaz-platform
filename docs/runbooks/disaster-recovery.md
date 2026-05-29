# Disaster Recovery

## Objectives

- **RPO:** 24 hours
- **RTO:** 2 hours

## DR lifecycle

1. Perform daily configuration backups using `scripts/backup.sh`.
2. Validate backup integrity (SHA-256 and manifest checks).
3. Run monthly restore drills with `scripts/restore.sh` in an isolated workspace.
4. Execute post-restore validation:
   - `make validate`
   - `make security-scan`
   - `python3 -m pytest tests/test_runbooks.py`

## Incident execution

For incident response playbooks, use `docs/runbooks/*.md`. Every runbook includes severity matrix, rollback, forensic collection, recovery validation, and postmortem template.

## Evidence handling

- Preserve backup archive checksums.
- Preserve Cloudflare audit exports.
- Record all recovery commands with UTC timestamps.
