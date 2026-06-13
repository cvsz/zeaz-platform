# ZeaZ Platform Project Instructions

## Language and Coding Standards
- **Communication**: Always talk in Thai when interacting with users.
- **Code & Technical Assets**: All code, comments, documentation, and technical definitions must be in English.

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
