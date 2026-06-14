# Apps server control report

Generated: 2026-06-14T21:05:40Z
Action: `start`
Base plan: `configs/platform/apps-port-plan.json`
Overlay glob: `configs/platform/*-route-overlay.json`

| App | Hostname | Alias | Path | Port | Role | Status | Result |
|---|---|---|---|---:|---|---|---|
| `web-root` | `zeaz.dev` | `` | `apps/web` | `3003` | `ui` | `active` | `STOPPED app=web-root host=zeaz.dev port=3003 path=apps/web alias=none` |
| `zdash` | `zdash.zeaz.dev` | `` | `apps/zdash` | `5173` | `ui` | `active` | `WARN: app Makefile server-start failed app=zdash; see runtime/app-servers/zdash-5173.log` |
| `zdash-api` | `api-zdash.zeaz.dev` | `` | `apps/zdash` | `8005` | `api` | `active` | `WARN: app Makefile server-start failed app=zdash-api; see runtime/app-servers/zdash-api-8005.log` |
| `release` | `release.zeaz.dev` | `` | `apps/zdash` | `5172` | `evidence` | `active` | `WARN: app Makefile server-start failed app=release; see runtime/app-servers/release-5172.log` |
| `zveo` | `zveo.zeaz.dev` | `` | `apps/zveo` | `3002` | `ui` | `active` | `WARN: docker compose start failed app=zveo; see runtime/app-servers/zveo-3002.log` |
| `zveo-api` | `api-zveo.zeaz.dev` | `` | `apps/zveo` | `8090` | `api` | `active` | `WARN: docker compose start failed app=zveo-api; see runtime/app-servers/zveo-api-8090.log` |
| `ztrader` | `ztrader.zeaz.dev` | `` | `apps/ztrader` | `3016` | `ui` | `active` | `WARN: app Makefile server-start failed app=ztrader; see runtime/app-servers/ztrader-3016.log` |
| `zcino` | `zcino.zeaz.dev` | `` | `apps/zcino` | `3000` | `ui` | `active` | `WARN: docker compose start failed app=zcino; see runtime/app-servers/zcino-3000.log` |
| `zoffice` | `zoffice.zeaz.dev` | `` | `apps/zoffice` | `8091` | `api-ui` | `refactor-from-8090` | `OK: delegated start app=zoffice` |
| `zwallet` | `zwallet.zeaz.dev` | `` | `apps/zwallet` | `8011` | `api-ui` | `reserved` | `WARN: docker compose start failed app=zwallet; see runtime/app-servers/zwallet-8011.log` |
| `zlms` | `zlms.zeaz.dev` | `` | `apps/zlms` | `8012` | `app` | `reserved` | `WARN: docker compose start failed app=zlms; see runtime/app-servers/zlms-8012.log` |
| `zAcademy` | `academy.zeaz.dev` | `` | `apps/zAcademy` | `3013` | `ui` | `reserved` | `SKIP: no supported start command app=zAcademy path=apps/zAcademy` |
| `zsticker` | `zsticker.zeaz.dev` | `` | `apps/zsticker` | `8014` | `api-ui` | `reserved` | `WARN: docker compose start failed app=zsticker; see runtime/app-servers/zsticker-8014.log` |
| `zcloud` | `zcloud.zeaz.dev` | `` | `apps/zcloud` | `3004` | `ui` | `active` | `STOPPED app=zcloud host=zcloud.zeaz.dev port=3004 path=apps/zcloud alias=none` |
| `zsp-aitool` | `ztest.zeaz.dev` | `` | `apps/zsp-aitool` | `3008` | `ui` | `active` | `WARN: docker compose start failed app=zsp-aitool; see runtime/app-servers/zsp-aitool-3008.log` |
| `auth` | `auth.zeaz.dev` | `` | `apps/auth` | `9443` | `auth` | `active` | `WARN: missing app dir app=auth path=apps/auth` |
| `zai-factory` | `factory.zeaz.dev` | `` | `apps/zai-factory` | `8710` | `ops` | `reserved` | `SKIP: no supported start command app=zai-factory path=apps/zai-factory` |
| `zcfdash-api` | `api-zcfdash.zeaz.dev` | `api-gateway` | `apps/api` | `8088` | `api` | `active` | `OK: docker compose started app=zcfdash-api` |
| `ztrader-api` | `api-ztrader.zeaz.dev` | `ztrader` | `apps/ztrader` | `8016` | `api` | `active` | `WARN: app Makefile server-start failed app=ztrader-api; see runtime/app-servers/ztrader-api-8016.log` |
