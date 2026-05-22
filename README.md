
# DevIntel

DevIntel is a repository audit platform.

You give it a Git repository URL, and it runs an automated audit pipeline to produce:

- Health and quality signals
- Trend and history views for previous runs
- Optional AI-assisted interpretation of deterministic audit output

It is designed to help developers and teams quickly understand project status without manually inspecting every report file.

## What This App Does

At a high level, DevIntel:

1. Accepts a repository URL.
2. Collects repository metadata and latest commit details.
3. Starts an isolated audit worker container.
4. Stores audit progress and intermediate state in Redis.
5. Persists final results in Postgres and serves them to the UI.

## How It Works (Simple Flow)

1. User triggers analysis and audit from the web app.
2. FastAPI creates an analysis run and queues metadata.
3. The API starts a Docker worker container using the configured [engine](https://github.com/jhetjhet/devintel-engine) image.
4. The worker runs deterministic analysis (via [Devaudt](https://github.com/jhetjhet/devaudt)) and optional LLM enrichment.
5. Results are written back, saved, and shown in dashboard charts and summaries.

## Main Components

- Frontend: Next.js app for authentication, repository input, and dashboards.
- API: FastAPI service for orchestration, auth, persistence, and audit control.
- Database: Postgres for users, repositories, and analysis history.
- Cache/State: Redis for in-progress audit state and result handoff.
- [Worker Engine](https://github.com/jhetjhet/devintel-engine): Separate Docker image used by the API to run audit jobs.

## Tech Stack

- FastAPI
- Next.js
- PostgreSQL
- Redis
- Docker Compose
- LangGraph-based orchestration for analysis flow

## Prerequisites

- Docker and Docker Compose plugin installed
- Access to required container images
- Valid environment files:
  - .env.dev or .env.prod for root Compose variables
  - devintel-api/.env for API settings
  - devintel-next/.env for frontend settings

## Run In Development

Use the development override:

```bash
docker compose --env-file .env.dev up --build
```

Services:

- Frontend: http://localhost:3000
- API: http://localhost:8000 (sqladmin at /admin)

## Run In Production

```bash
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Required Root Environment Variables

Set these in .env.dev (or equivalent env file used at startup):

```env
POSTGRES_USER=devintel
POSTGRES_PASSWORD=devintel
POSTGRES_DB=devintel

DEVINTEL_API_VERSION=latest
DEVINTEL_API_PORT=8000
DEVINTEL_NEXT_VERSION=latest
DEVINTEL_NEXT_PORT=3000
```

## Important API Environment Variables

Set these in devintel-api/.env:

```env
REDIS_URL=redis://redis:6379

LLM_API_KEY=<your-key-or-placeholder>
LLM_MODEL=<model-name>
LLM_BASE_URL=<provider-base-url>

DEVINTEL_ENGINE_IMAGE=<audit-worker-image-name>
MAX_AUDIT_WORKERS=1
```

## Must-Have Notes

- The API must be able to access Docker (it starts worker containers).
- The image in DEVINTEL_ENGINE_IMAGE must exist locally or be pullable from a registry.
- If Docker socket is mounted, container user permissions must allow access to /var/run/docker.sock.
- The external Docker network devintel_net must exist before startup.

Create the network once if needed:

```bash
docker network create devintel_net
```

## Common Startup Issues

1. Pull access denied for worker image
	- Cause: DEVINTEL_ENGINE_IMAGE points to a non-existent image/tag.
	- Fix: Build/pull the correct worker image and update the variable.

2. Permission denied on Docker API version check
	- Cause: API container user cannot access /var/run/docker.sock.
	- Fix: Run with proper user/group permissions for Docker socket.

3. API cannot connect to Postgres
	- Cause: wrong DATABASE_URL or DB not healthy yet.
	- Fix: verify env values and service health.