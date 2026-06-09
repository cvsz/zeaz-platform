# zCino

Last updated: 2026-06-10

`apps/zcino` is a Go service stack inside `cvsz/zeaz-platform`. It is kept separate from other ZeaZ apps and should be operated as its own service.

## Stack

| Layer | Stack |
|---|---|
| Backend | Go |
| Service type | REST microservice |
| Data | PostgreSQL migrations present |
| Cache | Redis-oriented service design |
| Deployment assets | Dockerfile, k8s, infra, release assets |
| Route intent | `zcino.zeaz.dev` |

## Scope rule

This README documents only `apps/zcino`. Do not copy zDash, zOffice, zWallet, or web commands into this service.

## Local development

```bash
cd /home/zeazdev/zeaz-platform/apps/zcino
go mod download
go run ./...
```

## Build

```bash
cd /home/zeazdev/zeaz-platform/apps/zcino
go build ./...
```

## Docker

```bash
cd /home/zeazdev/zeaz-platform/apps/zcino
docker build -t zcino:local .
```

## Important files

```text
go.mod
go.sum
main.go
legacy_api.go
cmd/
internal/
migrations/
Dockerfile
Dockerfile.zeaznode
k8s/
infra/
```

## Security notes

- Do not commit database credentials.
- Keep PostgreSQL/Redis config in env or platform secret stores.
- Validate API inputs at service boundaries.
- Keep this Go service independent from other app stacks.
