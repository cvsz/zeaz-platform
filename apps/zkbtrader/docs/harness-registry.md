# ZKBTrader harness registry

This document defines project-local operating profiles for AI coding harnesses.

## External reference

- Reference repo: `affaan-m/ECC`
- License observed: MIT
- Integration mode: local guidance only, no vendored external implementation

## Required reading order

1. `README.md`
2. `AGENTS.md`
3. `SECURITY.md`
4. `docs/freqtrade-integration-plan.md`
5. `docs/agents/ecc-integration.md`

## Required checks

```bash
make lint
make typecheck
make test
make secret-scan
```

## Local profile IDs

- profile-a
- profile-b
- profile-c
- profile-d
- profile-e
- profile-f
- profile-g
- profile-h
- profile-all

Each profile must preserve paper-mode defaults, avoid secrets in files, and keep changes reviewable.
