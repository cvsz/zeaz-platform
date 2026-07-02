# Apps server control report

Generated: 2026-06-30T23:12:28Z
Action: `start`
Base plan: `configs/platform/apps-port-plan.json`
Overlay glob: `configs/platform/*-route-overlay.json`

| App | Hostname | Alias | Path | Port | Role | Status | Result |
|---|---|---|---|---:|---|---|---|
| `web-root` | `zeaz.dev` | `` | `apps/zeaz-web` | `3003` | `ui` | `active` | `RUNNING pid=1313673 app=web-root host=zeaz.dev port=3003 path=apps/zeaz-web alias=none` |
| `zdash` | `zdash.zeaz.dev` | `` | `apps/zdash` | `5173` | `ui` | `active` | `OK: docker compose started app=zdash` |
| `zdash-api` | `api-zdash.zeaz.dev` | `` | `apps/zdash` | `8005` | `api` | `active` | `OK: docker compose started app=zdash-api` |
| `release` | `release.zeaz.dev` | `` | `apps/zdash` | `5172` | `evidence` | `active` | `OK: docker compose started app=release` |
| `zveo` | `zveo.zeaz.dev` | `` | `apps/zveo` | `3002` | `ui` | `active` | `OK: docker compose started app=zveo` |
| `zveo-api` | `api-zveo.zeaz.dev` | `` | `apps/zveo` | `8090` | `api` | `active` | `OK: docker compose started app=zveo-api` |
| `ztrader` | `ztrader.zeaz.dev` | `` | `apps/ztrader` | `3016` | `ui` | `active` | `WARN: docker compose start failed app=ztrader; see /home/zeazdev/zeaz-platform/runtime/app-servers/ztrader-3016.log` |
| `zcino` | `zcino.zeaz.dev` | `` | `apps/zcino` | `3000` | `ui` | `active` | `OK: docker compose started app=zcino` |
| `zoffice` | `zoffice.zeaz.dev` | `` | `apps/zoffice` | `8091` | `api-ui` | `refactor-from-8090` | `OK: docker compose started app=zoffice` |
| `zwallet` | `zwallet.zeaz.dev` | `` | `apps/zwallet` | `8011` | `api-ui` | `reserved` | `OK: docker compose started app=zwallet` |
| `zlms` | `zlms.zeaz.dev` | `` | `apps/zlms` | `8012` | `app` | `reserved` | `OK: docker compose started app=zlms` |
| `zAcademy` | `academy.zeaz.dev` | `` | `apps/zAcademy` | `3013` | `ui` | `reserved` | `WARN: missing app dir app=zAcademy path=apps/zAcademy` |
| `zsticker` | `zsticker.zeaz.dev` | `` | `apps/zsticker` | `8014` | `api-ui` | `reserved` | `OK: docker compose started app=zsticker` |
| `zcloud` | `zcloud.zeaz.dev` | `` | `apps/zcloud` | `3004` | `ui` | `active` | `RUNNING pid=1319205 app=zcloud host=zcloud.zeaz.dev port=3004 path=apps/zcloud alias=none` |
| `zsp-aitool` | `ztest.zeaz.dev` | `` | `apps/zsp-aitool` | `3008` | `ui` | `active` | `WARN: docker compose start failed app=zsp-aitool; see /home/zeazdev/zeaz-platform/runtime/app-servers/zsp-aitool-3008.log` |
| `auth` | `auth.zeaz.dev` | `` | `apps/auth` | `9443` | `auth` | `active` | `WARN: missing app dir app=auth path=apps/auth` |
| `zai-factory` | `factory.zeaz.dev` | `` | `apps/zai-factory` | `8710` | `ops` | `reserved` | `RUNNING pid=1328976 app=zai-factory host=factory.zeaz.dev port=8710 path=apps/zai-factory alias=none` |
| `zstudio` | `zstudio.zeaz.dev` | `` | `apps/zstudio` | `3001` | `ui` | `active` | `WARN: missing app dir app=zstudio path=apps/zstudio` |
| `analytics` | `analytics.zeaz.dev` | `` | `apps/analytics` | `3017` | `ui` | `reserved` | `WARN: missing app dir app=analytics path=apps/analytics` |
| `zpay` | `zpay.zeaz.dev` | `` | `apps/zpay` | `3018` | `api-ui` | `reserved` | `WARN: missing app dir app=zpay path=apps/zpay` |
| `ztreasury` | `ztreasury.zeaz.dev` | `` | `apps/ztreasury` | `3019` | `api-ui` | `reserved` | `WARN: missing app dir app=ztreasury path=apps/ztreasury` |
| `zow` | `zow.zeaz.dev` | `` | `apps/openwork` | `8092` | `ui` | `reserved` | `WARN: missing app dir app=zow path=apps/openwork` |
| `zfbauto` | `zfbauto.zeaz.dev` | `` | `apps/zfbauto` | `3020` | `ui` | `reserved` | `STOPPED app=zfbauto host=zfbauto.zeaz.dev port=3020 path=apps/zfbauto alias=none` |
| `zagents` | `zagents.zeaz.dev` | `` | `apps/zagents` | `3009` | `ui` | `active` | `WARN: missing app dir app=zagents path=apps/zagents` |
| `zeaz-api` | `api.zeaz.dev` | `` | `apps/zeaz-api` | `8088` | `api` | `active` | `OK: docker compose started app=zeaz-api` |
| `litellm` | `litellm.zeaz.dev` | `` | `services/litellm` | `4000` | `ops` | `reserved` | `OK: docker compose started app=litellm` |
| `ztrader-api` | `api-ztrader.zeaz.dev` | `ztrader` | `apps/ztrader` | `8016` | `api` | `active` | `WARN: docker compose start failed app=ztrader-api; see /home/zeazdev/zeaz-platform/runtime/app-servers/ztrader-api-8016.log` |
