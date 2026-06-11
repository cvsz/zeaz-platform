#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

HOME_DIR="${HOME:-$PWD}"
BASE_DIR="${BASE_DIR:-$HOME_DIR/.local/share/ai-agent-stack}"
REPORT_DIR="${REPORT_DIR:-$HOME_DIR/ai-agent-stack-report}"
CONFIG_DIR="${CONFIG_DIR:-$HOME_DIR/.config/ai-agents}"
VERSION_TIMEOUT_SECONDS="${VERSION_TIMEOUT_SECONDS:-4}"
SHOW_MISSING=1
SHOW_PROJECT_CONFIGS=1

usage() {
  cat <<USAGE
Usage:
  ai-agent-stack-status [options]
  scripts/ai/ai-agent-stack-status.sh [options]

Options:
  --no-missing          Hide tools and paths that are not installed
  --no-project-configs  Hide project-level agent config directory scan
  -h, --help            Show this help

Environment:
  BASE_DIR                 Default: ~/.local/share/ai-agent-stack
  REPORT_DIR               Default: ~/ai-agent-stack-report
  CONFIG_DIR               Default: ~/.config/ai-agents
  VERSION_TIMEOUT_SECONDS  Default: 4
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-missing) SHOW_MISSING=0 ;;
    --no-project-configs) SHOW_PROJECT_CONFIGS=0 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
  shift
done

redact() {
  sed -E \
    -e 's/([A-Za-z0-9_]*(TOKEN|SECRET|PASSWORD|API_KEY|KEY)[A-Za-z0-9_]*=)[^[:space:]]+/\1[redacted]/Ig' \
    -e 's/(Bearer )[A-Za-z0-9._~+\/=-]+/\1[redacted]/Ig' \
    -e 's/(sk-[A-Za-z0-9_-]{8})[A-Za-z0-9_-]+/\1[redacted]/g'
}

run_version() {
  local command_name="$1"
  local version_args="$2"
  local -a args=()
  local output

  [[ -n "$version_args" && "$version_args" != "-" ]] || return 0
  local IFS=' '
  read -r -a args <<<"$version_args"

  if command -v timeout >/dev/null 2>&1; then
    output="$(timeout "${VERSION_TIMEOUT_SECONDS}s" "$command_name" "${args[@]}" 2>&1 | head -n 2 | redact || true)"
  else
    output="$("$command_name" "${args[@]}" 2>&1 | head -n 2 | redact || true)"
  fi

  if [[ -n "$output" ]]; then
    printf '        %s\n' "$output"
  fi
}

print_path_status() {
  local label="$1"
  local path="$2"
  local kind="${3:-path}"

  if [[ -e "$path" ]]; then
    printf '[FOUND] %-28s %s\n' "$label" "$path"
    if [[ "$kind" == "dir" ]]; then
      local count
      count="$(find "$path" -mindepth 1 -maxdepth 1 2>/dev/null | wc -l | tr -d ' ')"
      printf '        entries: %s\n' "${count:-0}"
    fi
  elif [[ "$SHOW_MISSING" == "1" ]]; then
    printf '[MISS ] %-28s %s\n' "$label" "$path"
  fi
}

print_tool_status() {
  local category="$1"
  local label="$2"
  local command_name="$3"
  local version_args="$4"

  if command -v "$command_name" >/dev/null 2>&1; then
    printf '[FOUND] %-28s %s\n' "$label" "$(command -v "$command_name")"
    run_version "$command_name" "$version_args"
  elif [[ "$SHOW_MISSING" == "1" ]]; then
    printf '[MISS ] %-28s (%s)\n' "$label" "$category"
  fi
}

print_section() {
  printf '\n=== %s ===\n' "$1"
}

print_tool_group() {
  local current_category=""
  local row category label command_name version_args

  for row in "${TOOLS[@]}"; do
    IFS='|' read -r category label command_name version_args <<<"$row"
    if [[ "$category" != "$current_category" ]]; then
      print_section "$category"
      current_category="$category"
    fi
    print_tool_status "$category" "$label" "$command_name" "$version_args"
  done
}

print_known_config_dirs() {
  local row label path kind

  print_section "AI And Agent Config Dirs"
  for row in "${CONFIG_PATHS[@]}"; do
    IFS='|' read -r label path kind <<<"$row"
    print_path_status "$label" "$path" "${kind:-dir}"
  done
}

print_local_scripts() {
  local row label path

  print_section "Local Agent Scripts"
  for row in "${LOCAL_SCRIPTS[@]}"; do
    IFS='|' read -r label path <<<"$row"
    if [[ -x "$path" ]]; then
      printf '[FOUND] %-28s %s\n' "$label" "$path"
    elif [[ -e "$path" ]]; then
      printf '[WARN ] %-28s %s (not executable)\n' "$label" "$path"
    elif [[ "$SHOW_MISSING" == "1" ]]; then
      printf '[MISS ] %-28s %s\n' "$label" "$path"
    fi
  done
}

print_project_configs() {
  [[ "$SHOW_PROJECT_CONFIGS" == "1" ]] || return 0

  print_section "Project Agent Configs"
  find "$HOME_DIR" -maxdepth 3 \
    \( -path "$HOME_DIR/.cache" -o -path "$HOME_DIR/.npm" -o -path "$HOME_DIR/node_modules" -o -path '*/node_modules' \) -prune \
    -o -type d \
    \( -name .agent -o -name .agents -o -name .codex -o -name .claude -o -name .gemini -o -name .qwen -o -name .opencode -o -name .zagents \) \
    -print 2>/dev/null | sort | while IFS= read -r path; do
      printf '[CONFIG] %s\n' "$path"
    done
}

TOOLS=(
  "Managed stack|Antigravity|antigravity|-"
  "Managed stack|Antigravity CLI|agy|-"
  "Managed stack|Claude Code|claude|--version"
  "Managed stack|OpenAI Codex|codex|--version"
  "Managed stack|OpenCode|opencode|--version"
  "Managed stack|Ollama|ollama|--version"
  "Managed stack|NIM readiness|nim-readiness|-"
  "Installed AI CLIs|Gemini CLI|gemini|-"
  "Installed AI CLIs|Qwen Code|qwen|--version"
  "Installed AI CLIs|OpenClaude|openclaude|--version"
  "Installed AI CLIs|OpenClaw|openclaw|--version"
  "Installed AI CLIs|OpenWork|openwork|--version"
  "Installed AI CLIs|OpenWork Orchestrator|openwork-orchestrator|--version"
  "Installed AI CLIs|Hermes|hermes|-"
  "Agent Frameworks|DeepAgents Code|deepagents-code|--version"
  "Agent Frameworks|DeepAgents dcode|dcode|--version"
  "Agent Frameworks|Free Claude Code|free-claude-code|-"
  "Agent Frameworks|FCC Claude|fcc-claude|-"
  "Agent Frameworks|FCC Server|fcc-server|-"
  "Agent Frameworks|SkillHub|skillhub|--version"
  "Runtimes And Support|Docker|docker|--version"
  "Runtimes And Support|NVIDIA SMI|nvidia-smi|--version"
  "Runtimes And Support|Node.js|node|--version"
  "Runtimes And Support|npm|npm|--version"
  "Runtimes And Support|pnpm|pnpm|--version"
  "Runtimes And Support|Bun|bun|--version"
  "Runtimes And Support|uv|uv|--version"
)

CONFIG_PATHS=(
  "AI stack base|$BASE_DIR"
  "AI stack profiles|$BASE_DIR/profiles"
  "NVIDIA NIM profile|$BASE_DIR/nvidia-nim"
  "Foundry profile|$BASE_DIR/foundry"
  "Shared AI config|$CONFIG_DIR"
  "Claude config|$HOME_DIR/.claude"
  "Codex config|$HOME_DIR/.codex"
  "Agents config|$HOME_DIR/.agents"
  "Agent config|$HOME_DIR/.agent"
  "Gemini config|$HOME_DIR/.gemini"
  "Qwen config|$HOME_DIR/.qwen"
  "OpenCode config|$HOME_DIR/.opencode"
  "OpenClaw config|$HOME_DIR/.openclaw"
  "OpenHands config|$HOME_DIR/.openhands"
  "OpenWork config|$HOME_DIR/.openwork"
  "DeepAgents config|$HOME_DIR/.deepagents"
  "Hermes config|$HOME_DIR/.hermes"
  "Aider Desk config|$HOME_DIR/.aider-desk"
  "Continue config|$HOME_DIR/.continue"
  "Augment config|$HOME_DIR/.augment"
  "Codeium config|$HOME_DIR/.codeium"
  "Tabnine config|$HOME_DIR/.tabnine"
  "KiloCode config|$HOME_DIR/.kilocode"
  "Kiro config|$HOME_DIR/.kiro"
  "Qoder config|$HOME_DIR/.qoder"
  "Roo config|$HOME_DIR/.roo"
  "Trae config|$HOME_DIR/.trae"
  "Zencoder config|$HOME_DIR/.zencoder"
  "MCP auth|$HOME_DIR/.mcp-auth"
  "MCP config|$HOME_DIR/.mcp.json|path"
  "ADAL config|$HOME_DIR/.adal"
  "AstrBot config|$HOME_DIR/.astrbot"
  "Bob config|$HOME_DIR/.bob"
  "CodeArts config|$HOME_DIR/.codeartsdoer"
  "CodeBuddy config|$HOME_DIR/.codebuddy"
  "CodeMaker config|$HOME_DIR/.codemaker"
  "CodeStudio config|$HOME_DIR/.codestudio"
  "CommandCode config|$HOME_DIR/.commandcode"
  "Factory config|$HOME_DIR/.factory"
  "Forge config|$HOME_DIR/.forge"
  "iFlow config|$HOME_DIR/.iflow"
  "InferenceSH config|$HOME_DIR/.inferencesh"
  "Jazz config|$HOME_DIR/.jazz"
  "Junie config|$HOME_DIR/.junie"
  "Kode config|$HOME_DIR/.kode"
  "Lingma config|$HOME_DIR/.lingma"
  "MCPJam config|$HOME_DIR/.mcpjam"
  "Microsandbox config|$HOME_DIR/.microsandbox"
  "Moxby config|$HOME_DIR/.moxby"
  "Mux config|$HOME_DIR/.mux"
  "Neovate config|$HOME_DIR/.neovate"
  "Ona config|$HOME_DIR/.ona"
  "Pi agent config|$HOME_DIR/.pi"
  "Pochi config|$HOME_DIR/.pochi"
  "Qoder CN config|$HOME_DIR/.qoder-cn"
  "Reasonix config|$HOME_DIR/.reasonix"
  "RovoDev config|$HOME_DIR/.rovodev"
  "Snowflake config|$HOME_DIR/.snowflake"
  "Terramind config|$HOME_DIR/.terramind"
  "TinyCloud config|$HOME_DIR/.tinycloud"
  "Trae CN config|$HOME_DIR/.trae-cn"
  "Vibe config|$HOME_DIR/.vibe"
  "ZCodex config|$HOME_DIR/.zcodex"
)

LOCAL_SCRIPTS=(
  "AI stack installer|$HOME_DIR/install-ai-agent-stack-safe.sh"
  "All agents installer|$HOME_DIR/install-all-agents.sh"
  "AGY ECC agents installer|$HOME_DIR/install-agy-ecc-agents.sh"
  "Codex scheduler runner|$HOME_DIR/codex-scheduler/run-codex-prompts.sh"
  "ZSP agent status|$HOME_DIR/zsp-aitool/zsp-agent-status.sh"
  "ZSP all agent bootstrap|$HOME_DIR/zsp-aitool/zsp-all-agent-bootstrap-safe.sh"
  "ZSP AGY bootstrap|$HOME_DIR/zsp-aitool/zsp-agent-agy-bootstrap-safe.sh"
  "ZSP Claude bootstrap|$HOME_DIR/zsp-aitool/zsp-agent-claude-bootstrap-safe.sh"
  "ZSP Codex bootstrap|$HOME_DIR/zsp-aitool/zsp-agent-codex-bootstrap-safe.sh"
)

echo "=== AI Agent Stack Status ==="
printf 'Host: %s\n' "$(hostname 2>/dev/null || echo unknown)"
printf 'User: %s\n' "$(id -un 2>/dev/null || echo unknown)"
printf 'Time: %s\n' "$(date -Is)"

print_tool_group
print_known_config_dirs
print_local_scripts
print_project_configs

print_section "References"
printf 'Profiles:   %s\n' "$BASE_DIR/profiles"
printf 'Config:     %s\n' "$CONFIG_DIR"
printf 'Report dir: %s\n' "$REPORT_DIR"
