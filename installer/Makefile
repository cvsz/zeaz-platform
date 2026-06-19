install:
	sudo ./install.sh

up:
	docker compose \
	-f compose/core/docker-compose.yml \
	-f compose/monitoring/docker-compose.yml \
	-f compose/ai/docker-compose.yml \
	up -d

down:
	docker compose \
	-f compose/core/docker-compose.yml \
	-f compose/monitoring/docker-compose.yml \
	-f compose/ai/docker-compose.yml \
	down

logs:
	docker compose \
	-f compose/core/docker-compose.yml \
	-f compose/monitoring/docker-compose.yml \
	-f compose/ai/docker-compose.yml \
	logs -f
