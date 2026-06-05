APP_DIR := app
PID_FILE := /tmp/zoffice.pid
LOG_FILE := /tmp/zoffice.log
WHISPER_PID := /tmp/zoffice-whisper.pid
WHISPER_LOG := /tmp/zoffice-whisper.log
METRICS_PID := /tmp/zoffice-metrics.pid
METRICS_LOG := /tmp/zoffice-metrics.log
PORT := 18090
WS_PORT := 18091

.PHONY: start stop restart status stop-all

start:
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		echo "zoffice is already running (PID $$(cat $(PID_FILE)))"; \
	else \
		echo "Starting zoffice (HTTP :$(PORT), WS :$(WS_PORT))..."; \
		cd $(APP_DIR) && nohup env _VO_INT=1 PYTHONUNBUFFERED=1 python3 -u server.py > $(LOG_FILE) 2>&1 & \
		echo $$! > $(PID_FILE); \
		sleep 1; \
		if kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
			echo "Started PID $$(cat $(PID_FILE))"; \
		else \
			echo "Failed to start — check $(LOG_FILE)"; \
		fi \
	fi

stop:
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		echo "Stopping zoffice (PID $$(cat $(PID_FILE)))..."; \
		kill $$(cat $(PID_FILE)); \
		rm -f $(PID_FILE); \
		echo "Stopped"; \
	else \
		echo "zoffice is not running"; \
	fi

restart: stop start

status:
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		echo "zoffice is running (PID $$(cat $(PID_FILE)))"; \
		echo "  HTTP : http://localhost:$(PORT)"; \
		echo "  WS   : ws://localhost:$(WS_PORT)"; \
		echo "  Log  : $(LOG_FILE)"; \
		if curl -sf http://localhost:$(PORT)/health >/dev/null 2>&1; then \
			echo "  Health: OK"; \
		else \
			echo "  Health: unreachable"; \
		fi \
	else \
		echo "zoffice is NOT running"; \
	fi

start-whisper:
	@if [ -f $(WHISPER_PID) ] && kill -0 $$(cat $(WHISPER_PID)) 2>/dev/null; then \
		echo "Whisper STT is already running (PID $$(cat $(WHISPER_PID)))"; \
	else \
		echo "Starting Whisper STT server..."; \
		cd $(APP_DIR) && nohup python3 whisper-server.py > $(WHISPER_LOG) 2>&1 & \
		echo $$! > $(WHISPER_PID); \
		sleep 1; \
		if kill -0 $$(cat $(WHISPER_PID)) 2>/dev/null; then \
			echo "Started PID $$(cat $(WHISPER_PID))"; \
		else \
			echo "Failed to start — check $(WHISPER_LOG)"; \
		fi \
	fi

stop-whisper:
	@if [ -f $(WHISPER_PID) ] && kill -0 $$(cat $(WHISPER_PID)) 2>/dev/null; then \
		echo "Stopping Whisper STT (PID $$(cat $(WHISPER_PID)))..."; \
		kill $$(cat $(WHISPER_PID)) 2>/dev/null; rm -f $(WHISPER_PID); \
		echo "Stopped"; \
	else \
		echo "Whisper STT is not running"; \
	fi

start-metrics:
	@if [ -f $(METRICS_PID) ] && kill -0 $$(cat $(METRICS_PID)) 2>/dev/null; then \
		echo "PC Metrics server is already running (PID $$(cat $(METRICS_PID)))"; \
	else \
		echo "Starting PC Metrics server..."; \
		cd $(APP_DIR) && nohup python3 pc-metrics-server.py > $(METRICS_LOG) 2>&1 & \
		echo $$! > $(METRICS_PID); \
		sleep 1; \
		if kill -0 $$(cat $(METRICS_PID)) 2>/dev/null; then \
			echo "Started PID $$(cat $(METRICS_PID))"; \
		else \
			echo "Failed to start — check $(METRICS_LOG)"; \
		fi \
	fi

stop-metrics:
	@if [ -f $(METRICS_PID) ] && kill -0 $$(cat $(METRICS_PID)) 2>/dev/null; then \
		echo "Stopping PC Metrics (PID $$(cat $(METRICS_PID)))..."; \
		kill $$(cat $(METRICS_PID)) 2>/dev/null; rm -f $(METRICS_PID); \
		echo "Stopped"; \
	else \
		echo "PC Metrics is not running"; \
	fi

stop-all: stop stop-whisper stop-metrics
	@echo "All services stopped"
