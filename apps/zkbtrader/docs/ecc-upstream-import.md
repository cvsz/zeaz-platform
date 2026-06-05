# ECC upstream import guide

ZKBTrader can use `affaan-m/ECC` as a local operator-system reference without vendoring the entire upstream repository.

## Why local-only import

ECC is MIT licensed, but the upstream repository is large and evolves independently. For ZKBTrader, the safer maintenance model is:

- clone ECC into `.vendor/ECC`
- keep `.vendor/ECC` ignored by git
- record the imported commit in `reports/ecc/ecc-lock.json`
- adapt only selected ideas into project-local files
- avoid overwriting existing ZKBTrader safety rules

## Source

- Repository: `https://github.com/affaan-m/ECC.git`
- License: MIT
- Local path: `.vendor/ECC`

## Import

```bash
bash scripts/ecc-import.sh
```

Pin a specific tag, branch, or commit:

```bash
ECC_REF=main bash scripts/ecc-import.sh
ECC_REF=<commit-sha> bash scripts/ecc-import.sh
```

Allow import with local uncommitted changes only when you understand the risk:

```bash
ALLOW_DIRTY=1 bash scripts/ecc-import.sh
```

Dry run:

```bash
DRY_RUN=1 bash scripts/ecc-import.sh
```

## Reports

Generated files:

- `reports/ecc/ecc-lock.json`
- `reports/ecc/ecc-summary.txt`

The reports are intended for local operator visibility. They should be reviewed before committing if you choose to track them.

## Safety rules

- Do not commit `.vendor/ECC`.
- Do not blindly copy upstream agent rules into ZKBTrader.
- Keep `AGENTS.md`, `SECURITY.md`, and README as the ZKBTrader source of truth.
- Keep live trading disabled.
- Keep paper mode as default.
- Keep all exchange private credentials out of repo.

## Suggested workflow

1. Pull latest ZKBTrader.
2. Run `bash scripts/ecc-import.sh`.
3. Review upstream ECC files locally.
4. Selectively update ZKBTrader-local docs, prompts, hooks, or profiles.
5. Run project checks:

```bash
make lint
make typecheck
make test
make secret-scan
```
