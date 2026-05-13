import redis.asyncio as aioredis

from app.config import settings


async def get_analysis_result(repository_id: str, commit_hash: str) -> bytes | None:
    """Fetch the analysis result from Redis for a given repo and commit."""
    r = aioredis.from_url(settings.REDIS_URL)
    try:
        return await r.get(f"devintel:{repository_id}:{commit_hash}:result")
    finally:
        await r.aclose()


async def delete_analysis_keys(repository_id: str, commit_hash: str) -> None:
    """Delete all Redis keys for a given repo+commit to prevent stale data."""
    r = aioredis.from_url(settings.REDIS_URL)
    try:
        pattern = f"devintel:{repository_id}:{commit_hash}:*"
        keys = await r.keys(pattern)
        if keys:
            await r.delete(*keys)
    finally:
        await r.aclose()
