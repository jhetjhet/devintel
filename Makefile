COMPOSE := docker compose
BASE := -f docker-compose.yml
PROD := -f docker-compose.prod.yml

.PHONY: config-dev config-prod up-dev up-prod down-dev down-prod logs-dev logs-prod ps-dev ps-prod build-dev build-prod

config-dev:
	$(COMPOSE) $(BASE) config

config-prod:
	$(COMPOSE) $(BASE) $(PROD) config

up-dev:
	$(COMPOSE) $(BASE) up -d

up-prod:
	$(COMPOSE) $(BASE) $(PROD) up -d

down-dev:
	$(COMPOSE) $(BASE) down

down-prod:
	$(COMPOSE) $(BASE) $(PROD) down

logs-dev:
	$(COMPOSE) $(BASE) logs -f

logs-prod:
	$(COMPOSE) $(BASE) $(PROD) logs -f

ps-dev:
	$(COMPOSE) $(BASE) ps

ps-prod:
	$(COMPOSE) $(BASE) $(PROD) ps

build-dev:
	$(COMPOSE) $(BASE) build

build-prod:
	$(COMPOSE) $(BASE) $(PROD) build
