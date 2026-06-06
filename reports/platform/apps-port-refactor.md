# Apps port refactor plan

| App | Role | Path | Hostname | Port | Origin | Status | API Gateway |
|---|---|---|---|---:|---|---|---|
| root | landing | `.` | `zeaz.dev` | 8787 | `http://127.0.0.1:8787` | active | `` |
| root-www | landing | `.` | `www.zeaz.dev` | 8787 | `http://127.0.0.1:8787` | active | `` |
| ssh | tcp | `system/ssh` | `ssh.zeaz.dev` | 22022 | `ssh://127.0.0.1:22022` | active | `` |
| web | ui | `apps/web` | `app.zeaz.dev` | 3003 | `http://127.0.0.1:3003` | active | `` |
| studio | ui | `apps/web` | `studio.zeaz.dev` | 3001 | `http://127.0.0.1:3001` | active | `` |
| zdash | ui | `apps/zdash` | `zdash.zeaz.dev` | 5173 | `http://127.0.0.1:5173` | active | `` |
| zdash-api | api | `apps/zdash` | `api-zdash.zeaz.dev` | 8005 | `http://127.0.0.1:8005` | active | `/v1/zdash` |
| release | evidence | `apps/zdash` | `release.zeaz.dev` | 5172 | `http://127.0.0.1:5172` | active | `` |
| zveo | ui | `apps/zveo` | `zveo.zeaz.dev` | 3002 | `http://127.0.0.1:3002` | active | `` |
| zveo-api | api | `apps/zveo` | `api-zveo.zeaz.dev` | 8090 | `http://127.0.0.1:8090` | active | `/v1/zveo` |
| zkbtrader | api-ui | `apps/zkbtrader` | `zkbtrader.zeaz.dev` | 8004 | `http://127.0.0.1:8004` | active | `/v1/zkbtrader` |
| ztrader | ui | `apps/ztrader` | `ztrader.zeaz.dev` | 3016 | `http://127.0.0.1:3016` | active | `/v1/ztrader` |
| zcino | ui | `apps/zcino` | `zcino.zeaz.dev` | 3000 | `http://127.0.0.1:3000` | active | `/v1/zcino` |
| cctv | ui | `apps/cctv` | `cctv.zeaz.dev` | 9292 | `http://127.0.0.1:9292` | active | `/v1/cctv` |
| zoffice | api-ui | `apps/zoffice` | `zoffice.zeaz.dev` | 8091 | `http://127.0.0.1:8091` | refactor-from-8090 | `/v1/zoffice` |
| ABTPi18n | ui | `apps/ABTPi18n` | `abtpi18n.zeaz.dev` | 3010 | `http://127.0.0.1:3010` | reserved | `` |
| ABTPi18n-api | api | `apps/ABTPi18n` | `api-abtpi18n.zeaz.dev` | 8010 | `http://127.0.0.1:8010` | reserved | `/v1/abtpi18n` |
| zwallet | api-ui | `apps/zwallet` | `zwallet.zeaz.dev` | 8011 | `http://127.0.0.1:8011` | reserved | `/v1/zwallet` |
| zlms-prod | app | `apps/zlms-prod` | `zlms.zeaz.dev` | 8012 | `http://127.0.0.1:8012` | reserved | `/v1/zlms` |
| zAcademy | ui | `apps/zAcademy` | `academy.zeaz.dev` | 3013 | `http://127.0.0.1:3013` | reserved | `` |
| zsticker | api-ui | `apps/zsticker` | `zsticker.zeaz.dev` | 8014 | `http://127.0.0.1:8014` | reserved | `/v1/zsticker` |
| zcino-modern | ui | `apps/zcino-modern` | `zcino-modern.zeaz.dev` | 3015 | `http://127.0.0.1:3015` | reserved | `` |

## Port usage

| Port | Apps |
|---:|---|
| 3000 | zcino |
| 3001 | studio |
| 3002 | zveo |
| 3003 | web |
| 3010 | ABTPi18n |
| 3013 | zAcademy |
| 3015 | zcino-modern |
| 3016 | ztrader |
| 5172 | release |
| 5173 | zdash |
| 8004 | zkbtrader |
| 8005 | zdash-api |
| 8010 | ABTPi18n-api |
| 8011 | zwallet |
| 8012 | zlms-prod |
| 8014 | zsticker |
| 8090 | zveo-api |
| 8091 | zoffice |
| 8787 | root, root-www |
| 9292 | cctv |
| 22022 | ssh |
