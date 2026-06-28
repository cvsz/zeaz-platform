# zSticker

Last updated: 2026-06-28

`apps/zsticker` is a Python automation stack for LINE sticker/image generation and delivery workflows. It is kept as its own app stack inside `cvsz/zeaz-platform`.

## Stack

| Layer | Stack |
|---|---|
| Runtime | Python |
| Automation | `main.py`, `auto_setup.py`, `auto_cron.sh` |
| Config | `config/`, `config.example`, `credentials.json` placeholder |
| Containers | Dockerfile, docker-compose.yml |
| Templates | `templates/` |
| Tests | `tests/`, `conftest.py` |

## Scope rule

This README documents only `apps/zsticker`. Do not mix zOffice, zDash, zTrader, or zWallet commands into this app.

## Local setup

```bash
cd /home/zeazdev/zeaz-platform/apps/zsticker
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python main.py
```

## Docker

```bash
docker compose up -d --build
```

## Important files

```text
main.py
auto_setup.py
auto_cron.sh
requirements.txt
Dockerfile
docker-compose.yml
config.example
templates/
src/
tests/
```

## Security notes

- Do not commit real LINE, Google, Imgur, or sheet credentials.
- Replace placeholder `credentials.json` with local secret management.
- Keep generated output and logs out of git.
- Use dry-run/test channels before sending automated messages publicly.
