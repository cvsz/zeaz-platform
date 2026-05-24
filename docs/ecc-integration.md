# ECC Integration for zeaz-platform

This repository integrates [affaan-m/ECC](https://github.com/affaan-m/ECC.git) through a safe wrapper script instead of vendoring the upstream source tree.

ECC describes itself as a harness-native operator system for agentic work across Claude Code, Codex, Cursor, OpenCode, Gemini, Zed, GitHub Copilot, and related harnesses. The upstream README also warns operators to choose one install path and avoid stacking plugin installs with full manual installs, because duplicate skills, commands, hooks, and runtime behavior can result.

## Source of truth

| Item | Value |
|---|---|
| Upstream repo | `https://github.com/affaan-m/ECC.git` |
| Upstream default branch | `main` |
| npm package | `ecc-universal` |
| Claude plugin identifier | `ecc@ecc` |
| Local wrapper | `scripts/ai/install-ecc.sh` |
| Local cache path | `.cache/ecc` |

## Design

The integration is intentionally pull-time/runtime only:

- Does not copy the full ECC repository into `cvsz/zeaz-platform`.
- Does not commit generated `.claude`, `.codex`, `.cursor`, `.agent`, `.gemini`, `.opencode`, `.qwen`, or `.zed` files.
- Defaults to `--dry-run` so operators can inspect the ECC install plan before mutation.
- Defaults to `--profile minimal` and `--target claude-project` to keep the install project-local and low-context.
- Guards `--profile full` behind `--allow-full` or `ECC_ALLOW_FULL_INSTALL=yes`.

## Quick preview

```bash
bash scripts/ai/install-ecc.sh \
  --profile minimal \
  --target claude-project
```

This clones ECC into `.cache/ecc`, checks out the configured ref, and prints the install plan without copying files.

## Apply project-local Claude integration

```bash
bash scripts/ai/install-ecc.sh \
  --apply \
  --profile minimal \
  --target claude-project
```

Expected target root:

```text
./.claude/
```

The repository `.gitignore` excludes `.claude/`, so generated files stay local unless an operator intentionally stages them.

## Codex integration

ECC exposes a `codex` install target that writes to the user-level Codex home directory.

Preview first:

```bash
bash scripts/ai/install-ecc.sh \
  --profile minimal \
  --target codex
```

Apply only after review:

```bash
bash scripts/ai/install-ecc.sh \
  --apply \
  --profile minimal \
  --target codex
```

Expected target root:

```text
~/.codex/
```

## Antigravity / Cursor project integration

Preview multiple project targets:

```bash
bash scripts/ai/install-ecc.sh \
  --profile minimal \
  --targets claude-project,antigravity,cursor
```

Apply multiple project targets:

```bash
bash scripts/ai/install-ecc.sh \
  --apply \
  --profile minimal \
  --targets claude-project,antigravity,cursor
```

Expected local target roots include:

```text
./.claude/
./.agent/
./.cursor/
```

## Selective component examples

Ask ECC for matching components upstream:

```bash
npx ecc consult "cloudflare terraform security reviews" --target claude
```

Preview selected components through the wrapper:

```bash
bash scripts/ai/install-ecc.sh \
  --profile minimal \
  --target claude-project \
  --with skill:terraform \
  --with skill:github-ops \
  --with skill:deployment-patterns
```

Apply after reviewing the plan:

```bash
bash scripts/ai/install-ecc.sh \
  --apply \
  --profile minimal \
  --target claude-project \
  --with skill:github-ops \
  --with skill:deployment-patterns
```

## Pin an upstream release or commit

Use `--ref` to pin a release tag, branch, or commit SHA:

```bash
bash scripts/ai/install-ecc.sh \
  --ref main \
  --profile minimal \
  --target claude-project
```

For reproducible production use, prefer a tag or commit SHA after testing.

## Full profile guard

The full ECC profile can install many surfaces. It is intentionally guarded:

```bash
ECC_ALLOW_FULL_INSTALL=yes \
  bash scripts/ai/install-ecc.sh \
  --apply \
  --profile full \
  --target claude-project
```

or:

```bash
bash scripts/ai/install-ecc.sh \
  --apply \
  --allow-full \
  --profile full \
  --target claude-project
```

Use this only if you intentionally want the larger context and runtime surface.

## Reset / cleanup

Remove local generated project files:

```bash
rm -rf .cache/ecc .claude .agent .cursor .gemini .zed .codebuddy .joycode
```

For user-level targets such as `codex`, use ECC's upstream uninstall guidance from the ECC repository root:

```bash
cd .cache/ecc
node scripts/uninstall.js --dry-run
```

Then run the non-dry-run uninstall only after reviewing the output.

## Validation

Local validation for this integration:

```bash
bash -n scripts/ai/install-ecc.sh
bash scripts/ai/install-ecc.sh --help
bash scripts/ai/install-ecc.sh --profile minimal --target claude-project
```

CI should not execute the live install path automatically. The wrapper is operator-triggered only.
