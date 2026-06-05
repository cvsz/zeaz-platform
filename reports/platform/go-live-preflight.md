# Go live preflight report

Generated: 2026-06-05T18:03:53Z

Read-only gate. No deploy, no Terraform apply, no Cloudflare mutation, no token rotation, no live trading/social automation.


## git diff check

```text
Makefile:772: new blank line at EOF.
```

## apps source review strict

```text
make[1]: Entering directory '/home/zeazdev/zeaz-platform'
PASS: wrote reports/platform/apps-source-review.json
PASS: wrote reports/platform/apps-source-review.md
Apps scanned: 13
Critical findings: 2
make[1]: *** [Makefile:768: apps-source-review-strict] Error 1
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
=== ABTPi18n :: python-compile ===
PASS: ABTPi18n python-compile
=== api :: python-compile ===
PASS: api python-compile
=== openwork :: node-build ===
FAIL: openwork node-build rc=1
=== web :: node-build ===
PASS: web node-build
=== zAcademy :: python-compile ===
PASS: zAcademy python-compile
=== zdash :: python-compile ===
PASS: zdash python-compile
=== zkbtrader :: python-compile ===
PASS: zkbtrader python-compile
=== zlms-prod :: python-compile ===
PASS: zlms-prod python-compile
=== zoffice :: python-compile ===
FAIL: zoffice python-compile rc=1
=== zsticker :: python-compile ===
PASS: zsticker python-compile
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

Generated: 2026-06-05T18:06:25Z

| App | Hostname | Origin | Port | Status | Result |
|---|---|---|---:|---|---|
| root | `zeaz.dev` | `http://127.0.0.1:8787` | 8787 | active | FAIL:000 |
| root-www | `www.zeaz.dev` | `http://127.0.0.1:8787` | 8787 | active | FAIL:000 |
| ssh | `ssh.zeaz.dev` | `ssh://127.0.0.1:22022` | 22022 | active | PASS |
| web | `app.zeaz.dev` | `http://127.0.0.1:3003` | 3003 | active | FAIL:000 |
| studio | `studio.zeaz.dev` | `http://127.0.0.1:3001` | 3001 | active | PASS:200 |
| zdash | `zdash.zeaz.dev` | `http://127.0.0.1:5173` | 5173 | active | FAIL:000 |
| zdash-api | `api-zdash.zeaz.dev` | `http://127.0.0.1:8005` | 8005 | active | FAIL:000 |
| release | `release.zeaz.dev` | `http://127.0.0.1:5172` | 5172 | active | FAIL:000 |
| zveo | `zveo.zeaz.dev` | `http://127.0.0.1:3002` | 3002 | active | PASS:307 |
| zveo-api | `api-zveo.zeaz.dev` | `http://127.0.0.1:8090` | 8090 | active | PASS:404 |
| zkbtrader | `zkbtrader.zeaz.dev` | `http://127.0.0.1:8004` | 8004 | active | FAIL:000 |
| zcino | `zcino.zeaz.dev` | `http://127.0.0.1:3000` | 3000 | active | FAIL:000 |
| cctv | `cctv.zeaz.dev` | `http://127.0.0.1:9292` | 9292 | active | PASS:200 |
| zoffice | `zoffice.zeaz.dev` | `http://127.0.0.1:8091` | 8091 | refactor-from-8090 | FAIL:000 |
ERROR: active/refactor origins are not reachable
make[1]: *** [Makefile:721: apps-port-origin-check] Error 1
make[1]: Leaving directory '/home/zeazdev/zeaz-platform'
```

## forbidden tracked files

```text
.runtime/logs/full-zeaz-platform-zdash-validate.log
workers/zeaz-loading/.wrangler/state/v3/cache/miniflare-CacheObject/metadata.sqlite
FAIL: forbidden tracked files
```

## git status

```text
 M Makefile
 M apps/api/routers/scheduler.py
 M apps/zdash/.env.example
 M apps/zdash/CODE-OF-CONDUCT.md
 M apps/zdash/COMMUNITY.md
 M apps/zdash/CONTRIBUTING.md
 M apps/zdash/IMPORT_SOURCE.md
 M apps/zdash/Makefile
 M apps/zdash/README.md
 M apps/zdash/SECURITY.md
 M apps/zdash/docs/ops/SIGNED_RELEASE_ATTESTATION.md
 M apps/zdash/docs/releases/FINAL_RELEASE_NOTES.md
 M apps/zdash/docs/releases/v0.42.0-rc1.md
 M apps/zdash/docs/releases/v2.0.1.md
 M apps/zdash/docs/releases/v2.0.2.md
 M apps/zdash/docs/runbooks/ENTERPRISE_CUSTOMER_RUNBOOK.md
 M apps/zdash/docs/runbooks/INSTALLATION.md
 M apps/zdash/docs/runbooks/REALTIME_GATEWAY.md
 M apps/zdash/frontend/src/tests/useCollaboration.test.ts
 M apps/zdash/infra/cloudflare/tunnel-config.example.yml
 M apps/zdash/infra/k8s/configmap.yaml
 M apps/zdash/infra/k8s/nginx-ingress.yaml
 M apps/zdash/infra/scripts/cloudflare-dry-run.sh
 M apps/zdash/infra/terraform/variables.tf
 M apps/zoffice/app/gateway_presence.py
 M scripts/platform/review-apps-source.py
?? apps/ABTPi18n/.env.example
?? apps/openwork/
?? apps/zkbtrader/.env.example
?? apps/zoffice/.env.example
?? apps/zsticker/.env.example
?? reports/platform/apps-port-origin-check.md
?? reports/platform/apps-source-review.json
?? reports/platform/apps-source-review.md
?? reports/platform/build-all-stacks.md
?? reports/platform/go-live-preflight.md
?? scripts/platform/build-all-stacks.sh
?? scripts/platform/go-live-preflight.sh
```
