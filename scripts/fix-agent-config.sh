#!/usr/bin/env bash
# fix-agent-config.sh

set -Eeuo pipefail

CONFIG_FILE="${1:-config.toml}"

if [[ ! -f "${CONFIG_FILE}" ]]; then
  echo "[ERROR] config file not found: ${CONFIG_FILE}"
  exit 1
fi

TMP_FILE="$(mktemp)"

echo "[INFO] fixing agent schema in ${CONFIG_FILE}"

python3 - "${CONFIG_FILE}" "${TMP_FILE}" <<'PY'
from __future__ import annotations

import re
import sys
from pathlib import Path

src = Path(sys.argv[1])
dst = Path(sys.argv[2])

content = src.read_text(encoding="utf-8")

lines = content.splitlines()

inside_agents = False
fixed_lines: list[str] = []

agent_value_pattern = re.compile(
    r'^([a-zA-Z0-9_\-]+)\s*=\s*([0-9]+)\s*$'
)

for line in lines:
    stripped = line.strip()

    if stripped.startswith("["):
        inside_agents = stripped == "[agents]"

    if inside_agents:
        match = agent_value_pattern.match(stripped)

        if match:
            agent_name = match.group(1)
            timeout = match.group(2)

            fixed_lines.append("")
            fixed_lines.append(f"[agents.{agent_name}]")
            fixed_lines.append("enabled = true")
            fixed_lines.append(f"timeout = {timeout}")
            fixed_lines.append('model = "gpt-5"')
            fixed_lines.append("max_iterations = 50")

            print(
                f"[FIXED] converted '{agent_name}' "
                f"integer -> AgentRoleToml"
            )

            continue

    fixed_lines.append(line)

dst.write_text(
    "\n".join(fixed_lines) + "\n",
    encoding="utf-8",
)
PY

cp "${CONFIG_FILE}" "${CONFIG_FILE}.bak"

mv "${TMP_FILE}" "${CONFIG_FILE}"

echo "[INFO] validating TOML"

python3 - "${CONFIG_FILE}" <<'PY'
from __future__ import annotations

import sys
from pathlib import Path

try:
    import tomllib
except ImportError:
    import tomli as tomllib

config = Path(sys.argv[1])

with config.open("rb") as f:
    data = tomllib.load(f)

agents = data.get("agents", {})

if not isinstance(agents, dict):
    raise SystemExit("[ERROR] [agents] must be table")

for name, value in agents.items():
    if not isinstance(value, dict):
        raise SystemExit(
            f"[ERROR] invalid agent structure: {name}"
        )

print("[OK] TOML valid")
print("[OK] AgentRoleToml schema repaired")
PY

echo "[SUCCESS] repair completed"
