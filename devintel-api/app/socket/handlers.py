import asyncio
import json
import logging
import uuid

import redis.asyncio as aioredis
import socketio
from sqlalchemy import desc, select

from app.config import settings
from app.database import AsyncSessionLocal
from app.models import AnalysisRun, Repository

logger = logging.getLogger(__name__)

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# Maps socket sid -> background redis subscriber task
_active_tasks: dict[str, asyncio.Task] = {}


# ---------------------------------------------------------------------------
# Redis subscriber (async background task per connected client)
# ---------------------------------------------------------------------------

async def _redis_subscriber(sid: str, job_id: str) -> None:
    channel = f"devintel_engine_{job_id}"
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
        repo_result = await session.execute(
            select(Repository).where(Repository.id == repository_uuid)
        )
        repo = repo_result.scalar_one_or_none()

        run_result = await session.execute(
            select(AnalysisRun)
            .where(AnalysisRun.repository_id == repository_uuid)
            .order_by(desc(AnalysisRun.created_at))
            .limit(1)
        )
        recent_run = run_result.scalar_one_or_none()

    if not repo:
        logger.warning(
            "Connection rejected — repository %s not found (sid=%s)", repository_uuid, sid
        )
        return False

    repository_id = str(repository_uuid)
    job_id = recent_run.job_id if recent_run else None

    # Start background task that pipes Redis messages to the client
    if job_id:
        task = asyncio.create_task(_redis_subscriber(sid, job_id))
        _active_tasks[sid] = task

    # Emit current progress value so the client can resume from where it left off
    try:
        _r = aioredis.from_url(settings.REDIS_URL)
        try:
            raw_progress = await _r.get(f"devintel:{job_id}:progress") if job_id else None
            progress_value = int(raw_progress) if raw_progress is not None else 0
        finally:
            await _r.aclose()
        await sio.emit("initial_progress", {"progress": progress_value}, to=sid)
    except Exception:
        logger.exception("Failed to emit initial_progress for sid=%s", sid)
        await sio.emit("initial_progress", {"progress": 0}, to=sid)

    logger.info("Client sid=%s connected for progress tracking on repository %s", sid, repository_id)


@sio.on("disconnect")
async def on_disconnect(sid: str):
    task = _active_tasks.pop(sid, None)
    if task:
        task.cancel()
    logger.info("Client sid=%s disconnected", sid)
