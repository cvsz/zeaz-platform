# Build all stacks report

Generated: 2026-06-17T08:07:21Z

Mode: `safe`

| App | Stack | Command | Result |
|---|---|---|---|
| gateway | node-build | `cd 'apps/gateway' && npm run build` | FAIL:127 |
| gateway | python-compile | `cd 'apps/gateway' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| gateway | docker | RUN_DOCKER_BUILD=false | SKIP |
| zacademy | node-build | `cd 'apps/zacademy' && npm run build` | PASS |
| zacademy | python-compile | `cd 'apps/zacademy' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zacademy | docker | RUN_DOCKER_BUILD=false | SKIP |
| zai-factory | node | no build script | SKIP |
| zai-factory | docker | RUN_DOCKER_BUILD=false | SKIP |
| zaiz | node-build | `cd 'apps/zaiz' && npm run build` | FAIL:1 |
| zaiz | docker | RUN_DOCKER_BUILD=false | SKIP |
| zcfdash | python-compile | `cd 'apps/zcfdash' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zcfdash | docker | RUN_DOCKER_BUILD=false | SKIP |
| zcino | docker | RUN_DOCKER_BUILD=false | SKIP |
| zcloud | node-build | `cd 'apps/zcloud' && npm run build` | FAIL:1 |
| zcloud | docker | RUN_DOCKER_BUILD=false | SKIP |
| zdash | python-compile | `cd 'apps/zdash' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zdash | docker | RUN_DOCKER_BUILD=false | SKIP |
| zdev | node-build | `cd 'apps/zdev' && npm run build` | PASS |
| zdev | docker | RUN_DOCKER_BUILD=false | SKIP |
| zeaz-api | python-compile | `cd 'apps/zeaz-api' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zeaz-api | docker | RUN_DOCKER_BUILD=false | SKIP |
| zeaz-web | node-build | `cd 'apps/zeaz-web' && pnpm run build` | FAIL:1 |
| zeaz-web | docker | RUN_DOCKER_BUILD=false | SKIP |
| zfbauto | node-build | `cd 'apps/zfbauto' && pnpm run build` | FAIL:1 |
| zfbauto | docker | RUN_DOCKER_BUILD=false | SKIP |
| zlinebot | node-build | `cd 'apps/zlinebot' && npm run build` | PASS |
| zlinebot | python-compile | `cd 'apps/zlinebot' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zlinebot | docker | RUN_DOCKER_BUILD=false | SKIP |
| zlms | node-build | `cd 'apps/zlms' && pnpm run build` | PASS |
| zlms | python-compile | `cd 'apps/zlms' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zlms | docker | RUN_DOCKER_BUILD=false | SKIP |
| zoffice | docker | RUN_DOCKER_BUILD=false | SKIP |
| zorg | node-build | `cd 'apps/zorg' && npm run build` | FAIL:127 |
| zorg | docker | RUN_DOCKER_BUILD=false | SKIP |
| zow | node-build | `cd 'apps/zow' && pnpm run build` | PASS |
| zow | docker | RUN_DOCKER_BUILD=false | SKIP |
| zquest | docker | RUN_DOCKER_BUILD=false | SKIP |
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
