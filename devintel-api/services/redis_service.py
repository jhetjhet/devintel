import json

import redis.asyncio as aioredis

from app.config import settings

JOB_TTL_SECONDS = 3600


def _analysis_key(job_id: str, data_name: str) -> str:
    return f"devintel:{job_id}:{data_name}"


async def initialize_analysis_job(job_id: str, metadata: dict) -> None:
    r = aioredis.from_url(settings.REDIS_URL)
    try:
        await r.set(_analysis_key(job_id, "metadata"), json.dumps(metadata), ex=JOB_TTL_SECONDS)
        await r.set(_analysis_key(job_id, "status"), "progress", ex=JOB_TTL_SECONDS)
        await r.set(_analysis_key(job_id, "progress"), 0, ex=JOB_TTL_SECONDS)
        await r.delete(_analysis_key(job_id, "result"))
    finally:
        await r.aclose()


async def get_analysis_result(job_id: str) -> bytes | None:
    """Fetch the analysis result from Redis for a given job."""
    r = aioredis.from_url(settings.REDIS_URL)
    try:
        return await r.get(_analysis_key(job_id, "result"))
    finally:
        await r.aclose()


async def get_analysis_status_key(job_id: str) -> str | None:
    """Fetch the analysis status value from Redis ('progress' or 'complete')."""
    r = aioredis.from_url(settings.REDIS_URL)
    try:
        value = await r.get(_analysis_key(job_id, "status"))
        return value.decode() if value is not None else None
    finally:
        await r.aclose()


async def get_analysis_metadata(job_id: str) -> dict | None:
    """Fetch analysis metadata JSON from Redis for a given job."""
    r = aioredis.from_url(settings.REDIS_URL)
    try:
        value = await r.get(_analysis_key(job_id, "metadata"))
        if value is None:
            return None
        try:
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return None
    finally:
        await r.aclose()


async def delete_analysis_keys(job_id: str) -> None:
    """Delete all Redis keys for a given job to prevent stale data."""
    r = aioredis.from_url(settings.REDIS_URL)
    try:
        pattern = f"devintel:{job_id}:*"
        keys = await r.keys(pattern)
        if keys:
            await r.delete(*keys)
    finally:
        await r.aclose()
