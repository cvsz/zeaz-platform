# Build all stacks report

Generated: 2026-06-11T00:29:57Z

Mode: `safe`

| App | Stack | Command | Result |
|---|---|---|---|
| api | python-compile | `cd 'apps/api' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| api | docker | RUN_DOCKER_BUILD=false | SKIP |
| openwork | node-build | `cd 'apps/openwork' && pnpm run build` | PASS |
| openwork | docker | RUN_DOCKER_BUILD=false | SKIP |
| web | node-build | `cd 'apps/web' && pnpm run build` | PASS |
| web | docker | RUN_DOCKER_BUILD=false | SKIP |
| zAcademy | node | no build script | SKIP |
| zAcademy | python-compile | `cd 'apps/zAcademy' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zAcademy | docker | RUN_DOCKER_BUILD=false | SKIP |
| zcfdash | docker | RUN_DOCKER_BUILD=false | SKIP |
| zcino | docker | RUN_DOCKER_BUILD=false | SKIP |
| zcino-modern | docker | RUN_DOCKER_BUILD=false | SKIP |
| zcloud | node-build | `cd 'apps/zcloud' && npm run build` | PASS |
| zcloud | docker | RUN_DOCKER_BUILD=false | SKIP |
| zdash | python-compile | `cd 'apps/zdash' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zdash | docker | RUN_DOCKER_BUILD=false | SKIP |
| zLinebot | node | no build script | SKIP |
| zLinebot | docker | RUN_DOCKER_BUILD=false | SKIP |
| zlms | node | no build script | SKIP |
| zlms | python-compile | `cd 'apps/zlms' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zlms | docker | RUN_DOCKER_BUILD=false | SKIP |
| zoffice | python-compile | `cd 'apps/zoffice' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zoffice | docker | RUN_DOCKER_BUILD=false | SKIP |
| zveo | python-compile | `cd 'apps/zveo' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zveo | docker | RUN_DOCKER_BUILD=false | SKIP |
| zwallet | node | no build script | SKIP |
| zwallet | python-compile | `cd 'apps/zwallet' && python3 -m compileall -q .       -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'` | PASS |
| zwallet | docker | RUN_DOCKER_BUILD=false | SKIP |
