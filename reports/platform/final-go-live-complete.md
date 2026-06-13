# ZeaZ Platform final go-live completion report

Generated: 2026-06-13T19:19:35Z
Repository: cvsz/zeaz-platform
Mode: read-only final-release verifier

This verifier does not deploy, mutate Cloudflare, rotate tokens, run live trading, run social automation, or apply Terraform.
It is designed to prove whether the repository is ready for final release and to leave a complete audit artifact.

## Required release gates

- Git diff whitespace check
- Makefile audit
- Apps source review report generation
- Apps port and routing asset generation
- Cloudflare apps Terraform formatting/validation when local Terraform and credentials are available
- Safe stack build/check pass when dependencies are installed
- Forbidden tracked secrets/state artifact check
- Final release evidence summary

## git diff whitespace check

```text
```

Result: PASS

## Makefile audit

```text
Makefile audit
- file: Makefile
- targets: 179
- duplicate targets: 0
- issues: 0
- warnings: 0
PASS: Makefile audit clean
```

Result: PASS

## apps source review

```text
PASS: wrote reports/platform/apps-source-review.json
PASS: wrote reports/platform/apps-source-review.md
Apps scanned: 18
Critical findings: 6
```

Result: PASS

## apps port refactor assets

```text
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/apps-port-refactor.md
PASS: wrote /home/zeazdev/zeaz-platform/terraform/cloudflare-apps/apps.auto.tfvars.json
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/cloudflare-tunnel-ingress.generated.yml
```

Result: PASS

## apps routing assets

```text
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/apps-routing.md
PASS: wrote /home/zeazdev/zeaz-platform/terraform/cloudflare-apps/apps.auto.tfvars.json
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/cloudflare-tunnel-ingress.md
```

Result: PASS

## Cloudflare apps Terraform format check

```text
```

Result: PASS

## Cloudflare apps Terraform validate

```text
[0m[1mInitializing provider plugins found in the configuration...[0m
- Reusing previous version of cloudflare/cloudflare from the dependency lock file
- Using previously-installed cloudflare/cloudflare v5.19.1


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
```

Result: PASS

## safe build all stacks

```text
Scanning apps/*
=== api :: python-compile ===
PASS: api python-compile
=== openwork :: node-build ===
FAIL: openwork node-build rc=1
=== web :: node-build ===
PASS: web node-build
=== zAcademy :: python-compile ===
PASS: zAcademy python-compile
=== zcloud :: node-build ===
PASS: zcloud node-build
=== zdash :: python-compile ===
PASS: zdash python-compile
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
=== zwallet :: python-compile ===
PASS: zwallet python-compile

PASS: wrote reports/platform/build-all-stacks.md
Logs: reports/platform/build-logs
```

Result: PASS

## active local origin check

```text
# Apps port origin check

Generated: 2026-06-13T19:27:20Z

| App | Hostname | Origin | Port | Status | Result |
|---|---|---|---:|---|---|
| root | `zeaz.dev` | `http://127.0.0.1:8787` | 8787 | active | FAIL:000 |
| root-www | `www.zeaz.dev` | `http://127.0.0.1:8787` | 8787 | active | FAIL:000 |
| ssh | `ssh.zeaz.dev` | `ssh://127.0.0.1:22022` | 22022 | active | PASS |
| web | `app.zeaz.dev` | `http://127.0.0.1:3003` | 3003 | active | PASS:200 |
| studio | `studio.zeaz.dev` | `http://127.0.0.1:3001` | 3001 | active | FAIL:000 |
| zdash | `zdash.zeaz.dev` | `http://127.0.0.1:5173` | 5173 | active | FAIL:000 |
| zdash-api | `api-zdash.zeaz.dev` | `http://127.0.0.1:8005` | 8005 | active | FAIL:000 |
| release | `release.zeaz.dev` | `http://127.0.0.1:5172` | 5172 | active | FAIL:000 |
| zveo | `zveo.zeaz.dev` | `http://127.0.0.1:3002` | 3002 | active | FAIL:000 |
| zveo-api | `api-zveo.zeaz.dev` | `http://127.0.0.1:8090` | 8090 | active | FAIL:000 |
| zkbtrader | `zkbtrader.zeaz.dev` | `http://127.0.0.1:8004` | 8004 | active | FAIL:000 |
| ztrader | `ztrader.zeaz.dev` | `http://127.0.0.1:3016` | 3016 | active | PASS:307 |
| zcino | `zcino.zeaz.dev` | `http://127.0.0.1:3000` | 3000 | active | FAIL:000 |
| cctv | `cctv.zeaz.dev` | `http://127.0.0.1:9292` | 9292 | active | FAIL:000 |
| zoffice | `zoffice.zeaz.dev` | `http://127.0.0.1:8091` | 8091 | refactor-from-8090 | FAIL:000 |
| zcloud | `zcloud.zeaz.dev` | `http://127.0.0.1:3004` | 3004 | active | FAIL:000 |
| zsp-aitool | `ztest.zeaz.dev` | `http://127.0.0.1:3008` | 3008 | active | FAIL:000 |
ERROR: active/refactor origins are not reachable
```

Result: WARN rc=1

## Forbidden tracked files

```text
reports/platform/build-logs/ABTPi18n-python-compile.log
reports/platform/build-logs/api-python-compile.log
reports/platform/build-logs/openwork-node-build.log
reports/platform/build-logs/web-node-build.log
reports/platform/build-logs/zAcademy-python-compile.log
reports/platform/build-logs/zcloud-node-build.log
reports/platform/build-logs/zdash-python-compile.log
reports/platform/build-logs/zkbtrader-python-compile.log
reports/platform/build-logs/zlms-prod-python-compile.log
reports/platform/build-logs/zlms-python-compile.log
reports/platform/build-logs/zoffice-python-compile.log
reports/platform/build-logs/zsp-aitool-node-build.log
reports/platform/build-logs/zsticker-python-compile.log
reports/platform/build-logs/ztrader-python-compile.log
reports/platform/build-logs/zveo-node-build.log
reports/platform/build-logs/zveo-python-compile.log
reports/platform/build-logs/zwallet-python-compile.log
```

Result: FAIL - forbidden tracked release files exist

## Apps source review summary

Generated: 2026-06-13T19:21:57Z
Apps scanned: 18
Critical count: 6

| App | Critical | Warnings | Notes |
|---|---:|---:|---|
| `api` | 0 | 0 | - |
| `openwork` | 1 | 6 | warn:local_env_file, warn:local_env_file, warn:local_env_file, warn:local_env_file, warn:local_env_file, warn:local_env_file |
| `web` | 0 | 0 | info:expected_port_not_detected |
| `zAcademy` | 0 | 4 | warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, info:expected_port_not_detected, info:expected_hostname_not_detected |
| `zLinebot` | 0 | 1 | warn:local_env_file |
| `zcfdash` | 0 | 0 | - |
| `zcino` | 0 | 1 | warn:local_env_file |
| `zcino-modern` | 0 | 0 | info:expected_port_not_detected, info:expected_hostname_not_detected |
| `zcloud` | 0 | 0 | info:expected_port_not_detected, info:expected_hostname_not_detected |
| `zdash` | 0 | 3 | warn:local_tooling_or_vendor_dir, warn:local_env_file, warn:local_env_file |
| `zdev` | 0 | 0 | - |
| `zlms` | 0 | 0 | info:expected_port_not_detected |
| `zoffice` | 0 | 1 | warn:local_env_file |
| `zsp-aitool` | 4 | 5 | critical:nested_git, warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, warn:local_env_file |
| `zsticker` | 0 | 1 | warn:local_env_file, info:expected_port_not_detected |
| `ztrader` | 0 | 1 | warn:local_env_file |
| `zveo` | 1 | 4 | critical:nested_git, warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, warn:local_env_file, warn:local_env_file, info:expected_port_not_detected |
| `zwallet` | 0 | 3 | warn:local_tooling_or_vendor_dir, warn:local_env_file, warn:local_env_file, info:expected_port_not_detected, info:expected_hostname_not_detected |

## Final release decision

Status: GO-LIVE BLOCKED

One or more required gates failed. Do not perform production DNS cutover or Terraform apply until failures are resolved.

Warnings were recorded. They do not block this verifier unless promoted to required checks by the release owner.

Report path: reports/platform/final-go-live-complete.md
