# Build all stacks report

Generated: 2026-06-15T12:53:06Z

Mode: `safe`

| App | Stack | Command | Result |
|---|---|---|---|
| api | python-compile | `cd 'apps/api' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| api | docker | RUN_DOCKER_BUILD=false | SKIP |
| openwork | node-build | `cd 'apps/openwork' && pnpm run build` | PASS |
| openwork | docker | RUN_DOCKER_BUILD=false | SKIP |
| web | node-build | `cd 'apps/web' && pnpm run build` | FAIL:1 |
| web | docker | RUN_DOCKER_BUILD=false | SKIP |
| zAcademy | node-build | `cd 'apps/zAcademy' && npm run build` | PASS |
| zAcademy | python-compile | `cd 'apps/zAcademy' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zAcademy | docker | RUN_DOCKER_BUILD=false | SKIP |
| zLinebot | node-build | `cd 'apps/zLinebot' && npm run build` | PASS |
| zLinebot | python-compile | `cd 'apps/zLinebot' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zLinebot | docker | RUN_DOCKER_BUILD=false | SKIP |
| zai-factory | node | no build script | SKIP |
| zai-factory | docker | RUN_DOCKER_BUILD=false | SKIP |
| zcfdash | docker | RUN_DOCKER_BUILD=false | SKIP |
| zcino | docker | RUN_DOCKER_BUILD=false | SKIP |
| zcloud | node-build | `cd 'apps/zcloud' && npm run build` | PASS |
| zcloud | docker | RUN_DOCKER_BUILD=false | SKIP |
| zdash | python-compile | `cd 'apps/zdash' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zdash | docker | RUN_DOCKER_BUILD=false | SKIP |
| zdev | node-build | `cd 'apps/zdev' && npm run build` | PASS |
| zdev | docker | RUN_DOCKER_BUILD=false | SKIP |
| zlms | node-build | `cd 'apps/zlms' && pnpm run build` | PASS |
| zlms | python-compile | `cd 'apps/zlms' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zlms | docker | RUN_DOCKER_BUILD=false | SKIP |
| zoffice | python-compile | `cd 'apps/zoffice' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zoffice | docker | RUN_DOCKER_BUILD=false | SKIP |
| zquest | docker | RUN_DOCKER_BUILD=false | SKIP |
| zsp-aitool | node-build | `cd 'apps/zsp-aitool' && npm run build` | FAIL:1 |
| zsp-aitool | docker | RUN_DOCKER_BUILD=false | SKIP |
| zsticker | python-compile | `cd 'apps/zsticker' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zsticker | docker | RUN_DOCKER_BUILD=false | SKIP |
| ztrader | python-compile | `cd 'apps/ztrader' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| ztrader | docker | RUN_DOCKER_BUILD=false | SKIP |
| zveo | node-build | `cd 'apps/zveo' && pnpm run build` | FAIL:1 |
| zveo | python-compile | `cd 'apps/zveo' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zveo | docker | RUN_DOCKER_BUILD=false | SKIP |
| zwallet | node-build | `cd 'apps/zwallet' && pnpm run build` | PASS |
| zwallet | python-compile | `cd 'apps/zwallet' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zwallet | docker | RUN_DOCKER_BUILD=false | SKIP |
