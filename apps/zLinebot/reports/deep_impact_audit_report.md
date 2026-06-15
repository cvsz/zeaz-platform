# zLinebot Master Meta Deep Impact Dive Audit Scan

- Generated (UTC): 2026-04-04T00:54:40Z
- Repository root: /home/zeazdev/zLinebot
- Full project scan: true

## Domain Footprint

| Domain | Files | Estimated LOC |
|---|---:|---:|
| app/ | 206 | 11491 |
| admin/ | 17 | 3062 |
| mobile/ | 4 | 953 |
| ml/ | 18 | 599 |
| db/ | 19 | 302 |
| warehouse/ | 2 | 28 |
| flink/ | 3 | 231 |
| cloudflare/ | 4 | 86 |
| k8s/ | 31 | 811 |
| infra/ | 6 | 37 |
| scripts/ | 30 | 1551 |
| docs/ | 34 | 1558 |

## Quality & Security Checks

### Shellcheck
- Status: pass

### Secrets pattern scan
- Status: skipped (ripgrep not installed)

### Full project scan (scripts/lint_all.sh)
- Status: completed with findings/errors

```text
==> Linting Python (ruff)
ruff not found; installing into current Python environment
error: externally-managed-environment

× This environment is externally managed
╰─> To install Python packages system-wide, try apt install
    python3-xyz, where xyz is the package you are trying to
    install.
    
    If you wish to install a non-Debian-packaged Python package,
    create a virtual environment using python3 -m venv path/to/venv.
    Then use path/to/venv/bin/python and path/to/venv/bin/pip. Make
    sure you have python3-full installed.
    
    If you wish to install a non-Debian packaged Python application,
    it may be easiest to use pipx install xyz, which will manage a
    virtual environment for you. Make sure you have pipx installed.
    
    See /usr/share/doc/python3.12/README.venv for more information.

note: If you believe this is a mistake, please contact your Python installation or OS distribution provider. You can override this, at the risk of breaking your Python installation or OS, by passing --break-system-packages.
hint: See PEP 668 for the detailed specification.
```

## Existing Deep Impact Documentation
- Found: docs/FEATURE_DEEP_IMPACT_DIVE_2026-04.md
