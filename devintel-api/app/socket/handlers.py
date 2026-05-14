import asyncio
import json
import logging
import uuid

import docker
import docker.errors
import redis.asyncio as aioredis
import socketio
from sqlalchemy import select

from app.config import settings
from app.database import AsyncSessionLocal
from app.models import Repository, AnalysisRun

logger = logging.getLogger(__name__)

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# Maps socket sid -> background redis subscriber task
_active_tasks: dict[str, asyncio.Task] = {}


# ---------------------------------------------------------------------------
# Docker helpers (sync — called via asyncio.to_thread)
# ---------------------------------------------------------------------------

def _ensure_container_running(repo_url: str, repository_id: str, commit_hash: str) -> None:
    """
    Checks whether a worker container for this repository is already running.
    Spawns one if not.
    """
    container_name = f"devintel_engine_{repository_id}"
    client = docker.from_env()

    try:
        container = client.containers.get(container_name)
        if container.status == "running":
            logger.info("Container %s already running, skipping spawn.", container_name)
            return
        # Clean up a stopped/exited container with the same name before re-spawning
        container.remove(force=True)
    except docker.errors.NotFound:
        pass

    logger.info("Spawning container %s for repo %s", container_name, repo_url)
    client.containers.run(
        image=settings.DEVINTEL_ENGINE_IMAGE,
        name=container_name,
        command=["python3", "/app/orchestrator.py", repo_url, repository_id, commit_hash],
        environment={
            "LLM_API_KEY": settings.LLM_API_KEY,
            "LLM_MODEL": settings.LLM_MODEL,
            "LLM_BASE_URL": settings.LLM_BASE_URL,
        },
        network="devintel_net",
        # Allows the worker container to reach the host via host.docker.internal on Linux
        extra_hosts={"host.docker.internal": "host-gateway"},
        remove=True,
        detach=True,
    )


# ---------------------------------------------------------------------------
# Redis subscriber (async background task per connected client)
# ---------------------------------------------------------------------------

async def _redis_subscriber(sid: str, repository_id: str) -> None:
    channel = f"devintel_engine_{repository_id}"
    r = aioredis.from_url(settings.REDIS_URL)

    try:
        async with r.pubsub() as ps:
            await ps.subscribe(channel)
            logger.info("Subscribed to Redis channel %s for sid=%s", channel, sid)

            async for message in ps.listen():
                if message["type"] != "message":
                    continue

                try:
                    data = json.loads(message["data"])
                except (json.JSONDecodeError, TypeError):
                    raw = message["data"]
                    text = raw.decode("utf-8", errors="replace") if isinstance(raw, bytes) else str(raw)
                    await sio.emit("progress", {"message": text, "is_terminal": False}, to=sid)
                    continue

                if data.get("is_terminal"):
                    level = data.get("level", "INFO")
                    event = "error" if level in ("ERROR", "CRITICAL") else "done"
                    await sio.emit(event, data, to=sid)
                    logger.info("Terminal event '%s' emitted to sid=%s", event, sid)
                    break
                else:
                    await sio.emit("progress", data, to=sid)

    except asyncio.CancelledError:
        logger.info("Redis subscriber cancelled for sid=%s", sid)
    except Exception:
        logger.exception("Redis subscriber error for sid=%s", sid)
        await sio.emit("error", {"message": "Internal subscriber error"}, to=sid)
    finally:
        await r.aclose()


# ---------------------------------------------------------------------------
# Socket.IO event handlers
# ---------------------------------------------------------------------------

@sio.on("connect")
async def on_connect(sid: str, environ: dict, auth: dict | None = None):
    repository_id_raw = (auth or {}).get("repository_id")

    logger.info("Client sid=%s attempting to connect with repository_id=%s", sid, repository_id_raw)

    if not repository_id_raw:
        logger.warning("Connection rejected — no repository_id in auth (sid=%s)", sid)
        return False

    # Validate that the provided id is a well-formed UUID
    try:
        repository_uuid = uuid.UUID(str(repository_id_raw))
    except ValueError:
        logger.warning("Connection rejected — invalid UUID '%s' (sid=%s)", repository_id_raw, sid)
        return False

    # Confirm the repository exists in the database
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Repository).where(Repository.id == repository_uuid)
        )
        repo = result.scalar_one_or_none()

    if not repo:
        logger.warning(
            "Connection rejected — repository %s not found (sid=%s)", repository_uuid, sid
        )
        return False

    repository_id = str(repository_uuid)
    force = (auth or {}).get("force", False)
    commit_hash = repo.latest_commit_hash or ""

    # Skip worker spawn if this repo+commit was already analyzed (unless force=true)
    if not force:
        async with AsyncSessionLocal() as session:
            existing = await session.execute(
                select(AnalysisRun).where(
                    AnalysisRun.repository_id == repository_uuid,
                    AnalysisRun.commit_hash == commit_hash,
                )
            )
            if existing.scalar_one_or_none():
                logger.info(
                    "Connection rejected — analysis already exists for repository %s at commit %s (sid=%s). "
                    "Pass force=true to re-analyze.",
                    repository_uuid, commit_hash, sid,
                )
                return False

    try:
        await asyncio.to_thread(_ensure_container_running, repo.repo_url, repository_id, commit_hash)
    except Exception:
        logger.exception("Failed to spawn container for repository %s (sid=%s)", repository_id, sid)
        return False

    # Start background task that pipes Redis messages to the client
    task = asyncio.create_task(_redis_subscriber(sid, repository_id))
    _active_tasks[sid] = task

    # Emit current progress value so the client can resume from where it left off
    try:
        _r = aioredis.from_url(settings.REDIS_URL)
        try:
            raw_progress = await _r.get(f"devintel:{repository_id}:{commit_hash}:progress")
            progress_value = int(raw_progress) if raw_progress is not None else 0
        finally:
            await _r.aclose()
        await sio.emit("initial_progress", {"progress": progress_value}, to=sid)
    except Exception:
        logger.exception("Failed to emit initial_progress for sid=%s", sid)
        await sio.emit("initial_progress", {"progress": 0}, to=sid)

    logger.info("Client sid=%s connected for repository %s", sid, repository_id)


@sio.on("disconnect")
async def on_disconnect(sid: str):
    task = _active_tasks.pop(sid, None)
    if task:
        task.cancel()
    logger.info("Client sid=%s disconnected", sid)
