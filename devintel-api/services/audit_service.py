import asyncio
import logging
import uuid

import docker
import docker.errors
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import AnalysisRun, User
from services.redis_service import delete_analysis_keys, initialize_analysis_job
from services.repository_service import get_repository_record_by_id

logger = logging.getLogger(__name__)


class WorkerLimitReachedError(Exception):
    """Raised when the configured worker-cap has been reached."""


# ---------------------------------------------------------------------------
# Docker helpers (sync — called via asyncio.to_thread)
# ---------------------------------------------------------------------------

def _ensure_container_running(job_id: str) -> None:
    """
    Checks whether a worker container for this repository is already running.
    Spawns one if not. Cleans up stopped/exited containers with the same name
    before re-spawning to avoid name conflicts.
    """
    container_name = f"devintel_engine_{job_id}"
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

    running_workers = client.containers.list(
        filters={"name": "devintel_engine_"}
    )
    worker_limit = settings.MAX_AUDIT_WORKERS
    if len(running_workers) >= worker_limit:
        raise WorkerLimitReachedError(
            "Worker limit reached "
            f"({len(running_workers)}/{worker_limit}). "
            "Try again when a running audit completes."
        )

    logger.info("Spawning container %s", container_name)
    client.containers.run(
        image=settings.DEVINTEL_ENGINE_IMAGE,
        name=container_name,
        command=["python3", "/app/orchestrator.py", job_id],
        environment={
            "LLM_API_KEY": settings.LLM_API_KEY,
            "LLM_MODEL": settings.LLM_MODEL,
            "LLM_BASE_URL": settings.LLM_BASE_URL,
            "REDIS_TTL_SECONDS": settings.ENGINE_REDIS_TTL_SECONDS,
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

async def start_audit(
    repository_id: str,
    force: bool,
    user_id: str | uuid.UUID,
    db: AsyncSession,
) -> dict:
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
    if isinstance(user_id, str):
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError as exc:
            raise ValueError("Invalid user ID format.") from exc
    else:
        user_uuid = user_id

    repo = await get_repository_record_by_id(repository_id, db, user_id=user_uuid)

    user_result = await db.execute(select(User).where(User.id == user_uuid))
    user = user_result.scalar_one_or_none()
    ai_analysis_enabled = user.ai_analysis_enabled if user else False

    commit_hash = repo.latest_commit_hash or ""
    repository_id = str(repo.id)
    job_id = str(uuid.uuid4())

    # Guard: skip spawn if analysis already exists for this commit (unless forced)
    if not force:
        existing = await db.execute(
            select(AnalysisRun).where(
                AnalysisRun.repository_id == repo.id,
                AnalysisRun.user_id == user_uuid,
                AnalysisRun.commit_hash == commit_hash,
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError(
                f"Analysis already exists for repository {repository_id} "
                f"at commit {commit_hash}. Pass force=true to re-analyze."
            )

    metadata = {
        "commit_hash": commit_hash,
        "user_id": str(user_uuid),
        "repo_url": repo.repo_url,
        "with_llm": ai_analysis_enabled,
    }

    try:
        await initialize_analysis_job(job_id, metadata)
    except Exception as exc:
        logger.exception("Failed to initialize Redis state for job %s", job_id)
        raise ValueError(f"Failed to initialize audit state: {exc}") from exc

    analysis_run = AnalysisRun(
        repository_id=repo.id,
        user_id=user_uuid,
        commit_hash=commit_hash,
        job_id=job_id,
    )

    try:
        db.add(analysis_run)
        await db.commit()
        await db.refresh(analysis_run)
    except Exception as exc:
        await db.rollback()
        await delete_analysis_keys(job_id)
        raise ValueError(f"Failed to create analysis run: {exc}") from exc

    # Spawn worker container (blocking Docker call — run in thread pool)
    try:
        await asyncio.to_thread(_ensure_container_running, job_id)
    except WorkerLimitReachedError:
        await delete_analysis_keys(job_id)
        await db.delete(analysis_run)
        await db.commit()
        raise
    except Exception as e:
        logger.exception("Failed to spawn worker container for job %s", job_id)
        await delete_analysis_keys(job_id)
        await db.delete(analysis_run)
        await db.commit()
        raise ValueError(f"Failed to start audit worker: {e}") from e

    logger.info(
        "Audit worker started for repository %s at commit %s with job %s",
        repository_id,
        commit_hash,
        job_id,
    )

    return {
        "repository_id": repository_id,
        "commit_hash": commit_hash,
        "job_id": job_id,
    }
