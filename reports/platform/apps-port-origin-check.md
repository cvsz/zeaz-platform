# Apps port origin check

Generated: 2026-06-15T14:34:15Z

| App | Hostname | Origin | Port | Status | Mode | Probe | Result |
|---|---|---|---:|---|---|---|---|
| web-root | `zeaz.dev` | `http://127.0.0.1:3003` | 3003 | active | report-only | `http://127.0.0.1:3003/` | WARN:000 |
| web-www | `www.zeaz.dev` | `http://127.0.0.1:3003` | 3003 | active | report-only | `http://127.0.0.1:3003/` | WARN:000 |
| ssh | `ssh.zeaz.dev` | `ssh://127.0.0.1:22022` | 22022 | active | must-run | `tcp://127.0.0.1:22022` | PASS |
| zdash | `zdash.zeaz.dev` | `http://127.0.0.1:5173` | 5173 | active | must-run | `http://127.0.0.1:5173/` | PASS:200 |
| zdash-api | `api-zdash.zeaz.dev` | `http://127.0.0.1:8005` | 8005 | active | must-run | `http://127.0.0.1:8005/health` | PASS:200 |
| release | `release.zeaz.dev` | `http://127.0.0.1:5172` | 5172 | active | report-only | `http://127.0.0.1:5172/` | WARN:000 |
| zveo | `zveo.zeaz.dev` | `http://127.0.0.1:3002` | 3002 | active | report-only | `http://127.0.0.1:3002/` | WARN:000 |
| zveo-api | `api-zveo.zeaz.dev` | `http://127.0.0.1:8090` | 8090 | active | report-only | `http://127.0.0.1:8090/` | WARN:000 |
| ztrader | `ztrader.zeaz.dev` | `http://127.0.0.1:3016` | 3016 | active | report-only | `http://127.0.0.1:3016/` | PASS:307 |
| zcino | `zcino.zeaz.dev` | `http://127.0.0.1:3000` | 3000 | active | report-only | `http://127.0.0.1:3000/` | WARN:000 |
| zoffice | `zoffice.zeaz.dev` | `http://127.0.0.1:8091` | 8091 | refactor-from-8090 | must-run | `http://127.0.0.1:8091/health` | PASS:200 |
| zcloud | `zcloud.zeaz.dev` | `http://127.0.0.1:3004` | 3004 | active | report-only | `http://127.0.0.1:3004/` | WARN:000 |
| zsp-aitool | `ztest.zeaz.dev` | `http://127.0.0.1:3008` | 3008 | active | report-only | `http://127.0.0.1:3008/` | WARN:000 |
| auth | `auth.zeaz.dev` | `http://127.0.0.1:9443` | 9443 | active | report-only | `http://127.0.0.1:9443/` | WARN:000 |
