# zCino Makefile

PORT ?= 8000
HOST ?= 0.0.0.0
PID_FILE = .php-server.pid

.PHONY: install start stop restart status help

help:
	@echo "Available commands:"
	@echo "  make install - Set up database or necessary files"
	@echo "  make start   - Start the local PHP development server"
	@echo "  make stop    - Stop the local PHP development server"
	@echo "  make restart - Restart the local PHP development server"
	@echo "  make status  - Check if the server is running"

install:
	@echo "Installing/setting up zCino..."
	@if [ -f "setup_currencies.php" ]; then \
		echo "Setting up global currencies..."; \
		php setup_currencies.php; \
	fi
	@echo "Setting up permissions..."
	@chmod -R 775 images/ || true
	@echo "Installation complete."

start:
	@echo "Starting PHP development server on http://$(HOST):$(PORT)..."
	@if [ -f $(PID_FILE) ]; then \
		echo "Server is already running with PID $$(cat $(PID_FILE)). Use 'make restart' instead."; \
	else \
		php -S $(HOST):$(PORT) > php-server.log 2>&1 & echo $$! > $(PID_FILE); \
		echo "Server started successfully (PID: $$(cat $(PID_FILE)))."; \
	fi

stop:
	@echo "Stopping PHP development server..."
	@if [ -f $(PID_FILE) ]; then \
		kill -9 $$(cat $(PID_FILE)) 2>/dev/null || true; \
		rm -f $(PID_FILE); \
		echo "Server stopped."; \
	else \
		echo "Server is not running (no PID file found)."; \
	fi

restart: stop start

status:
	@if [ -f $(PID_FILE) ]; then \
		if ps -p $$(cat $(PID_FILE)) > /dev/null; then \
			echo "Server is running (PID: $$(cat $(PID_FILE)))"; \
		else \
			echo "Server crashed or was stopped externally. Cleaning up PID file."; \
			rm -f $(PID_FILE); \
		fi \
	else \
		echo "Server is NOT running."; \
	fi
