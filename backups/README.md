# Backups and Restore

## Backup scope

`scripts/backup.sh` creates deterministic, integrity-checked archives for:

- terraform/
- opentofu/
- zero-trust/
- waf/
- dns/
- tunnels/
- policies/
- monitoring/
- security/
- docs/
- scripts/

## Backup output

- Archive: `backups/snapshots/<env>-<timestamp>.tar.gz`
- Integrity hash: `backups/snapshots/<env>-<timestamp>.tar.gz.sha256`
- Manifest: `backups/snapshots/<env>-<timestamp>.manifest.txt`

## Restore

```bash
scripts/restore.sh backups/snapshots/<file>.tar.gz
```

Restore validates checksum before extraction and supports rollback on extraction failure.
