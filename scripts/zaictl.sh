#!/usr/bin/env bash
# zaictl - ZeaZ Platform Master Control CLI
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT"

function show_usage() {
    echo "ZeaZ Platform Control CLI (zaictl)"
    echo "Usage: zaictl {command} [args]"
    echo ""
    echo "Commands:"
    echo "  status            Check platform app status"
    echo "  start <app>       Start specific platform app"
    echo "  stop <app>        Stop specific platform app"
    echo "  factory <args>    Run AI Factory commands"
    echo "  audit             Run platform surface audit"
    echo "  skill list        List all enabled skills"
    echo "  agent list        List all enabled agents"
    echo "  agent result-list [filters]  List stored sub-agent results"
    echo "  agent result-get [args]      Show latest stored result for an agent"
    echo "  agent result-put [submit args]  Store a sub-agent result via mailbox CLI"
    echo "  cf <args>         Run Cloudflare (wrangler) commands"
    echo "  cf-zt <args>      Run Cloudflare Zero Trust (access) commands"
    echo "  (For running agents, use Gemini CLI command: invoke_agent)"
}

case "$1" in
    status) ./scripts/platform/apps-server-control.sh status ;;
    start)  ./scripts/platform/apps-server-control.sh start "$2" ;;
    stop)   ./scripts/platform/apps-server-control.sh stop "$2" ;;
    factory) ./apps/zai-factory/bin/ai-factory.js "${@:2}" ;;
    audit)  gemini -p "run workspace-surface-audit skill" ;;
    cf)     npx wrangler "${@:2}" ;;
    cf-zt)  npx wrangler access "${@:2}" ;;
    skill)
        case "$2" in
            list) gemini skills list ;;
            *) show_usage ;;
        esac
        ;;
    agent)
        case "$2" in
            list) ls -F .agents/agents ;;
            result-list)
                shift 2
                python3 scripts/ai/subagent_results.py list "$@"
                ;;
            result-get)
                shift 2
                if [[ $# -ge 1 && "${1}" != --* ]]; then
                    python3 scripts/ai/subagent_results.py get --agent-id "$1" "${@:2}"
                else
                    python3 scripts/ai/subagent_results.py get "$@"
                fi
                ;;
            result-put)
                shift 2
                if [[ $# -ge 2 && "${1}" != --* ]]; then
                    python3 scripts/ai/subagent_results.py submit --agent-id "$1" --summary "$2" "${@:3}"
                else
                    python3 scripts/ai/subagent_results.py submit "$@"
                fi
                ;;
            *) show_usage ;;
        esac
        ;;
    *)      show_usage ;;
esac
