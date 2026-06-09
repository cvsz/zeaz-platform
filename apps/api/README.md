# ZeaZ API

Last updated: 2026-06-10

`apps/api` is the lightweight Python API service for the ZeaZ platform.

## Stack

| Layer | Stack |
|---|---|
| Runtime | Python |
| Entry point | `main.py` |
| Routers | `routers/` |
| Dependencies | `requirements.txt` |
| Route intent | `api.zeaz.dev` |

## Scope rule

This README documents only `apps/api`. Keep commands for other apps in their own README files.

## Local setup

```bash
cd /home/zeazdev/zeaz-platform/apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python main.py
```

## Important files

```text
main.py
requirements.txt
routers/
```

## Notes

- Keep app-local config inside this app path.
- Keep platform routing in root platform configs.
- Review dependencies before production use.
