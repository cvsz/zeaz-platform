# zeaz.dev apps routing inventory

| App | Path | Type | Hostname(s) | Origin | Port | Status | API Prefix |
|---|---|---|---|---|---:|---|---|
| root | `apps/zeaz-web` | ui | `zeaz.dev, www.zeaz.dev` | `http://127.0.0.1:3003` | `3003` | active | `` |
| ssh | `system/ssh` | tcp | `ssh.zeaz.dev` | `ssh://127.0.0.1:22022` | `22022` | active | `` |
| zwallet | `apps/zwallet` | ui | `app.zeaz.dev` | `http://127.0.0.1:3003` | `3003` | active | `` |
| studio | `apps/zoffice` | ui | `studio.zeaz.dev` | `http://127.0.0.1:3001` | `3001` | active | `` |
| zveo | `apps/zveo` | ui | `zveo.zeaz.dev` | `http://127.0.0.1:3002` | `3002` | active | `` |
| zveo-api | `apps/zveo` | api | `api-zveo.zeaz.dev` | `http://127.0.0.1:8090` | `8090` | active | `/v1/zveo` |
| cctv | `apps/cctv` | ui | `cctv.zeaz.dev` | `http://127.0.0.1:9292` | `9292` | active | `/v1/cctv` |
| zkbtrader | `apps/zkbtrader` | app | `zkbtrader.zeaz.dev` | `http://127.0.0.1:8004` | `8004` | active | `/v1/zkbtrader` |
| zdash | `apps/zdash` | ui | `zdash.zeaz.dev` | `http://127.0.0.1:5173` | `5173` | active | `` |
| zdash-api | `apps/zdash` | api | `api-zdash.zeaz.dev` | `http://127.0.0.1:8005` | `8005` | active | `/v1/zdash` |
| release | `apps/zdash` | evidence | `release.zeaz.dev` | `http://127.0.0.1:5172` | `5172` | active | `` |
| zcino | `apps/zcino` | ui | `zcino.zeaz.dev` | `http://127.0.0.1:3000` | `3000` | active | `/v1/zcino` |
| zoffice | `apps/zoffice` | app | `zoffice.zeaz.dev` | `http://127.0.0.1:8090` | `8090` | needs-review | `/v1/zoffice` |
| ABTPi18n | `apps/ABTPi18n` | app | `abtpi18n.zeaz.dev` | `http://127.0.0.1:3001` | `3001` | reserved | `` |
| zwallet | `apps/zwallet` | app | `zwallet.zeaz.dev` | `` | `` | reserved | `/v1/zwallet` |
| zlms | `apps/zlms` | app | `zlms.zeaz.dev` | `` | `` | reserved | `/v1/zlms` |
| zAcademy | `apps/zAcademy` | app | `academy.zeaz.dev` | `` | `` | reserved | `` |
| zsticker | `apps/zsticker` | app | `zsticker.zeaz.dev` | `` | `` | reserved | `` |

## Port usage

| Port | Apps |
|---:|---|
| 3000 | zcino |
| 3001 | studio, ABTPi18n |
| 3002 | zveo |
| 3003 | root, zwallet |
| 5172 | release |
| 5173 | zdash |
| 8004 | zkbtrader |
| 8005 | zdash-api |
| 8090 | zveo-api, zoffice |
| 9292 | cctv |
| 22022 | ssh |
