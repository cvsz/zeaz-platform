# ztrader completion fix report

Generated: 2026-06-10
Repo: `cvsz/zeaz-platform`
Path: `apps/ztrader`

## Decision

Status: `IMPLEMENTED WITH LOCAL VERIFICATION REQUIRED`

The repository already contained a substantial ztrader application, but it was incomplete for platform-level release integration.

## Findings before fix

| Area | Finding | Impact |
|---|---|---|
| Route ports | Platform route plan expected `ztrader.zeaz.dev` on `3016`, but frontend package script used `3000`. | Repo-wide app server control and Cloudflare tunnel assets could drift. |
| API route | No dedicated `api-ztrader.zeaz.dev` route existed in route overlays. | Backend could not be generated into Cloudflare app route assets. |
| Lifecycle | `apps/ztrader/Makefile` had `dev-*` and Docker targets, but no `server-start`, `server-stop`, `server-status`, or `server-report`. | Root `apps-server-control.sh` could not delegate ztrader cleanly. |
| Docker compose | Compose exposed database/cache/app ports publicly and used committed placeholder secrets. | Unsafe production posture and weak local isolation. |
| Env example | `.env.example` used backend `PORT=8000`, frontend URL `localhost:8000`, and live kill switch false. | Did not match app route plan or safety-first release posture. |

## Implemented fixes

| File | Change |
|---|---|
| `apps/ztrader/frontend/package.json` | Frontend `dev` and `start` now bind to `HOST` and `PORT`, defaulting to `127.0.0.1:3016`. |
| `apps/ztrader/.env.example` | Added route-aligned `BACKEND_PORT=8016`, `FRONTEND_PORT=3016`, public URLs, placeholder-only secrets, `LIVE_TRADING_ENABLED=false`, and `GLOBAL_KILL_SWITCH=true`. |
| `apps/ztrader/docker-compose.yml` | Bound exposed ports to `127.0.0.1`, aligned backend/frontend route ports, added required-secret checks, added health checks, and replaced committed placeholder secrets with env-driven values. |
| `apps/ztrader/Makefile` | Added `server-start`, `server-stop`, `server-restart`, `server-status`, `server-report`, and `validate-local`. |
| `configs/platform/ztrader-route-overlay.json` | Added `api-ztrader.zeaz.dev -> http://127.0.0.1:8016` route overlay. |

## Canonical route mapping

| Hostname | Path | Local origin | Purpose |
|---|---|---|---|
| `ztrader.zeaz.dev` | `apps/ztrader` | `http://127.0.0.1:3016` | ztrader frontend UI |
| `api-ztrader.zeaz.dev` | `apps/ztrader` | `http://127.0.0.1:8016` | ztrader FastAPI backend |

## Required local verification

```bash
cd /home/zeazdev/zeaz-platform
git pull --ff-only origin main

python3 scripts/platform/generate-port-refactor-assets.py
make -C apps/ztrader validate-local
make -C apps/ztrader server-start
make -C apps/ztrader server-status

curl -fsS http://127.0.0.1:8016/health
curl -I http://127.0.0.1:3016

make -f Makefile -f Makefile.app-servers apps-server-status
bash scripts/platform/final-go-live-complete.sh
```

## Safety notes

- This fix keeps ztrader defaulted to paper mode.
- Live trading remains disabled by default.
- Global kill switch is enabled by default in `.env.example`.
- Real secrets must be generated only on the server and never committed.
- Public exposure should happen only through Cloudflare tunnel/proxy routes to localhost origins.
