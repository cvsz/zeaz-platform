# ABTPi18n

Last updated: 2026-06-10

`apps/ABTPi18n` is the Auto Bot Trader Pro i18n / strategy-support stack inside `cvsz/zeaz-platform`. It is kept as its own imported app stack and should not share runtime commands with zTrader, zkbtrader, or zDash unless a future migration explicitly merges them.

## Stack

| Layer | Stack |
|---|---|
| Workspace | pnpm workspace |
| Python packaging | pyproject.toml |
| Config | `configs/` |
| Core code | `core/`, `apps/`, `strategies/` |
| Monitoring | `monitoring/` |
| Automation | `scripts/`, `install.sh`, `release.sh`, `verify.sh` |
| Tests | `tests/` |

## Scope rule

This README documents only `apps/ABTPi18n`. Do not mix zTrader, zkbtrader, or zDash commands into this app.

## Local setup

```bash
cd /home/zeazdev/zeaz-platform/apps/ABTPi18n
pnpm install
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

## Verification

```bash
./verify.sh
```

## Release helpers

```bash
./validate-release.sh
./release.sh
```

## Important files

```text
package.json
pnpm-workspace.yaml
pyproject.toml
configs/
core/
apps/
strategies/
monitoring/
scripts/
tests/
SECURITY.md
CHANGELOG.md
```

## Security notes

- Do not commit trading credentials or broker/exchange keys.
- Keep strategy execution in dry-run/test mode unless explicitly audited.
- Keep this app stack separate from other trading apps in the monorepo.
