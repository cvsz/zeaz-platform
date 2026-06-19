SHELL := /usr/bin/env bash
.SHELLFLAGS := -Eeuo pipefail -c

.PHONY: server-start server-stop server-status server-restart smoke

server-start:
	@bash ../../scripts/zquest-control.sh start

server-stop:
	@bash ../../scripts/zquest-control.sh stop

server-status:
	@bash ../../scripts/zquest-control.sh status

server-restart: server-stop server-start

smoke:
	@bash ../../scripts/zquest-control.sh smoke
