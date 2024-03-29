COMPOSE = docker-compose -f src/docker-compose.development.yml
#COMPOSE = docker-compose -f src/docker-compose.dev.yml

up:
	${COMPOSE} up --build

up-build:
	${COMPOSE} up --build -d

stop:
	${COMPOSE} stop

down:
	${COMPOSE} down

status:
	${COMPOSE} ps

logs:
	${COMPOSE} logs

logs-watch:
	${COMPOSE} logs --follow
