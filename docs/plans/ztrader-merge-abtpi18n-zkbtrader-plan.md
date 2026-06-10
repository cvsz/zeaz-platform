# zTrader Merge Planning: ABTPi18n + zkbtrader

Last updated: 2026-06-10

## Goal

Merge the useful parts of these source stacks into `apps/ztrader` without losing trading safety, i18n coverage, migration history, tests, or operational scripts:

```text
apps/ABTPi18n
apps/zkbtrader
```

Target stack:

```text
apps/ztrader
```

## Current decision

```text
DO NOT DELETE apps/ABTPi18n or apps/zkbtrader yet.
```

They may be deleted only after all merge gates below are completed and verified.

## Source stack responsibilities

### apps/ABTPi18n

Primary responsibilities to preserve:

- i18n/frontend language support
- ABTPro strategy-support metadata
- `configs/`
- `core/`
- `apps/`
- `strategies/`
- `monitoring/`
- release/verify/install scripts
- JS/Python lint/test workflow references

Known important files/directories:

```text
apps/ABTPi18n/package.json
apps/ABTPi18n/pyproject.toml
apps/ABTPi18n/configs/
apps/ABTPi18n/core/
apps/ABTPi18n/apps/
apps/ABTPi18n/strategies/
apps/ABTPi18n/monitoring/
apps/ABTPi18n/scripts/
apps/ABTPi18n/tests/
apps/ABTPi18n/verify.sh
apps/ABTPi18n/validate-release.sh
apps/ABTPi18n/release.sh
```

### apps/zkbtrader

Primary responsibilities to preserve:

- paper-trading safety model
- crypto research/backtesting harness
- API/worker split
- Alembic migrations
- test harness and coverage settings
- reports
- security/dev tooling references: ruff, mypy, bandit, pip-audit

Known important files/directories:

```text
apps/zkbtrader/pyproject.toml
apps/zkbtrader/alembic.ini
apps/zkbtrader/alembic/
apps/zkbtrader/docker-compose.yml
apps/zkbtrader/Dockerfile.api
apps/zkbtrader/Dockerfile.worker
apps/zkbtrader/src/
apps/zkbtrader/harness/
apps/zkbtrader/tests/
apps/zkbtrader/reports/
apps/zkbtrader/scripts/
apps/zkbtrader/Makefile
```

### apps/ztrader

Current target responsibilities:

- Next.js/TypeScript frontend
- FastAPI/Python backend
- Celery worker
- PostgreSQL
- Redis
- Docker Compose
- paper-mode default
- live-trading disabled by default
- global kill switch enabled by default
- i18n dependencies already present in frontend
- ccxt/trading/data dependencies already present in backend

Known important files/directories:

```text
apps/ztrader/frontend/
apps/ztrader/backend/
apps/ztrader/docker-compose.yml
apps/ztrader/Makefile
apps/ztrader/README.md
apps/ztrader/SECURITY.md
```

## Merge phases

### Phase 0 — Freeze and inventory

Create machine-readable inventories before moving anything.

```bash
cd /home/zeazdev/zeaz-platform
mkdir -p reports/merge/ztrader

find apps/ABTPi18n -type f | sort > reports/merge/ztrader/abtp-files.txt
find apps/zkbtrader -type f | sort > reports/merge/ztrader/zkbtrader-files.txt
find apps/ztrader -type f | sort > reports/merge/ztrader/ztrader-files-before.txt

diff -qr apps/ABTPi18n apps/ztrader > reports/merge/ztrader/abtp-vs-ztrader.diff || true
diff -qr apps/zkbtrader apps/ztrader > reports/merge/ztrader/zkbtrader-vs-ztrader.diff || true
```

Gate:

- inventory files exist
- diffs generated
- no deletion performed

### Phase 1 — ABTPi18n merge mapping

Map ABTPi18n features into zTrader paths.

Suggested target mapping:

| Source | Target |
|---|---|
| `apps/ABTPi18n/configs/` | `apps/ztrader/config/abtpi18n/` |
| `apps/ABTPi18n/core/` | `apps/ztrader/backend/src/ztrader/abt/core/` |
| `apps/ABTPi18n/strategies/` | `apps/ztrader/backend/src/ztrader/strategies/abtpi18n/` |
| `apps/ABTPi18n/monitoring/` | `apps/ztrader/backend/src/ztrader/monitoring/abtpi18n/` |
| `apps/ABTPi18n/scripts/` | `apps/ztrader/scripts/abtpi18n/` |
| `apps/ABTPi18n/tests/` | `apps/ztrader/backend/tests/abtpi18n/` |
| `apps/ABTPi18n/tools/` | `apps/ztrader/backend/src/ztrader/abt/tools/` |
| `apps/ABTPi18n/apps/backend/src/` | `apps/ztrader/backend/src/ztrader/abt/` |
| `apps/ABTPi18n/apps/frontend` if present | `apps/ztrader/frontend/` merge manually |

Gate:

- no ABTPi18n source-only feature remains unmapped
- i18n frontend dependencies remain in `apps/ztrader/frontend/package.json`
- ABTPi18n tests have zTrader-compatible import paths
- ABTPi18n strategy configs do not require old root path

### Phase 2 — zkbtrader merge mapping

Map zkbtrader features into zTrader paths.

Suggested target mapping:

| Source | Target |
|---|---|
| `apps/zkbtrader/src/` | `apps/ztrader/backend/src/ztrader/zkb/` |
| `apps/zkbtrader/harness/` | `apps/ztrader/harness/zkbtrader/` |
| `apps/zkbtrader/tests/` | `apps/ztrader/backend/tests/zkbtrader/` |
| `apps/zkbtrader/alembic/` | `apps/ztrader/backend/alembic/zkbtrader_source/` |
| `apps/zkbtrader/reports/` | `apps/ztrader/reports/zkbtrader/` |
| `apps/zkbtrader/scripts/` | `apps/ztrader/scripts/zkbtrader/` |

Gate:

- zkbtrader package modules import from zTrader paths
- Alembic migrations reviewed for conflicts before copy
- paper-mode and global kill switch remain default
- test harness runs from zTrader path

### Phase 3 — Safety consolidation

zTrader must keep these defaults:

```text
EXECUTION_MODE=paper
LIVE_TRADING_ENABLED=false
GLOBAL_KILL_SWITCH=true
```

Gate:

- no merged code path can place orders when `LIVE_TRADING_ENABLED=false`
- exchange keys are optional and never required for paper-mode tests
- no withdrawal/private-key handling introduced
- risk max notional and allowed symbols remain enforced

### Phase 4 — Build/test consolidation

Target commands:

```bash
cd /home/zeazdev/zeaz-platform/apps/ztrader

# frontend
cd frontend
npm install
npm run build

# backend
cd ../backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest

# compose
cd ..
docker compose config
docker compose up -d --build
docker compose ps
docker compose down
```

Gate:

- frontend build passes
- backend tests pass
- migrated ABTPi18n tests pass
- migrated zkbtrader tests pass
- docker compose config passes
- README reflects merged status

### Phase 5 — Archive before delete

Before deleting source paths, create an archive note:

```text
docs/reports/ztrader-merge-final-report.md
```

Must include:

- source commit
- moved feature list
- unmapped/deprecated file list
- test results
- final approval line

Gate:

- final report committed
- root README updated to mark ABTPi18n and zkbtrader as merged/deprecated
- zTrader README updated to say ABTPi18n + zkbtrader merged

### Phase 6 — Delete source app paths

Only after gates pass:

```bash
git rm -r apps/ABTPi18n apps/zkbtrader
git commit -m "Remove merged ABTPi18n and zkbtrader source apps"
```

Gate:

- no imports reference `apps/ABTPi18n`
- no imports reference `apps/zkbtrader`
- no docs claim those apps are active standalone stacks
- CI/build/test passes after deletion

## Current next action

Run Phase 0 inventory locally, then start Phase 1 and Phase 2 mapping with file-level diffs.

## Do not delete until

```text
ALL PHASE 0-5 GATES PASS
```
