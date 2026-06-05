# Build all stacks report

Generated: 2026-06-05T18:05:22Z

Mode: `safe`

| App | Stack | Command | Result |
|---|---|---|---|
| ABTPi18n | node | no build script | SKIP |
| ABTPi18n | python-compile | `cd 'apps/ABTPi18n' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| ABTPi18n | docker | RUN_DOCKER_BUILD=false | SKIP |
| api | python-compile | `cd 'apps/api' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| api | docker | RUN_DOCKER_BUILD=false | SKIP |
| openwork | node-build | `cd 'apps/openwork' && pnpm run build` | FAIL:1 |
| openwork | docker | RUN_DOCKER_BUILD=false | SKIP |
| web | node-build | `cd 'apps/web' && npm run build` | PASS |
| web | docker | RUN_DOCKER_BUILD=false | SKIP |
| zAcademy | node | no build script | SKIP |
| zAcademy | python-compile | `cd 'apps/zAcademy' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zAcademy | docker | RUN_DOCKER_BUILD=false | SKIP |
| zcino | docker | RUN_DOCKER_BUILD=false | SKIP |
| zcino-modern | docker | RUN_DOCKER_BUILD=false | SKIP |
| zdash | python-compile | `cd 'apps/zdash' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zdash | docker | RUN_DOCKER_BUILD=false | SKIP |
| zkbtrader | node | no build script | SKIP |
| zkbtrader | python-compile | `cd 'apps/zkbtrader' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zkbtrader | docker | RUN_DOCKER_BUILD=false | SKIP |
| zlms-prod | node | no build script | SKIP |
| zlms-prod | python-compile | `cd 'apps/zlms-prod' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zlms-prod | docker | RUN_DOCKER_BUILD=false | SKIP |
| zoffice | python-compile | `cd 'apps/zoffice' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | FAIL:1 |
| zoffice | docker | RUN_DOCKER_BUILD=false | SKIP |
| zsticker | python-compile | `cd 'apps/zsticker' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zsticker | docker | RUN_DOCKER_BUILD=false | SKIP |
| zwallet | node | no build script | SKIP |
| zwallet | python-compile | `cd 'apps/zwallet' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zwallet | docker | RUN_DOCKER_BUILD=false | SKIP |
