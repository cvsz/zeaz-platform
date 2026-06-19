#!/usr/bin/env bash
# zaictl - ZeaZ Platform Master Control CLI
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
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
    echo "  workflow list        List all available workflows"
    echo "  workflow show <name> Show details of a workflow"
    echo "  workflow run <name>  Execute a workflow via Gemini CLI"
    echo "  agent result-list [filters]  List stored sub-agent results"
    echo "  agent result-get [args]      Show latest stored result for an agent"
    echo "  agent result-put [submit args]  Store a sub-agent result via mailbox CLI"
    echo "  report            List status for all subdomains"
    echo "  test              Test connectivity for all subdomains"
    echo "  cf <args>         Run Cloudflare (wrangler) commands"
    echo "  cf-zt <args>      Run Cloudflare Zero Trust (access) commands"
    echo "  zdash start       Start zdash backend and frontend"
    echo "  zdash status      Check zdash status"
    echo "  (For running agents, use Gemini CLI command: invoke_agent)"
}

case "$1" in
    status) APP="$2" ./scripts/platform/apps-server-control.sh status ;;
    start)  APP="$2" ./scripts/platform/apps-server-control.sh start ;;
    stop)   APP="$2" ./scripts/platform/apps-server-control.sh stop ;;
    factory) ./apps/zai-factory/bin/zai-factory.js "${@:2}" ;;
    audit)  gemini -p "run workspace-surface-audit skill" ;;
    report)
        GREEN='\033[0;32m'
        RED='\033[0;31m'
        NC='\033[0m'
        
        echo "ZeaZ Platform Subdomain Status:"
        echo "--------------------------------"
        
        jq -r '.routes[] | "\(.hostname)|\(.port)|\(.app_id)"' configs/platform/apps-port-plan.json | while IFS='|' read -r host port app; do
            if ss -tuln | grep -q ":$port "; then
                status="${GREEN}ONLINE${NC}"
            else
                status="${RED}OFFLINE${NC}"
            fi
            printf "%-20s (Port: %-5s) - %b\n" "$host" "$port" "$status"
        done
        ;;
    test)
        echo "Testing platform connectivity..."
        echo "--------------------------------"
        jq -r '.routes[] | "\(.hostname)|\(.port)"' configs/platform/apps-port-plan.json | while IFS='|' read -r host port; do
            code=$(curl -I -s -o /dev/null -w "%{http_code}" --max-time 2 "http://127.0.0.1:$port/" 2>/dev/null || echo "000")
            if [ "$code" == "200" ] || [ "$code" == "301" ] || [ "$code" == "302" ]; then
                printf "%-20s (Port: %-5s) - \033[0;32mOK (%s)\033[0m\n" "$host" "$port" "$code"
            else
                printf "%-20s (Port: %-5s) - \033[0;31mFAILED (%s)\033[0m\n" "$host" "$port" "$code"
            fi
        done
        ;;
    cf)     npx wrangler "${@:2}" ;;
    cf-zt)  npx wrangler access "${@:2}" ;;
    zai-factory)
        ./apps/zai-factory/scripts/run.sh "${@:2}"
        ;;
    zdash)
        case "$2" in
            start)
                nohup ./apps/zdash/scripts/run-backend.sh > /tmp/zdash-backend.log 2>&1 &
                nohup ./apps/zdash/scripts/run-frontend.sh > /tmp/zdash-frontend.log 2>&1 &
                echo "Zdash backend and frontend started in background (logs: /tmp/zdash-*.log)"
                ;;
            status)
                GREEN='\033[0;32m'
                RED='\033[0;31m'
                NC='\033[0m'
                
                check_port() {
                    if ss -tuln | grep -q ":$1 "; then
                        echo -e "${GREEN}ONLINE${NC}"
                    else
                        echo -e "${RED}OFFLINE${NC}"
                    fi
                }

                echo "Zdash Backend (Port 8005): $(check_port 8005)"
                echo "Zdash Frontend (Port 5173): $(check_port 5173)"
                ;;
            *) show_usage ;;
        esac
        ;;
    skill)
        case "$2" in
            list) gemini skills list ;;
            *) show_usage ;;
        esac
        ;;
    workflow)
        case "$2" in
            list) ls -F .agent/workflows/ | grep "\.md" | sed 's/\.md//' ;;
            show) 
                if [ -f ".agent/workflows/$3.md" ]; then
                    cat ".agent/workflows/$3.md"
                else
                    echo "Workflow '$3' not found."
                fi
                ;;
            run)
                if [ -f ".agent/workflows/$3.md" ]; then
                    echo "Executing workflow: $3"
                    gemini -p "/$3"
                else
                    echo "Workflow '$3' not found."
                fi
                ;;
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
