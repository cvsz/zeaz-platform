#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

REPO="${1:-/home/zeazdev/zeaz-platform}"

if [ ! -d "$REPO" ]; then
  echo "ERROR: repo not found: $REPO" >&2
  exit 1
fi

cd "$REPO"

echo "== ZEAZ Omega AI Assets Verify =="
echo "Repo: $REPO"
echo

echo "== Counts =="
printf "Agents: "
find .agents/agents -mindepth 2 -maxdepth 3 -name agent.json 2>/dev/null | wc -l

printf "Skills: "
find .skills -mindepth 2 -maxdepth 3 -name SKILL.md 2>/dev/null | wc -l

printf "Plugins: "
find .plugins -mindepth 2 -maxdepth 4 \( -name plugin.json -o -name plugin.yaml -o -name plugin.yml -o -name plugin.toml \) 2>/dev/null | wc -l

printf "Extensions: "
find .extensions -mindepth 2 -maxdepth 4 \( -name extension.json -o -name extension.yaml -o -name extension.yml -o -name manifest.json \) 2>/dev/null | wc -l

printf "Gemini commands: "
find .gemini/commands -type f 2>/dev/null | wc -l

printf "MCP configs: "
find .gemini/mcp-configs -type f 2>/dev/null | wc -l

echo
echo "== Sample agents =="
find .agents/agents -mindepth 2 -maxdepth 3 -name agent.json 2>/dev/null | sort | head -30 || true

echo
echo "== Sample skills =="
find .skills -mindepth 2 -maxdepth 3 -name SKILL.md 2>/dev/null | sort | head -30 || true

echo
echo "== Sample plugins =="
find .plugins -mindepth 2 -maxdepth 4 \( -name plugin.json -o -name plugin.yaml -o -name plugin.yml -o -name plugin.toml \) 2>/dev/null | sort | head -30 || true

echo
echo "== Sample extensions =="
find .extensions -mindepth 2 -maxdepth 4 \( -name extension.json -o -name extension.yaml -o -name extension.yml -o -name manifest.json \) 2>/dev/null | sort | head -30 || true

echo
echo "== Sensitive file check in AI asset dirs =="
find .agents .skills .plugins .extensions .gemini/commands .gemini/mcp-configs \
  \( -name '.env' -o -name '.env.*' -o -name '*.pem' -o -name '*.key' -o -name '*.tfstate' -o -name '*.tfvars' -o -name 'creds.json' -o -name 'credentials.json' \) \
  -print 2>/dev/null || true

echo
echo "== Git status =="
git status -sb || true
