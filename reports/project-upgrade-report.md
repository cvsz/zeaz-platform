# zeaz-platform Full Project Upgrade Report

Generated: 2026-05-29T08:17:11Z
Repository root: /home/zeazdev/zeaz-platform

## Summary

This report runs CI-safe local checks for source health, tests, YAML syntax, shell syntax, Terraform formatting/validation, OpenTofu validation, Cloudflare docs context cache readiness, and repository hygiene.

Deployment secrets are treated as advisory here so the report can stay useful on fresh clones and CI. Use make[1]: Entering directory '/home/zeazdev/zeaz-platform'
Environment validation passed
make[1]: Leaving directory '/home/zeazdev/zeaz-platform' for strict deployment validation.

## Tool inventory

| Tool | Status |
|---|---|
| `git` | available |
| `bash` | available |
| `python3` | available |
| `pytest` | available |
| `terraform` | available |
| `tofu` | available |
| `cloudflared` | available |
| `curl` | available |
| `jq` | available |
| `shellcheck` | available |

## Git state

```text

HEAD: 4f6da33

Branch: main

```

### Environment advisory check

**Status:** `0`

```text
{"ok": true, "errors": [], "warnings": []}
```

### Pytest

**Status:** `0`

```text
...................................                                      [100%]
35 passed in 1.19s
```

### YAML validation

**Status:** `0`

```text
Validated 60 YAML files
```

### Shell syntax

**Status:** `0`

```text

```

### Shellcheck

**Status:** `0`

```text

```

### Terraform fmt check

**Status:** `0`

```text

```

### Terraform validate root

**Status:** `0`

```text
[32m[1mSuccess![0m The configuration is valid.
[0m
```

### OpenTofu

**Status:** `0`

```text
system /usr/bin/tofu appears to be a desktop UFO tool, not OpenTofu; install official opentofu binary or set TOFU_BIN
```

### Cloudflare docs cache fetch

**Status:** `1`

```text
curl: (6) Could not resolve host: developers.cloudflare.com
curl: (6) Could not resolve host: developers.cloudflare.com
curl: (6) Could not resolve host: developers.cloudflare.com
curl: (6) Could not resolve host: developers.cloudflare.com
[2026-05-29T08:17:37Z] WARN: failed to fetch https://developers.cloudflare.com/llms.txt
```

## Upgrade checklist

- [ ] Review `.env.example` against actual deployment values.
- [ ] Keep `COST_LOCK=true` for Free/no-cost operation.
- [ ] Run `make validate` after installing local dependencies.
- [ ] Run `make validate-env-strict` after real deployment values are filled.
- [ ] Review Terraform plan output before any apply.
- [ ] Run token lifecycle only in dry-run first.
- [ ] Confirm Cloudflare docs cache is refreshed before docs/API-related agent work.
- [ ] Do not commit `.env`, `.env.cloudflare`, `.cache`, tunnel credentials, origin certs, or state files.

## Recommended next commands

```bash
python3 -m pip install -r requirements-dev.txt
make setup-free
make validate
make yaml-validate
make tf-fmt-check
make tf-validate
bash scripts/project-upgrade-report.sh
```
