# ZeaZ Platform Project Instructions

## Language and Coding Standards
- **Communication**: Always talk in Thai when interacting with users.
- **Code & Technical Assets**: All code, comments, documentation, and technical definitions must be in English.

## Platform Context
ZeaZ Platform is a multi-application, Cloudflare-first monorepo. It hosts multiple applications under `apps/` that have standalone runtime environments.
- **Web Frontend**: `apps/web` (Next.js)
- **Developer Tools & Cockpits**: `apps/zcloud` (CloudPanel), `apps/zdash`, `apps/zcfdash`
- **Algo Trading & Game Services**: `apps/ztrader` (Celery/FastAPI), `apps/zcino`, `apps/zcino-modern`
- **Educational & Workspace**: `apps/zAcademy`, `apps/zlms`, `apps/zoffice`, `apps/openwork`
- **Other utilities**: `apps/api` (FastAPI), `apps/zLinebot`, `apps/zsticker`, `apps/zsp-aitool`, `apps/zveo`, `apps/zwallet`

## Architecture & Security
- **Decoupled Apps**: Each app in `apps/*` runs independently.
- **Root Infrastructure**: `infrastructure/`, `terraform/`, `opentofu/`, `configs/`
- **No Committed Secrets**: Use `.env` files. Do not commit test keys, DB credentials, or API tokens.

## Git Workflow

### Allowed Commands
| Operation   | Command                            |
|-------------|------------------------------------|
| Stage files | `git add <files>`                  |
| Commit      | `make gpg-commit COMMIT_MSG="..."` |
| Push        | `make gpg-push`                    |
| Pull        | `make gpg-pull`                    |
| All-in-one  | `make gpg-finalize COMMIT_MSG="..."` |

### Forbidden Commands
- **Never use** `git commit` directly
- **Never use** `git push` directly
- **Never use** `git pull` directly
- **Never use** `gh` CLI for commit/push/pull operations

### Branching
- Follow the established branch naming conventions (e.g., `fix/`, `feat/`).
