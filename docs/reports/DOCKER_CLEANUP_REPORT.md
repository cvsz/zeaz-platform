# Docker Cleanup Report

Generated: 2026-06-09 15:57:26Z

## Implemented

- Added `scripts/docker/docker-safe-cleanup.sh`.
- Default cleanup prunes stopped containers, dangling images, build cache, and unused networks.
- Volumes are not pruned unless `--include-volumes` and `CONFIRM_DOCKER_VOLUME_PRUNE=yes` are both set.

## Operator Command

```bash
scripts/docker/docker-safe-cleanup.sh --dry-run
```
