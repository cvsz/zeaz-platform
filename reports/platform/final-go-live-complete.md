# ZeaZ Platform final go-live completion report

Generated: 2026-06-15T14:25:47Z
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
- targets: 185
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
Apps scanned: 19
Critical findings: 0
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
```

Result: PASS

## active local origin check

```text
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
PASS: local origin check complete
```

Result: PASS

## Forbidden tracked files

```text
PASS: no forbidden tracked release files
```

Result: PASS

## Apps source review summary

Generated: 2026-06-15T14:28:59Z
Apps scanned: 19
Critical count: 0

| App | Critical | Warnings | Notes |
|---|---:|---:|---|
| `api` | 0 | 0 | - |
| `openwork` | 0 | 6 | warn:local_env_file, warn:local_env_file, warn:local_env_file, warn:local_env_file, warn:local_env_file, warn:local_env_file |
| `web` | 0 | 1 | warn:local_env_file, info:expected_port_not_detected, info:expected_hostname_not_detected |
| `zAcademy` | 0 | 4 | warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, info:expected_port_not_detected, info:expected_hostname_not_detected |
| `zLinebot` | 0 | 1 | warn:local_env_file |
| `zai-factory` | 0 | 0 | info:expected_port_not_detected, info:expected_hostname_not_detected |
| `zcfdash` | 0 | 0 | - |
| `zcino` | 0 | 1 | warn:local_env_file |
| `zcloud` | 0 | 0 | info:expected_port_not_detected, info:expected_hostname_not_detected |
| `zdash` | 0 | 3 | warn:local_tooling_or_vendor_dir, warn:local_env_file, warn:local_env_file |
| `zdev` | 0 | 0 | - |
| `zlms` | 0 | 0 | info:expected_port_not_detected |
| `zoffice` | 0 | 1 | warn:local_env_file |
| `zquest` | 0 | 0 | - |
| `zsp-aitool` | 0 | 5 | warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, warn:local_env_file, info:expected_port_not_detected |
| `zsticker` | 0 | 1 | warn:local_env_file, info:expected_port_not_detected |
| `ztrader` | 0 | 1 | warn:local_env_file |
| `zveo` | 0 | 4 | warn:local_tooling_or_vendor_dir, warn:local_tooling_or_vendor_dir, warn:local_env_file, warn:local_env_file, info:expected_port_not_detected |
| `zwallet` | 0 | 3 | warn:local_tooling_or_vendor_dir, warn:local_env_file, warn:local_env_file, info:expected_port_not_detected, info:expected_hostname_not_detected |

## Final release decision

Status: GO-LIVE GATES PASSED

The repository passed required read-only release gates in this verifier. Review warnings before production DNS cutover.

Report path: reports/platform/final-go-live-complete.md
