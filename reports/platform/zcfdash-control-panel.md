# zcfdash Cloudflare control panel server report

Generated: 2026-06-13T19:25:23Z
Port source: app route list + route overlays
Base plan: configs/platform/apps-port-plan.json
Overlay glob: configs/platform/*-route-overlay.json

| Service | Public hostname | App path | Local origin | Status |
|---|---|---|---|---|
| UI | https://zcfdash.zeaz.dev | apps/web | http://127.0.0.1:3003 | RUNNING external |
| API | https://api-zcfdash.zeaz.dev | apps/api | http://127.0.0.1:8088 | RUNNING external |

## Commands

```bash
make -f Makefile -f Makefile.app-servers zcfdash-control-start
make -f Makefile -f Makefile.app-servers zcfdash-control-status
make apps-port-refactor-generate
```
