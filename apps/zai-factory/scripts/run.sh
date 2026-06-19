#!/usr/bin/env bash
cd "$(dirname "$0")/.."
PID_FILE="zai-factory.pid"

is_pid_running() {
    [ -f "$PID_FILE" ] && ps -p "$(cat "$PID_FILE")" > /dev/null 2>&1
}

case "$1" in
    start)
        if is_pid_running; then
            echo "ZAI Factory already running (pid=$(cat "$PID_FILE"))"
        else
            nohup node server.mjs --host 127.0.0.1 --port 4191 > /tmp/zai-factory.log 2>&1 &
            echo $! > "$PID_FILE"
            echo "ZAI Factory started (pid=$!)"
        fi
        ;;
    stop)
        if [ -f "$PID_FILE" ]; then
            kill $(cat "$PID_FILE")
            rm "$PID_FILE"
            echo "ZAI Factory stopped"
        else
            echo "ZAI Factory not running"
        fi
        ;;
    restart)
        $0 stop
        $0 start
        ;;
    status)
        if is_pid_running; then
            echo "ZAI Factory running (pid=$(cat "$PID_FILE"))"
        else
            echo "ZAI Factory stopped"
            [ -f "$PID_FILE" ] && rm "$PID_FILE"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        ;;
esac
