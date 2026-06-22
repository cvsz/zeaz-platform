# Apps port refactor plan

Base plan: `configs/platform/apps-port-plan.json`
Route overlays: `configs/platform/zcfdash-route-overlay.json, configs/platform/ztrader-route-overlay.json`

| App | Role | Path | Hostname | Port | Origin | Status | Check Mode | Health Path | Alias | API Gateway |
|---|---|---|---|---:|---|---|---|---|---|---|
| web-root | ui | `apps/zeaz-web` | `zeaz.dev` | 3003 | `http://127.0.0.1:3003` | active | report-only | `` | `` | `` |
| web-www | ui | `apps/zeaz-web` | `www.zeaz.dev` | 3003 | `http://127.0.0.1:3003` | active | report-only | `` | `` | `` |
| ssh | tcp | `system/ssh` | `ssh.zeaz.dev` | 22022 | `ssh://127.0.0.1:22022` | active |  | `` | `` | `` |
| zdash | ui | `apps/zdash` | `zdash.zeaz.dev` | 5173 | `http://127.0.0.1:5173` | active | must-run | `` | `` | `` |
| zdash-api | api | `apps/zdash` | `api-zdash.zeaz.dev` | 8005 | `http://127.0.0.1:8005` | active | must-run | `/health` | `` | `/v1/zdash` |
| release | evidence | `apps/zdash` | `release.zeaz.dev` | 5172 | `http://127.0.0.1:5172` | active | report-only | `` | `` | `` |
| zveo | ui | `apps/zveo` | `zveo.zeaz.dev` | 3002 | `http://127.0.0.1:3002` | active | report-only | `` | `` | `` |
| zveo-api | api | `apps/zveo` | `api-zveo.zeaz.dev` | 8090 | `http://127.0.0.1:8090` | active | report-only | `` | `` | `/v1/zveo` |
| ztrader | ui | `apps/ztrader` | `ztrader.zeaz.dev` | 3016 | `http://127.0.0.1:3016` | active | report-only | `` | `` | `/v1/ztrader` |
| zcino | ui | `apps/zcino` | `zcino.zeaz.dev` | 3000 | `http://127.0.0.1:3000` | active | report-only | `` | `` | `/v1/zcino` |
| zoffice | api-ui | `apps/zoffice` | `zoffice.zeaz.dev` | 8091 | `http://127.0.0.1:8091` | refactor-from-8090 | must-run | `/health` | `` | `/v1/zoffice` |
| zwallet | api-ui | `apps/zwallet` | `zwallet.zeaz.dev` | 8011 | `http://127.0.0.1:8011` | reserved |  | `` | `` | `/v1/zwallet` |
| zlms | app | `apps/zlms` | `zlms.zeaz.dev` | 8012 | `http://127.0.0.1:8012` | reserved |  | `` | `` | `/v1/zlms` |
| zAcademy | ui | `apps/zAcademy` | `academy.zeaz.dev` | 3013 | `http://127.0.0.1:3013` | reserved |  | `` | `` | `` |
| zsticker | api-ui | `apps/zsticker` | `zsticker.zeaz.dev` | 8014 | `http://127.0.0.1:8014` | reserved |  | `` | `` | `/v1/zsticker` |
| zcloud | ui | `apps/zcloud` | `zcloud.zeaz.dev` | 3004 | `http://127.0.0.1:3004` | active | report-only | `` | `` | `` |
| zsp-aitool | ui | `apps/zsp-aitool` | `ztest.zeaz.dev` | 3008 | `http://127.0.0.1:3008` | active | report-only | `` | `` | `` |
| auth | auth | `apps/auth` | `auth.zeaz.dev` | 9443 | `http://127.0.0.1:9443` | active | report-only | `` | `` | `` |
| zai-factory | ops | `apps/zai-factory` | `factory.zeaz.dev` | 8710 | `http://127.0.0.1:8710` | reserved |  | `` | `` | `/v1/factory` |
| zstudio | ui | `apps/zstudio` | `zstudio.zeaz.dev` | 3001 | `http://127.0.0.1:3001` | active |  | `` | `` | `` |
| analytics | ui | `apps/analytics` | `analytics.zeaz.dev` | 3017 | `http://127.0.0.1:3017` | reserved |  | `` | `` | `` |
| zpay | api-ui | `apps/zpay` | `zpay.zeaz.dev` | 3018 | `http://127.0.0.1:3018` | reserved |  | `` | `` | `` |
| ztreasury | api-ui | `apps/ztreasury` | `ztreasury.zeaz.dev` | 3019 | `http://127.0.0.1:3019` | reserved |  | `` | `` | `` |
| zacademy | ui | `apps/zAcademy` | `zacademy.zeaz.dev` | 3013 | `http://127.0.0.1:3013` | reserved |  | `` | `` | `` |
| zow | ui | `apps/openwork` | `zow.zeaz.dev` | 8092 | `http://127.0.0.1:8092` | reserved |  | `` | `` | `` |
| zfbauto | ui | `apps/zfbauto` | `zfbauto.zeaz.dev` | 3020 | `http://127.0.0.1:3020` | reserved |  | `` | `` | `` |
| zagents | ui | `apps/zagents` | `zagents.zeaz.dev` | 3009 | `http://127.0.0.1:3009` | active |  | `` | `` | `` |
| zeaz-api | api | `apps/zeaz-api` | `api.zeaz.dev` | 8088 | `http://127.0.0.1:8088` | active |  | `` | `` | `/v1` |
| zaiz | ui | `apps/zaiz` | `zaiz.zeaz.dev` | 4103 | `http://127.0.0.1:4103` | active |  | `` | `` | `` |
| zcfdash | ui | `apps/zeaz-web` | `zcfdash.zeaz.dev` | 3003 | `http://127.0.0.1:3003` | active |  | `` | `web` | `` |
| zcfdash-api | api | `apps/zeaz-api` | `api-zcfdash.zeaz.dev` | 8088 | `http://127.0.0.1:8088` | active |  | `` | `api-gateway` | `/api/runtime/cloudflare` |
| ztrader-api | api | `apps/ztrader` | `api-ztrader.zeaz.dev` | 8016 | `http://127.0.0.1:8016` | active |  | `` | `ztrader` | `/api/v1` |

## Port usage

| Port | Apps |
|---:|---|
| 3000 | zcino |
| 3001 | zstudio |
| 3002 | zveo |
| 3003 | web-root, web-www, zcfdash |
| 3004 | zcloud |
| 3008 | zsp-aitool |
| 3009 | zagents |
| 3013 | zAcademy, zacademy |
| 3016 | ztrader |
| 3017 | analytics |
| 3018 | zpay |
| 3019 | ztreasury |
| 3020 | zfbauto |
| 4103 | zaiz |
| 5172 | release |
| 5173 | zdash |
| 8005 | zdash-api |
| 8011 | zwallet |
| 8012 | zlms |
| 8014 | zsticker |
| 8016 | ztrader-api |
| 8088 | zeaz-api, zcfdash-api |
| 8090 | zveo-api |
| 8091 | zoffice |
| 8092 | zow |
| 8710 | zai-factory |
| 9443 | auth |
| 22022 | ssh |
