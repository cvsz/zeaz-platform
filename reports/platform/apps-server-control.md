# Apps server control report

Generated: 2026-06-12T13:39:25Z
Action: `status`
Base plan: `configs/platform/apps-port-plan.json`
Overlay glob: `configs/platform/*-route-overlay.json`

| App | Hostname | Alias | Path | Port | Role | Status | Result |
|---|---|---|---|---:|---|---|---|
| `root` | `zeaz.dev` | `` | `.` | `8787` | `landing` | `active` | `STOPPED app=root host=zeaz.dev port=8787 path=. alias=none` |
| `web` | `app.zeaz.dev` | `` | `apps/web` | `3003` | `ui` | `active` | `STOPPED app=web host=app.zeaz.dev port=3003 path=apps/web alias=none` |
| `studio` | `studio.zeaz.dev` | `` | `apps/web` | `3001` | `ui` | `active` | `STOPPED app=studio host=studio.zeaz.dev port=3001 path=apps/web alias=none` |
| `zdash` | `zdash.zeaz.dev` | `` | `apps/zdash` | `5173` | `ui` | `active` | `STOPPED app=zdash host=zdash.zeaz.dev port=5173 path=apps/zdash alias=none` |
| `zdash-api` | `api-zdash.zeaz.dev` | `` | `apps/zdash` | `8005` | `api` | `active` | `STOPPED app=zdash-api host=api-zdash.zeaz.dev port=8005 path=apps/zdash alias=none` |
| `release` | `release.zeaz.dev` | `` | `apps/zdash` | `5172` | `evidence` | `active` | `STOPPED app=release host=release.zeaz.dev port=5172 path=apps/zdash alias=none` |
| `zveo` | `zveo.zeaz.dev` | `` | `apps/zveo` | `3002` | `ui` | `active` | `STOPPED app=zveo host=zveo.zeaz.dev port=3002 path=apps/zveo alias=none` |
| `zveo-api` | `api-zveo.zeaz.dev` | `` | `apps/zveo` | `8090` | `api` | `active` | `STOPPED app=zveo-api host=api-zveo.zeaz.dev port=8090 path=apps/zveo alias=none` |
| `zkbtrader` | `zkbtrader.zeaz.dev` | `` | `apps/zkbtrader` | `8004` | `api-ui` | `active` | `STOPPED app=zkbtrader host=zkbtrader.zeaz.dev port=8004 path=apps/zkbtrader alias=none` |
| `ztrader` | `ztrader.zeaz.dev` | `` | `apps/ztrader` | `3016` | `ui` | `active` | `STOPPED app=ztrader host=ztrader.zeaz.dev port=3016 path=apps/ztrader alias=none` |
| `zcino` | `zcino.zeaz.dev` | `` | `apps/zcino` | `3000` | `ui` | `active` | `RUNNING external app=zcino host=zcino.zeaz.dev port=3000 path=apps/zcino alias=none` |
| `cctv` | `cctv.zeaz.dev` | `` | `apps/cctv` | `9292` | `ui` | `active` | `STOPPED app=cctv host=cctv.zeaz.dev port=9292 path=apps/cctv alias=none` |
| `zoffice` | `zoffice.zeaz.dev` | `` | `apps/zoffice` | `8091` | `api-ui` | `refactor-from-8090` | `STOPPED app=zoffice host=zoffice.zeaz.dev port=8091 path=apps/zoffice alias=none` |
| `ABTPi18n` | `abtpi18n.zeaz.dev` | `` | `apps/ABTPi18n` | `3010` | `ui` | `reserved` | `STOPPED app=ABTPi18n host=abtpi18n.zeaz.dev port=3010 path=apps/ABTPi18n alias=none` |
| `ABTPi18n-api` | `api-abtpi18n.zeaz.dev` | `` | `apps/ABTPi18n` | `8010` | `api` | `reserved` | `STOPPED app=ABTPi18n-api host=api-abtpi18n.zeaz.dev port=8010 path=apps/ABTPi18n alias=none` |
| `zwallet` | `zwallet.zeaz.dev` | `` | `apps/zwallet` | `8011` | `api-ui` | `reserved` | `STOPPED app=zwallet host=zwallet.zeaz.dev port=8011 path=apps/zwallet alias=none` |
| `zlms` | `zlms.zeaz.dev` | `` | `apps/zlms` | `8012` | `app` | `reserved` | `STOPPED app=zlms host=zlms.zeaz.dev port=8012 path=apps/zlms alias=none` |
| `zAcademy` | `academy.zeaz.dev` | `` | `apps/zAcademy` | `3013` | `ui` | `reserved` | `STOPPED app=zAcademy host=academy.zeaz.dev port=3013 path=apps/zAcademy alias=none` |
| `zsticker` | `zsticker.zeaz.dev` | `` | `apps/zsticker` | `8014` | `api-ui` | `reserved` | `STOPPED app=zsticker host=zsticker.zeaz.dev port=8014 path=apps/zsticker alias=none` |
| `zcino-modern` | `zcino-modern.zeaz.dev` | `` | `apps/zcino-modern` | `3015` | `ui` | `reserved` | `STOPPED app=zcino-modern host=zcino-modern.zeaz.dev port=3015 path=apps/zcino-modern alias=none` |
| `zcloud` | `zcloud.zeaz.dev` | `` | `apps/zcloud` | `3004` | `ui` | `active` | `STOPPED app=zcloud host=zcloud.zeaz.dev port=3004 path=apps/zcloud alias=none` |
| `zsp-aitool` | `ztest.zeaz.dev` | `` | `apps/zsp-aitool` | `3008` | `ui` | `active` | `STOPPED app=zsp-aitool host=ztest.zeaz.dev port=3008 path=apps/zsp-aitool alias=none` |
| `zcfdash-api` | `api-zcfdash.zeaz.dev` | `api-gateway` | `apps/api` | `8088` | `api` | `active` | `STOPPED app=zcfdash-api host=api-zcfdash.zeaz.dev port=8088 path=apps/api alias=api-gateway` |
| `ztrader-api` | `api-ztrader.zeaz.dev` | `ztrader` | `apps/ztrader` | `8016` | `api` | `active` | `STOPPED app=ztrader-api host=api-ztrader.zeaz.dev port=8016 path=apps/ztrader alias=ztrader` |
