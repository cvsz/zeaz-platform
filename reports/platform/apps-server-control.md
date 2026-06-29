# Apps server control report

Generated: 2026-06-29T12:06:01Z
Action: `status`
Base plan: `configs/platform/apps-port-plan.json`
Overlay glob: `configs/platform/*-route-overlay.json`

| App | Hostname | Alias | Path | Port | Role | Status | Result |
|---|---|---|---|---:|---|---|---|
| `web-root` | `zeaz.dev` | `` | `apps/zeaz-web` | `3003` | `ui` | `active` | `RUNNING pid=37887 app=web-root host=zeaz.dev port=3003 path=apps/zeaz-web alias=none` |
| `zdash` | `zdash.zeaz.dev` | `` | `apps/zdash` | `5173` | `ui` | `active` | `STOPPED app=zdash host=zdash.zeaz.dev port=5173 path=apps/zdash alias=none` |
| `zdash-api` | `api-zdash.zeaz.dev` | `` | `apps/zdash` | `8005` | `api` | `active` | `STOPPED app=zdash-api host=api-zdash.zeaz.dev port=8005 path=apps/zdash alias=none` |
| `release` | `release.zeaz.dev` | `` | `apps/zdash` | `5172` | `evidence` | `active` | `STOPPED app=release host=release.zeaz.dev port=5172 path=apps/zdash alias=none` |
| `zveo` | `zveo.zeaz.dev` | `` | `apps/zveo` | `3002` | `ui` | `active` | `STOPPED app=zveo host=zveo.zeaz.dev port=3002 path=apps/zveo alias=none` |
| `zveo-api` | `api-zveo.zeaz.dev` | `` | `apps/zveo` | `8090` | `api` | `active` | `STOPPED app=zveo-api host=api-zveo.zeaz.dev port=8090 path=apps/zveo alias=none` |
| `ztrader` | `ztrader.zeaz.dev` | `` | `apps/ztrader` | `3016` | `ui` | `active` | `STOPPED app=ztrader host=ztrader.zeaz.dev port=3016 path=apps/ztrader alias=none` |
| `zcino` | `zcino.zeaz.dev` | `` | `apps/zcino` | `3000` | `ui` | `active` | `STOPPED app=zcino host=zcino.zeaz.dev port=3000 path=apps/zcino alias=none` |
| `zoffice` | `zoffice.zeaz.dev` | `` | `apps/zoffice` | `8091` | `api-ui` | `refactor-from-8090` | `STOPPED app=zoffice host=zoffice.zeaz.dev port=8091 path=apps/zoffice alias=none` |
| `zwallet` | `zwallet.zeaz.dev` | `` | `apps/zwallet` | `8011` | `api-ui` | `reserved` | `STOPPED app=zwallet host=zwallet.zeaz.dev port=8011 path=apps/zwallet alias=none` |
| `zlms` | `zlms.zeaz.dev` | `` | `apps/zlms` | `8012` | `app` | `reserved` | `STOPPED app=zlms host=zlms.zeaz.dev port=8012 path=apps/zlms alias=none` |
| `zAcademy` | `academy.zeaz.dev` | `` | `apps/zAcademy` | `3013` | `ui` | `reserved` | `STOPPED app=zAcademy host=academy.zeaz.dev port=3013 path=apps/zAcademy alias=none` |
| `zsticker` | `zsticker.zeaz.dev` | `` | `apps/zsticker` | `8014` | `api-ui` | `reserved` | `STOPPED app=zsticker host=zsticker.zeaz.dev port=8014 path=apps/zsticker alias=none` |
| `zcloud` | `zcloud.zeaz.dev` | `` | `apps/zcloud` | `3004` | `ui` | `active` | `STOPPED app=zcloud host=zcloud.zeaz.dev port=3004 path=apps/zcloud alias=none` |
| `zsp-aitool` | `ztest.zeaz.dev` | `` | `apps/zsp-aitool` | `3008` | `ui` | `active` | `STOPPED app=zsp-aitool host=ztest.zeaz.dev port=3008 path=apps/zsp-aitool alias=none` |
| `auth` | `auth.zeaz.dev` | `` | `apps/auth` | `9443` | `auth` | `active` | `STOPPED app=auth host=auth.zeaz.dev port=9443 path=apps/auth alias=none` |
| `zai-factory` | `factory.zeaz.dev` | `` | `apps/zai-factory` | `8710` | `ops` | `reserved` | `STOPPED app=zai-factory host=factory.zeaz.dev port=8710 path=apps/zai-factory alias=none` |
| `zstudio` | `zstudio.zeaz.dev` | `` | `apps/zstudio` | `3001` | `ui` | `active` | `STOPPED app=zstudio host=zstudio.zeaz.dev port=3001 path=apps/zstudio alias=none` |
| `analytics` | `analytics.zeaz.dev` | `` | `apps/analytics` | `3017` | `ui` | `reserved` | `STOPPED app=analytics host=analytics.zeaz.dev port=3017 path=apps/analytics alias=none` |
| `zpay` | `zpay.zeaz.dev` | `` | `apps/zpay` | `3018` | `api-ui` | `reserved` | `STOPPED app=zpay host=zpay.zeaz.dev port=3018 path=apps/zpay alias=none` |
| `ztreasury` | `ztreasury.zeaz.dev` | `` | `apps/ztreasury` | `3019` | `api-ui` | `reserved` | `STOPPED app=ztreasury host=ztreasury.zeaz.dev port=3019 path=apps/ztreasury alias=none` |
| `zow` | `zow.zeaz.dev` | `` | `apps/openwork` | `8092` | `ui` | `reserved` | `STOPPED app=zow host=zow.zeaz.dev port=8092 path=apps/openwork alias=none` |
| `zfbauto` | `zfbauto.zeaz.dev` | `` | `apps/zfbauto` | `3020` | `ui` | `reserved` | `STOPPED app=zfbauto host=zfbauto.zeaz.dev port=3020 path=apps/zfbauto alias=none` |
| `zagents` | `zagents.zeaz.dev` | `` | `apps/zagents` | `3009` | `ui` | `active` | `STOPPED app=zagents host=zagents.zeaz.dev port=3009 path=apps/zagents alias=none` |
| `zeaz-api` | `api.zeaz.dev` | `` | `apps/zeaz-api` | `8088` | `api` | `active` | `STOPPED app=zeaz-api host=api.zeaz.dev port=8088 path=apps/zeaz-api alias=none` |
| `zaiz` | `zaiz.zeaz.dev` | `` | `apps/zaiz` | `4103` | `ui` | `active` | `STOPPED app=zaiz host=zaiz.zeaz.dev port=4103 path=apps/zaiz alias=none` |
| `ztrader-api` | `api-ztrader.zeaz.dev` | `ztrader` | `apps/ztrader` | `8016` | `api` | `active` | `STOPPED app=ztrader-api host=api-ztrader.zeaz.dev port=8016 path=apps/ztrader alias=ztrader` |
