#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

REPORT="reports/platform/build-all-stacks.md"
LOG_DIR="reports/platform/build-logs"
mkdir -p "$LOG_DIR" "$(dirname "$REPORT")"

MODE="${MODE:-safe}"
RUN_INSTALL="${RUN_INSTALL:-false}"
RUN_DOCKER_BUILD="${RUN_DOCKER_BUILD:-false}"

cat > "$REPORT" <<EOF_REPORT
# Build all stacks report

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

Mode: \`$MODE\`

| App | Stack | Command | Result |
|---|---|---|---|
EOF_REPORT

run_step() {
  local app="$1"
  local stack="$2"
  local command="$3"
  local logfile="$LOG_DIR/${app//\//_}-${stack}.log"

  echo "=== $app :: $stack ==="
  echo "\$ $command" > "$logfile"

  set +e
  bash -lc "$command" >> "$logfile" 2>&1
  local rc=$?
  set -e

  if [ "$rc" -eq 0 ]; then
    echo "| $app | $stack | \`$command\` | PASS |" >> "$REPORT"
    echo "PASS: $app $stack"
  else
    echo "| $app | $stack | \`$command\` | FAIL:$rc |" >> "$REPORT"
    echo "FAIL: $app $stack rc=$rc"
    return "$rc"
  fi
}

detect_node_pm() {
  local dir="$1"
  if [ -f "$dir/pnpm-lock.yaml" ]; then
    echo "pnpm"
  elif [ -f "$dir/yarn.lock" ]; then
    echo "yarn"
  elif [ -f "$dir/package-lock.json" ]; then
    echo "npm"
  elif [ -f "$dir/package.json" ]; then
    echo "npm"
  else
    echo ""
  fi
}

node_build() {
  local app="$1"
  local dir="$2"
  local pm
  pm="$(detect_node_pm "$dir")"

  [ -n "$pm" ] || return 0

  local build_cmd=""
  case "$pm" in
    pnpm)
      if [ "$RUN_INSTALL" = "true" ]; then
        run_step "$app" "node-install" "cd '$dir' && corepack enable && pnpm install --frozen-lockfile"
      fi
      build_cmd="cd '$dir' && pnpm run build"
      ;;
    yarn)
      if [ "$RUN_INSTALL" = "true" ]; then
        run_step "$app" "node-install" "cd '$dir' && yarn install --frozen-lockfile"
      fi
      build_cmd="cd '$dir' && yarn build"
      ;;
    npm)
      if [ "$RUN_INSTALL" = "true" ]; then
        run_step "$app" "node-install" "cd '$dir' && npm ci"
      fi
      build_cmd="cd '$dir' && npm run build"
      ;;
  esac

  if grep -q '"build"' "$dir/package.json" 2>/dev/null; then
    run_step "$app" "node-build" "$build_cmd" || true
  else
    echo "| $app | node | no build script | SKIP |" >> "$REPORT"
  fi
}

python_check() {
  local app="$1"
  local dir="$2"

  if [ -f "$dir/pyproject.toml" ] || find "$dir" -maxdepth 3 -name 'requirements*.txt' | grep -q . || find "$dir" -maxdepth 3 -name '*.py' | grep -q .; then
    run_step "$app" "python-compile" "cd '$dir' && python3 -m compileall -q . \
      -x '(.venv|venv|node_modules|dist|build|__pycache__|.pytest_cache|.ruff_cache|.mypy_cache)'" || true
  fi
}

docker_build() {
  local app="$1"
  local dir="$2"

  [ "$RUN_DOCKER_BUILD" = "true" ] || {
    echo "| $app | docker | RUN_DOCKER_BUILD=false | SKIP |" >> "$REPORT"
    return 0
  }

  if [ -f "$dir/docker-compose.yml" ]; then
    run_step "$app" "docker-compose-build" "cd '$dir' && docker compose build" || true
  elif [ -f "$dir/Dockerfile" ]; then
    local tag
    tag="zeaz-${app//\//-}:local"
    run_step "$app" "docker-build" "cd '$dir' && docker build -t '$tag' ." || true
  fi
}

echo "Scanning apps/*"

for appdir in apps/*; do
  [ -d "$appdir" ] || continue

  app="$(basename "$appdir")"

  case "$app" in
    */node_modules|node_modules|.venv|venv)
      continue
      ;;
  esac

  node_build "$app" "$appdir"
  python_check "$app" "$appdir"
  docker_build "$app" "$appdir"
done

echo
echo "PASS: wrote $REPORT"
echo "Logs: $LOG_DIR"
