# Critical Apps Deep-Dive

Generated: `2026-06-05T07:23:21Z`

Scope: `apps/ABTPi18n` and `apps/zkbtrader`.

This report is metadata-only. Environment values are never printed.

## Summary

| App | Exists | Size | Tracked Files | Nested Git | Import Source | Root Ignore | Local Forbidden Files | Generated Dirs |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: |
| ABTPi18n | True | 421M | 0 | False | True | .gitignore:58:apps/ABTPi18n/	apps/ABTPi18n | 0 | 2 |
| zkbtrader | True | 340M | 0 | False | True | .gitignore:63:apps/zkbtrader/	apps/zkbtrader | 1 | 15 |

## ABTPi18n

- Path: `apps/ABTPi18n`
- Size: `421M`
- Root tracked files: `0`
- Root ignore reason: `.gitignore:58:apps/ABTPi18n/	apps/ABTPi18n`
- Top-level dirs: `.copilot, .github, apps, configs, core, docs, monitoring, node_modules, scripts, strategies, tests, tools`

### Source Metadata

- Nested git: `False`
- Nested origin: `-`
- Nested branch: `-`
- Nested HEAD: `-`
- IMPORT_SOURCE.md: `True`

### Stack Files

- `apps/ABTPi18n/apps/backend/Dockerfile`
- `apps/ABTPi18n/apps/backend/requirements.txt`
- `apps/ABTPi18n/apps/frontend/Dockerfile`
- `apps/ABTPi18n/apps/frontend/package.json`
- `apps/ABTPi18n/docker-compose.yml`
- `apps/ABTPi18n/package.json`
- `apps/ABTPi18n/pnpm-lock.yaml`
- `apps/ABTPi18n/pyproject.toml`
- `apps/ABTPi18n/tools/package.json`

### Package Metadata

- `apps/ABTPi18n/apps/frontend/package.json` name=`frontend` version=`1.0.1` scripts=`build,dev,start` deps=`12` devDeps=`0`
- `apps/ABTPi18n/package.json` name=`zeaZdev-abtpro-i18n-monorepo` version=`1.0.1` scripts=`dev:backend,dev:frontend,format,format:js,format:py,generate-metaultra,install-metaultra,lint,lint:js,lint:py,preview-metaultra,prisma:generate,prisma:migrate,test:js,test:py,validate-metaultra` deps=`0` devDeps=`6`
- `apps/ABTPi18n/tools/package.json` name=`abtpi18n-tools` version=`1.0.0` scripts=`demo,screenshot,screenshot:help,test` deps=`1` devDeps=`0`
- `apps/ABTPi18n/pyproject.toml` name=`-` version=`-`

### Environment Files

- `apps/ABTPi18n/.env.example` keys=`POSTGRES_USER, POSTGRES_PASS, POSTGRES_DB, POSTGRES_PORT, DATABASE_URL, REDIS_URL, ENCRYPTION_KEY, FRONTEND_URL, NEXT_PUBLIC_BACKEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_URL, PROMPTPAY_MERCHANT_ID, PROMPTPAY_WEBHOOK_SECRET, PAYMENT_GATEWAY_URL, PLUGIN_REGISTRY_URL, PLUGIN_VERIFY_SIGNATURES, PLUGIN_MAX_MEMORY_MB, PLUGIN_MAX_CPU_PERCENT, ENABLE_PAPER_TRADING, MAX_CONCURRENT_BACKTESTS, BACKTEST_DATA_PATH, ENABLE_AUDIT_LOGGING, AUDIT_LOG_RETENTION_DAYS, AUDIT_LOG_LEVEL, AUDIT_SENSITIVE_FIELDS, BANDIT_CONFIG_PATH, SEMGREP_CONFIG, ENABLE_SECURITY_SCANNING, SECRET_ROTATION_POLICY_DAYS, SECRET_ROTATION_GRACE_PERIOD_DAYS, ENABLE_AUTO_ROTATION_ALERTS, DATABASE_REPLICA_URL, ENABLE_HEALTH_CHECKS, HEALTH_CHECK_INTERVAL_SECONDS, BACKUP_RETENTION_DAYS, TRADINGVIEW_WEBHOOK_SECRET, API_BASE_URL, BOT_BINANCE_API_KEY, BOT_BINANCE_API_SECRET, BOT_SYMBOLS, BOT_FIXED_NOTIONAL_USDT, BOT_MAX_CORRELATION, BOT_WEBSOCKET_TIMEOUT_SECONDS, BOT_HEARTBEAT_INTERVAL_SECONDS, BOT_MAX_RECONNECT_BACKOFF_SECONDS, BOT_MAX_CANDLES_PER_STREAM, BOT_INTERNAL_PORT, BOT_LEVERAGE, BOT_DATABASE_URL, BOT_ML_MODEL_PATH, BOT_DRY_RUN`

### Local Files That Must Not Be Committed

- None found

### Local Generated/Dependency/Cache Dirs

- `apps/ABTPi18n/apps/frontend/node_modules`
- `apps/ABTPi18n/node_modules`

### Safety Hints

- `paper`: 25 file(s), examples: `apps/ABTPi18n/CHANGELOG.md, apps/ABTPi18n/Grok.md, apps/ABTPi18n/README.md, apps/ABTPi18n/apps/backend/main.py, apps/ABTPi18n/apps/backend/src/api/backtest_endpoints.py`
- `trading`: 25 file(s), examples: `apps/ABTPi18n/.github/agents/abtpro_omega.agent.md, apps/ABTPi18n/CHANGELOG.md, apps/ABTPi18n/Grok.md, apps/ABTPi18n/README.md, apps/ABTPi18n/SECURITY.md`
- `exchange`: 25 file(s), examples: `apps/ABTPi18n/.github/agents/abtpro_omega.agent.md, apps/ABTPi18n/Grok.md, apps/ABTPi18n/README.md, apps/ABTPi18n/SECURITY.md, apps/ABTPi18n/apps/backend/main.py`
- `ccxt`: 19 file(s), examples: `apps/ABTPi18n/.github/agents/abtpro_omega.agent.md, apps/ABTPi18n/CHANGELOG.md, apps/ABTPi18n/Grok.md, apps/ABTPi18n/README.md, apps/ABTPi18n/apps/backend/requirements.txt`
- `binance`: 25 file(s), examples: `apps/ABTPi18n/.github/agents/abtpro_omega.agent.md, apps/ABTPi18n/Grok.md, apps/ABTPi18n/README.md, apps/ABTPi18n/apps/backend/main.py, apps/ABTPi18n/apps/backend/src/api/tradingview_endpoints.py`
- `kucoin`: 1 file(s), examples: `apps/ABTPi18n/docs/enterprise/FEATURES.en.md`
- `telegram`: 25 file(s), examples: `apps/ABTPi18n/CHANGELOG.md, apps/ABTPi18n/Grok.md, apps/ABTPi18n/README.md, apps/ABTPi18n/SECURITY.md, apps/ABTPi18n/apps/backend/main.py`
- `oauth`: 25 file(s), examples: `apps/ABTPi18n/CHANGELOG.md, apps/ABTPi18n/README.md, apps/ABTPi18n/SECURITY.md, apps/ABTPi18n/apps/backend/requirements.txt, apps/ABTPi18n/apps/backend/src/api/auth_endpoints.py`
- `promptpay`: 21 file(s), examples: `apps/ABTPi18n/CHANGELOG.md, apps/ABTPi18n/README.md, apps/ABTPi18n/apps/backend/requirements.txt, apps/ABTPi18n/apps/backend/src/api/payment_endpoints.py, apps/ABTPi18n/apps/backend/src/models.py`
- `tradingview`: 16 file(s), examples: `apps/ABTPi18n/README.md, apps/ABTPi18n/apps/backend/main.py, apps/ABTPi18n/apps/backend/src/api/tradingview_endpoints.py, apps/ABTPi18n/apps/backend/src/models.py, apps/ABTPi18n/apps/backend/src/services/gdrive_loader.py`
- `cloudflare`: 1 file(s), examples: `apps/ABTPi18n/Grok.md`
- `terraform`: 1 file(s), examples: `apps/ABTPi18n/docs/enterprise/DEPLOYMENT.en.md`
- `deploy`: 25 file(s), examples: `apps/ABTPi18n/Grok.md, apps/ABTPi18n/README.md, apps/ABTPi18n/SECURITY.md, apps/ABTPi18n/docs/enterprise/API_REFERENCE.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md`

## zkbtrader

- Path: `apps/zkbtrader`
- Size: `340M`
- Root tracked files: `0`
- Root ignore reason: `.gitignore:63:apps/zkbtrader/	apps/zkbtrader`
- Top-level dirs: `.agents, .claude, .codex, .github, .mypy_cache, .pytest_cache, .ruff_cache, .vendor, .venv, alembic, docs, harness, node_modules, prompts, reports, scripts, src, tests`

### Source Metadata

- Nested git: `False`
- Nested origin: `-`
- Nested branch: `-`
- Nested HEAD: `-`
- IMPORT_SOURCE.md: `True`

### Stack Files

- `apps/zkbtrader/.vendor/ECC/.opencode/package-lock.json`
- `apps/zkbtrader/.vendor/ECC/.opencode/package.json`
- `apps/zkbtrader/.vendor/ECC/package-lock.json`
- `apps/zkbtrader/.vendor/ECC/package.json`
- `apps/zkbtrader/.vendor/ECC/pyproject.toml`
- `apps/zkbtrader/.vendor/ECC/skills/skill-comply/pyproject.toml`
- `apps/zkbtrader/Makefile`
- `apps/zkbtrader/docker-compose.yml`
- `apps/zkbtrader/package-lock.json`
- `apps/zkbtrader/package.json`
- `apps/zkbtrader/pyproject.toml`

### Package Metadata

- `apps/zkbtrader/.vendor/ECC/.opencode/package.json` name=`ecc-universal` version=`2.0.0-rc.1` scripts=`build,clean,prepublishOnly` deps=`0` devDeps=`3`
- `apps/zkbtrader/.vendor/ECC/package.json` name=`ecc-universal` version=`2.0.0-rc.1` scripts=`build:opencode,catalog:check,catalog:sync,claw,command-registry:check,command-registry:generate,command-registry:write,coverage,dashboard,discussion:audit,harness:adapters,harness:audit,lint,observability:ready,operator:dashboard,orchestrate:status,orchestrate:tmux,orchestrate:worker,platform:audit,postinstall,prepack,preview-pack:smoke,release:approval-gate,release:video-suite,security:advisory-sources,security:ioc-scan,test` deps=`3` devDeps=`8`
- `apps/zkbtrader/package.json` name=`` version=`` scripts=`-` deps=`1` devDeps=`0`
- `apps/zkbtrader/.vendor/ECC/pyproject.toml` name=`llm-abstraction` version=`0.1.0`
- `apps/zkbtrader/.vendor/ECC/skills/skill-comply/pyproject.toml` name=`skill-comply` version=`0.1.0`
- `apps/zkbtrader/pyproject.toml` name=`zkbtrader` version=`0.2.0`

### Environment Files

- `apps/zkbtrader/.env` keys=`APP_ENV, EXECUTION_MODE, LIVE_TRADING_ENABLED, GLOBAL_KILL_SWITCH, API_HOST, API_PORT, POSTGRES_HOST_PORT, REDIS_HOST_PORT, LOG_LEVEL, DEFAULT_STAKE_CURRENCY, DEFAULT_SYMBOLS, PAPER_STARTING_USDT, PAPER_STARTING_BTC, GITHUB_TOKEN, GPG_PASSPHRASE`
- `apps/zkbtrader/.env.example` keys=`APP_ENV, EXECUTION_MODE, LIVE_TRADING_ENABLED, GLOBAL_KILL_SWITCH, API_HOST, API_PORT, POSTGRES_HOST_PORT, REDIS_HOST_PORT, LOG_LEVEL, DEFAULT_STAKE_CURRENCY, DEFAULT_SYMBOLS, PAPER_STARTING_USDT, PAPER_STARTING_BTC, DATABASE_URL, KUCOIN_BASE_URL, KUCOIN_SANDBOX`
- `apps/zkbtrader/.vendor/ECC/.env.example` keys=`ANTHROPIC_API_KEY, GITHUB_TOKEN, ASTRAFLOW_API_KEY, ASTRAFLOW_CN_API_KEY, GITHUB_USER, DEFAULT_BASE_BRANCH, SESSION_SCRIPT, CONFIG_FILE, ENABLE_VERBOSE_LOGGING`

### Local Files That Must Not Be Committed

- `apps/zkbtrader/.env`

### Local Generated/Dependency/Cache Dirs

- `apps/zkbtrader/.agents`
- `apps/zkbtrader/.claude`
- `apps/zkbtrader/.codex`
- `apps/zkbtrader/.mypy_cache`
- `apps/zkbtrader/.pytest_cache`
- `apps/zkbtrader/.ruff_cache`
- `apps/zkbtrader/.vendor/ECC/.agents`
- `apps/zkbtrader/.vendor/ECC/.claude`
- `apps/zkbtrader/.vendor/ECC/.codex`
- `apps/zkbtrader/.vendor/ECC/.gemini`
- `apps/zkbtrader/.venv`
- `apps/zkbtrader/node_modules`
- `apps/zkbtrader/src/zkbtrader/__pycache__`
- `apps/zkbtrader/src/zkbtrader/adapters/__pycache__`
- `apps/zkbtrader/tests/__pycache__`

### Safety Hints

- `paper`: 25 file(s), examples: `apps/zkbtrader/.vendor/ECC/.cursor/skills/frontend-slides/STYLE_PRESETS.md, apps/zkbtrader/.vendor/ECC/README.md, apps/zkbtrader/.vendor/ECC/agents/gan-evaluator.md, apps/zkbtrader/.vendor/ECC/agents/gan-generator.md, apps/zkbtrader/.vendor/ECC/agents/gan-planner.md`
- `live_trading`: 5 file(s), examples: `apps/zkbtrader/README.md, apps/zkbtrader/src/zkbtrader/api.py, apps/zkbtrader/src/zkbtrader/config.py, apps/zkbtrader/tests/test_api.py, apps/zkbtrader/tests/test_dashboard.py`
- `trading`: 25 file(s), examples: `apps/zkbtrader/.vendor/ECC/.kiro/skills/tdd-workflow/SKILL.md, apps/zkbtrader/.vendor/ECC/.opencode/prompts/agents/e2e-runner.txt, apps/zkbtrader/.vendor/ECC/README.md, apps/zkbtrader/.vendor/ECC/WORKING-CONTEXT.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/agents/e2e-runner.md`
- `exchange`: 20 file(s), examples: `apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/quarkus-tdd/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/tr/skills/quarkus-tdd/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/skills/cpp-coding-standards/SKILL.md, apps/zkbtrader/.vendor/ECC/skills/carrier-relationship-management/SKILL.md, apps/zkbtrader/.vendor/ECC/skills/cpp-coding-standards/SKILL.md`
- `kucoin`: 9 file(s), examples: `apps/zkbtrader/README.md, apps/zkbtrader/docs/prompt/zkbtrader-ecc-next.md, apps/zkbtrader/src/zkbtrader.egg-info/SOURCES.txt, apps/zkbtrader/src/zkbtrader/adapters/kucoin.py, apps/zkbtrader/src/zkbtrader/api.py`
- `telegram`: 13 file(s), examples: `apps/zkbtrader/.vendor/ECC/docs/HERMES-SETUP.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/the-openclaw-guide.md, apps/zkbtrader/.vendor/ECC/docs/releases/2.0.0-rc.1/article-outline.md, apps/zkbtrader/.vendor/ECC/docs/releases/2.0.0-rc.1/demo-prompts.md, apps/zkbtrader/.vendor/ECC/docs/releases/2.0.0-rc.1/owner-queue-cleanup-2026-05-18.md`
- `oauth`: 25 file(s), examples: `apps/zkbtrader/.vendor/ECC/README.md, apps/zkbtrader/.vendor/ECC/SECURITY.md, apps/zkbtrader/.vendor/ECC/agents/opensource-forker.md, apps/zkbtrader/.vendor/ECC/agents/opensource-sanitizer.md, apps/zkbtrader/.vendor/ECC/docs/ECC-2.0-GA-ROADMAP.md`
- `cloudflare`: 25 file(s), examples: `apps/zkbtrader/.vendor/ECC/.kiro/docs/shortform-guide.md, apps/zkbtrader/.vendor/ECC/.opencode/commands/harness-audit.md, apps/zkbtrader/.vendor/ECC/commands/harness-audit.md, apps/zkbtrader/.vendor/ECC/docs/ECC-2.0-GA-ROADMAP.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/homelab-pihole-dns/SKILL.md`
- `terraform`: 21 file(s), examples: `apps/zkbtrader/.vendor/ECC/CONTRIBUTING.md, apps/zkbtrader/.vendor/ECC/README.md, apps/zkbtrader/.vendor/ECC/README.zh-CN.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/CONTRIBUTING.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/README.md`
- `deploy`: 25 file(s), examples: `apps/zkbtrader/.vendor/ECC/.cursor/skills/bun-runtime/SKILL.md, apps/zkbtrader/.vendor/ECC/.kiro/README.md, apps/zkbtrader/.vendor/ECC/.kiro/agents/architect.json, apps/zkbtrader/.vendor/ECC/.kiro/agents/architect.md, apps/zkbtrader/.vendor/ECC/.kiro/agents/refactor-cleaner.json`
