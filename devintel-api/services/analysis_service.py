import json
import uuid

from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AnalysisRun
from services.redis_service import (
    get_analysis_result,
    get_analysis_status_key,
    get_analysis_metadata,
    delete_analysis_keys,
)
from services.repository_service import get_repository_record_by_id
from utils.analysis_persist import persist_analysis_result


async def process_analysis_result(
    repository_id: str,
    user_id: str | uuid.UUID,
    db: AsyncSession,
) -> dict:
    """
    Fetch analysis result from Redis, validate, transform, and persist to database.
    Returns {repository_id, commit_hash} on success, or error dict on failure.
    """
    try:
        repo_uuid = uuid.UUID(repository_id)
    except ValueError:
        raise ValueError("Invalid repository ID format.")

    repo = await get_repository_record_by_id(repository_id, db, user_id=user_id)

    run_result = await db.execute(
        select(AnalysisRun)
        .where(
            AnalysisRun.repository_id == repo_uuid,
            AnalysisRun.user_id == repo.user_id,
        )
        .order_by(desc(AnalysisRun.created_at))
        .limit(1)
    )
    analysis_run = run_result.scalar_one_or_none()

    if not analysis_run or not analysis_run.job_id:
        raise ValueError("No analysis job found for this repository.")

    raw = await get_analysis_result(analysis_run.job_id)

    if raw is None:
        raise ValueError("No result found for this repository.")

    data = json.loads(raw)

    # Return error results immediately without any DB writes
    if data.get("status") == "error":
        return data

    # The agent wraps the report under "full_audit_report"
    report = data.get("full_audit_report", data)
    metadata = await get_analysis_metadata(analysis_run.job_id)
    analysis_run = await persist_analysis_result(
        db,
        analysis_run,
        repo,
        report,
        metadata=metadata,
    )

    # Delete all Redis keys for this job to prevent stale data
    await delete_analysis_keys(analysis_run.job_id)

    return {
        "repository_id": str(repo.id),
        "analysis_run_id": str(analysis_run.id),
        "commit_hash": analysis_run.commit_hash,
    }


async def get_analysis_status(
    repository_id: str,
    user_id: str | uuid.UUID,
    db: AsyncSession,
) -> dict:
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

    repo = await get_repository_record_by_id(repository_id, db, user_id=user_id)

    _run_filter = (
        AnalysisRun.repository_id == repo_uuid,
        AnalysisRun.user_id == repo.user_id,
    )

    # Most recent run for this repo + commit
    run_result = await db.execute(
        select(AnalysisRun)
        .where(*_run_filter)
        .order_by(desc(AnalysisRun.created_at))
        .limit(1)
    )
    recent_run = run_result.scalar_one_or_none()

    # Total count of runs for this repo + commit
    count_result = await db.execute(
        select(func.count()).select_from(AnalysisRun).where(*_run_filter)
    )
    analysis_run_count = count_result.scalar() or 0
    commit_hash = (recent_run.commit_hash if recent_run else None) or repo.latest_commit_hash or ""

    def _serialize_run(run: AnalysisRun) -> dict:
        print('-' * 20)
        # print json run
        print(json.dumps({
            "id": str(run.id),
            "job_id": run.job_id,
            "commit_hash": run.commit_hash,
            "branch": run.branch,
            "repo_name": run.repo_name,
            "overall_score": run.overall_score,
            "technical_debt_score": run.technical_debt_score,
            "overall_verdict": run.overall_verdict,
            "confidence": run.confidence,
            "total_findings": run.total_findings,
            "total_smells": run.total_smells,
            "security_critical_count": run.security_critical_count,
            "security_high_count": run.security_high_count,
            "security_medium_count": run.security_medium_count,
            "security_low_count": run.security_low_count,
            "duration_ms": run.duration_ms,
            "started_at": run.started_at.isoformat() if run.started_at else None,
            "completed_at": run.completed_at.isoformat() if run.completed_at else None,
            "with_llm": run.with_llm,
            "metadata_snapshot": run.metadata_snapshot,
            "scanned_at": run.scanned_at.isoformat() if run.scanned_at else None,
            "created_at": run.created_at.isoformat(),
        }, indent=2))
        print('-' * 20)

        return {
            "id": str(run.id),
            "job_id": run.job_id,
            "commit_hash": run.commit_hash,
            "branch": run.branch,
            "repo_name": run.repo_name,
            "overall_score": run.overall_score,
            "technical_debt_score": run.technical_debt_score,
            "overall_verdict": run.overall_verdict,
            "confidence": run.confidence,
            "total_findings": run.total_findings,
            "total_smells": run.total_smells,
            "security_critical_count": run.security_critical_count,
            "security_high_count": run.security_high_count,
            "security_medium_count": run.security_medium_count,
            "security_low_count": run.security_low_count,
            "duration_ms": run.duration_ms,
            "started_at": run.started_at.isoformat() if run.started_at else None,
            "completed_at": run.completed_at.isoformat() if run.completed_at else None,
            "with_llm": run.with_llm,
            "metadata_snapshot": run.metadata_snapshot,
            "scanned_at": run.scanned_at.isoformat() if run.scanned_at else None,
            "created_at": run.created_at.isoformat(),
        }

    def _make_response(has_pending_result: bool, analysis_status: str | None) -> dict:
        return {
            "repository_id": repository_id,
            "commit_hash": commit_hash,
            "recent_analysis_run": _serialize_run(recent_run) if recent_run else None,
            "analysis_run_count": analysis_run_count,
            "has_pending_result": has_pending_result,
            "analysis_status": analysis_status,
        }

    # Check Redis keys regardless of DB state
    redis_status = None
    raw = None
    if recent_run and recent_run.job_id:
        redis_status = await get_analysis_status_key(recent_run.job_id)
        raw = await get_analysis_result(recent_run.job_id)
    has_pending_result = raw is not None

    return _make_response(has_pending_result, redis_status)
