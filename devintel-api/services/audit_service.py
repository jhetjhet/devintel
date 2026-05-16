import asyncio
import logging
import uuid

import docker
import docker.errors
import redis.asyncio as aioredis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import Repository, AnalysisRun

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Docker helpers (sync — called via asyncio.to_thread)
# ---------------------------------------------------------------------------

def _ensure_container_running(repo_url: str, repository_id: str, commit_hash: str) -> None:
    """
    Checks whether a worker container for this repository is already running.
    Spawns one if not. Cleans up stopped/exited containers with the same name
    before re-spawning to avoid name conflicts.
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
        logger.info("Removed stale container %s before re-spawning.", container_name)
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
# Audit orchestration
# ---------------------------------------------------------------------------

async def start_audit(repository_id: str, force: bool, db: AsyncSession) -> dict:
    """
    Validate audit constraints for the given repository, then spawn the
    worker container.

    Returns:
        dict with ``repository_id`` (str UUID) and ``commit_hash`` (str).

    Raises:
        ValueError: if the repository is not found, an analysis already
                    exists for the current commit (when force=False), or the
                    container fails to start.
    """
    try:
        repository_uuid = uuid.UUID(repository_id)
    except ValueError:
        raise ValueError(f"Invalid repository ID: {repository_id}")

    result = await db.execute(
        select(Repository).where(Repository.id == repository_uuid)
    )
    repo = result.scalar_one_or_none()

    if not repo:
        raise ValueError(f"Repository {repository_id} not found.")

    commit_hash = repo.latest_commit_hash or ""
    repository_id = str(repository_uuid)  # normalised string form

    # Guard: skip spawn if analysis already exists for this commit (unless forced)
    if not force:
        existing = await db.execute(
            select(AnalysisRun).where(
                AnalysisRun.repository_id == repository_uuid,
                AnalysisRun.commit_hash == commit_hash,
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError(
                f"Analysis already exists for repository {repository_id} "
                f"at commit {commit_hash}. Pass force=true to re-analyze."
            )

    # Spawn worker container (blocking Docker call — run in thread pool)
    try:
        await asyncio.to_thread(
            _ensure_container_running, repo.repo_url, repository_id, commit_hash
        )
    except Exception as e:
        logger.exception("Failed to spawn worker container for repository %s", repository_id)
        raise ValueError(f"Failed to start audit worker: {e}") from e

    logger.info("Audit worker started for repository %s at commit %s", repository_id, commit_hash)

    # Mark audit as in-progress in Redis (TTL: 1 hour as a stale-entry safeguard)
    try:
        r = aioredis.from_url(settings.REDIS_URL)
        try:
            base_key = f"devintel:{repository_id}:{commit_hash}"
            await r.set(f"{base_key}:status", "progress", ex=3600)
            await r.set(f"{base_key}:progress", 0, ex=3600)
            await r.delete(f"{base_key}:result")
        finally:
            await r.aclose()
    except Exception:
        logger.exception(
            "Failed to initialise Redis state for repository %s at commit %s",
            repository_id, commit_hash,
        )

    return {
        "repository_id": repository_id,
        "commit_hash": commit_hash,
    }
