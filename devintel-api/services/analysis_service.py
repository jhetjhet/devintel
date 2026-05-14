import json
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Repository, AnalysisRun
from services.redis_service import get_analysis_result, get_analysis_status_key, delete_analysis_keys
from utils.analysis_persist import persist_analysis_result


async def process_analysis_result(repository_id: str, db: AsyncSession) -> dict:
    """
    Fetch analysis result from Redis, validate, transform, and persist to database.
    Returns {repository_id, commit_hash} on success, or error dict on failure.
    """
    try:
        repo_uuid = uuid.UUID(repository_id)
    except ValueError:
        raise ValueError("Invalid repository ID format.")

    result = await db.execute(
        select(Repository).where(Repository.id == repo_uuid)
    )
    repo = result.scalar_one_or_none()

    if not repo:
        raise ValueError("Repository not found.")

    commit_hash = repo.latest_commit_hash

    raw = await get_analysis_result(repository_id, commit_hash)

    if raw is None:
        raise ValueError("No result found for this repository.")

    data = json.loads(raw)

    # Return error results immediately without any DB writes
    if data.get("status") == "error":
        return data

    # The agent wraps the report under "full_audit_report"
    report = data.get("full_audit_report", data)
    await persist_analysis_result(db, repo, report)

    # Delete all Redis keys for this repo+commit to prevent stale data
    await delete_analysis_keys(repository_id, commit_hash)

    return {
        "repository_id": str(repo.id),
        "commit_hash": commit_hash,
    }


async def get_analysis_status(repository_id: str, db: AsyncSession) -> dict:
    """
    Returns the analysis status for the repository's latest commit.

    Possible statuses:
    - "completed"   : AnalysisRun record exists for this repo + commit hash
    - "in_progress" : No DB record but Redis result key is present (worker still running)
    - "not_started" : No DB record and no Redis result key
    """
    try:
        repo_uuid = uuid.UUID(repository_id)
    except ValueError:
        raise ValueError("Invalid repository ID format.")

    result = await db.execute(select(Repository).where(Repository.id == repo_uuid))
    repo = result.scalar_one_or_none()

    if not repo:
        raise ValueError("Repository not found.")

    commit_hash = repo.latest_commit_hash or ""

    # Check DB first
    run_result = await db.execute(
        select(AnalysisRun).where(
            AnalysisRun.repository_id == repo_uuid,
            AnalysisRun.commit_hash == commit_hash,
        )
    )
    if run_result.scalar_one_or_none():
        return {
            "repository_id": repository_id,
            "commit_hash": commit_hash,
            "status": "completed",
        }

    # Check Redis status key
    redis_status = await get_analysis_status_key(repository_id, commit_hash)

    if redis_status == "progress":
        return {
            "repository_id": repository_id,
            "commit_hash": commit_hash,
            "status": "in_progress",
        }

    if redis_status == "completed":
        raw = await get_analysis_result(repository_id, commit_hash)
        if raw is not None:
            return {
                "repository_id": repository_id,
                "commit_hash": commit_hash,
                "status": "with_result",
            }

    return {
        "repository_id": repository_id,
        "commit_hash": commit_hash,
        "status": "not_started",
    }
