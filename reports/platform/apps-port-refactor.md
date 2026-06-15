# Apps port refactor plan

Base plan: `configs/platform/apps-port-plan.json`
Route overlays: `configs/platform/zcfdash-route-overlay.json, configs/platform/ztrader-route-overlay.json`

| App | Role | Path | Hostname | Port | Origin | Status | Alias | API Gateway |
|---|---|---|---|---:|---|---|---|---|
| web-root | ui | `apps/web` | `zeaz.dev` | 3003 | `http://127.0.0.1:3003` | active | `` | `` |
| web-www | ui | `apps/web` | `www.zeaz.dev` | 3003 | `http://127.0.0.1:3003` | active | `` | `` |
| ssh | tcp | `system/ssh` | `ssh.zeaz.dev` | 22022 | `ssh://127.0.0.1:22022` | active | `` | `` |
| zdash | ui | `apps/zdash` | `zdash.zeaz.dev` | 5173 | `http://127.0.0.1:5173` | active | `` | `` |
| zdash-api | api | `apps/zdash` | `api-zdash.zeaz.dev` | 8005 | `http://127.0.0.1:8005` | active | `` | `/v1/zdash` |
| release | evidence | `apps/zdash` | `release.zeaz.dev` | 5172 | `http://127.0.0.1:5172` | active | `` | `` |
| zveo | ui | `apps/zveo` | `zveo.zeaz.dev` | 3002 | `http://127.0.0.1:3002` | active | `` | `` |
| zveo-api | api | `apps/zveo` | `api-zveo.zeaz.dev` | 8090 | `http://127.0.0.1:8090` | active | `` | `/v1/zveo` |
| ztrader | ui | `apps/ztrader` | `ztrader.zeaz.dev` | 3016 | `http://127.0.0.1:3016` | active | `` | `/v1/ztrader` |
| zcino | ui | `apps/zcino` | `zcino.zeaz.dev` | 3000 | `http://127.0.0.1:3000` | active | `` | `/v1/zcino` |
| zoffice | api-ui | `apps/zoffice` | `zoffice.zeaz.dev` | 8091 | `http://127.0.0.1:8091` | refactor-from-8090 | `` | `/v1/zoffice` |
| zwallet | api-ui | `apps/zwallet` | `zwallet.zeaz.dev` | 8011 | `http://127.0.0.1:8011` | reserved | `` | `/v1/zwallet` |
| zlms | app | `apps/zlms` | `zlms.zeaz.dev` | 8012 | `http://127.0.0.1:8012` | reserved | `` | `/v1/zlms` |
| zAcademy | ui | `apps/zAcademy` | `academy.zeaz.dev` | 3013 | `http://127.0.0.1:3013` | reserved | `` | `` |
| zsticker | api-ui | `apps/zsticker` | `zsticker.zeaz.dev` | 8014 | `http://127.0.0.1:8014` | reserved | `` | `/v1/zsticker` |
| zcloud | ui | `apps/zcloud` | `zcloud.zeaz.dev` | 3004 | `http://127.0.0.1:3004` | active | `` | `` |
| zsp-aitool | ui | `apps/zsp-aitool` | `ztest.zeaz.dev` | 3008 | `http://127.0.0.1:3008` | active | `` | `` |
| auth | auth | `apps/auth` | `auth.zeaz.dev` | 9443 | `http://127.0.0.1:9443` | active | `` | `` |
| zai-factory | ops | `apps/zai-factory` | `factory.zeaz.dev` | 8710 | `http://127.0.0.1:8710` | reserved | `` | `/v1/factory` |
| zcfdash | ui | `apps/web` | `zcfdash.zeaz.dev` | 3003 | `http://127.0.0.1:3003` | active | `web` | `` |
| zcfdash-api | api | `apps/api` | `api-zcfdash.zeaz.dev` | 8088 | `http://127.0.0.1:8088` | active | `api-gateway` | `/api/runtime/cloudflare` |
| ztrader-api | api | `apps/ztrader` | `api-ztrader.zeaz.dev` | 8016 | `http://127.0.0.1:8016` | active | `ztrader` | `/api/v1` |

## Port usage

| Port | Apps |
|---:|---|
| 3000 | zcino |
| 3002 | zveo |
| 3003 | web-root, web-www, zcfdash |
| 3004 | zcloud |
| 3008 | zsp-aitool |
| 3013 | zAcademy |
| 3016 | ztrader |
| 5172 | release |
| 5173 | zdash |
| 8005 | zdash-api |
| 8011 | zwallet |
| 8012 | zlms |
| 8014 | zsticker |
| 8016 | ztrader-api |
| 8088 | zcfdash-api |
| 8090 | zveo-api |
| 8091 | zoffice |
| 8710 | zai-factory |
| 9443 | auth |
| 22022 | ssh |
