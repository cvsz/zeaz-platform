# Go live preflight report

Generated: 2026-06-15T14:14:16Z

Read-only gate. No deploy, no Terraform apply, no Cloudflare mutation, no token rotation, no live trading/social automation.


## git diff check

```text
```

## apps source review strict

```text
make[1]: Entering directory '/home/zeazdev/zeaz-platform'
PASS: wrote reports/platform/apps-source-review.json
PASS: wrote reports/platform/apps-source-review.md
Apps scanned: 19
Critical findings: 0
make[1]: Leaving directory '/home/zeazdev/zeaz-platform'
```

## apps port refactor generate

```text
make[1]: Entering directory '/home/zeazdev/zeaz-platform'
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/apps-port-refactor.md
PASS: wrote /home/zeazdev/zeaz-platform/terraform/cloudflare-apps/apps.auto.tfvars.json
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/cloudflare-tunnel-ingress.generated.yml
make[1]: Leaving directory '/home/zeazdev/zeaz-platform'
```

## terraform cloudflare apps validate

```text
make[1]: Entering directory '/home/zeazdev/zeaz-platform'
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/apps-port-refactor.md
PASS: wrote /home/zeazdev/zeaz-platform/terraform/cloudflare-apps/apps.auto.tfvars.json
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/cloudflare-tunnel-ingress.generated.yml
[0m[1mInitializing provider plugins found in the configuration...[0m
- Reusing previous version of cloudflare/cloudflare from the dependency lock file
- Using previously-installed cloudflare/cloudflare v5.19.1

[0m[1mInitializing the backend...[0m

[0m[1mInitializing provider plugins found in the state...[0m
- Reusing previous version of cloudflare/cloudflare
- Using previously-installed cloudflare/cloudflare v5.19.1


[0m[1m[32mTerraform has been successfully initialized![0m[32m[0m
[0m[32m
You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.[0m
[32m[1mSuccess![0m The configuration is valid.
[0m
make[1]: Leaving directory '/home/zeazdev/zeaz-platform'
```

## build all stacks safe

```text
make[1]: Entering directory '/home/zeazdev/zeaz-platform'
Scanning apps/*
=== api :: python-compile ===
PASS: api python-compile
=== openwork :: node-build ===
FAIL: openwork node-build rc=1
=== web :: node-build ===
FAIL: web node-build rc=1
=== zAcademy :: node-build ===
PASS: zAcademy node-build
=== zAcademy :: python-compile ===
PASS: zAcademy python-compile
=== zLinebot :: node-build ===
PASS: zLinebot node-build
=== zLinebot :: python-compile ===
PASS: zLinebot python-compile
=== zcloud :: node-build ===
PASS: zcloud node-build
=== zdash :: python-compile ===
PASS: zdash python-compile
=== zdev :: node-build ===
PASS: zdev node-build
=== zlms :: node-build ===
PASS: zlms node-build
=== zlms :: python-compile ===
PASS: zlms python-compile
=== zoffice :: python-compile ===
PASS: zoffice python-compile
=== zsp-aitool :: node-build ===
FAIL: zsp-aitool node-build rc=1
=== zsticker :: python-compile ===
PASS: zsticker python-compile
=== ztrader :: python-compile ===
PASS: ztrader python-compile
=== zveo :: node-build ===
FAIL: zveo node-build rc=1
=== zveo :: python-compile ===
PASS: zveo python-compile
=== zwallet :: node-build ===
PASS: zwallet node-build
=== zwallet :: python-compile ===
PASS: zwallet python-compile

PASS: wrote reports/platform/build-all-stacks.md
Logs: reports/platform/build-logs
make[1]: Leaving directory '/home/zeazdev/zeaz-platform'
```

## apps port origin check

```text
make[1]: Entering directory '/home/zeazdev/zeaz-platform'
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/apps-port-refactor.md
PASS: wrote /home/zeazdev/zeaz-platform/terraform/cloudflare-apps/apps.auto.tfvars.json
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/cloudflare-tunnel-ingress.generated.yml
# Apps port origin check

Generated: 2026-06-15T14:25:25Z

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
PASS: local origin check complete
make[1]: Leaving directory '/home/zeazdev/zeaz-platform'
```

## forbidden tracked files

```text
PASS: no forbidden tracked files
```

## git status

```text
 M configs/platform/apps-port-plan.json
 M reports/platform/apps-port-origin-check.md
 M reports/platform/apps-port-refactor.md
 M reports/platform/apps-source-review.json
 M reports/platform/apps-source-review.md
 M reports/platform/build-all-stacks.md
 M reports/platform/go-live-preflight.md
 M scripts/platform/check-port-origins.sh
 M scripts/platform/generate-port-refactor-assets.py
 M terraform/cloudflare-apps/apps.auto.tfvars.json
```
