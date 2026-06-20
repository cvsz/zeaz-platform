# Standard ZeaZ Platform App Makefile
# Generated/Standardized by Agent

# APP_NAME is dynamically set to the directory name
APP_NAME = $(shell basename $(CURDIR))

.PHONY: install build start stop status

install:
	@echo "Installing $(APP_NAME)..."
	# Detect and run appropriate install command
	@if [ -f package.json ]; then npm install; \
	elif [ -f requirements.txt ]; then pip install -r requirements.txt; \
	else echo "No install needed"; fi

build:
	@echo "Building $(APP_NAME)..."
	# Detect and run appropriate build command
	@if [ -f package.json ]; then npm run build; \
	elif [ -f Dockerfile ]; then docker build -t $(APP_NAME) .; \
	else echo "No build needed"; fi

start:
	@echo "Starting $(APP_NAME)..."
	# Detect and run appropriate start command
	@if [ -f docker-compose.yml ]; then docker-compose up -d; \
	elif [ -f package.json ]; then npm run start & echo $$! > .pid; \
	else echo "No start command defined"; fi

stop:
	@echo "Stopping $(APP_NAME)..."
	# Detect and run appropriate stop command
	@if [ -f docker-compose.yml ]; then docker-compose down; \
	elif [ -f .pid ]; then kill $$(cat .pid) && rm .pid; \
	else echo "No stop command defined"; fi

status:
	@echo "Status check for $(APP_NAME)..."
