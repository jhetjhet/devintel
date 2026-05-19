import uuid
from urllib.parse import urlparse

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Repository
from schemas.repository import RepositoryResponse
from utils.repo_meta import get_repo_metadata


def _normalize_uuid(value: str | uuid.UUID, field_name: str) -> uuid.UUID:
    if isinstance(value, uuid.UUID):
        return value

    try:
        return uuid.UUID(value)
    except ValueError as exc:
        raise ValueError(f"Invalid {field_name} format.") from exc


async def get_repository_record_by_id(
    repository_id: str,
    db: AsyncSession,
    user_id: str | uuid.UUID | None = None,
) -> Repository:
    repo_uuid = _normalize_uuid(repository_id, "repository ID")

    stmt = select(Repository).where(Repository.id == repo_uuid)
    if user_id is not None:
        stmt = stmt.where(Repository.user_id == _normalize_uuid(user_id, "user ID"))

    result = await db.execute(stmt)
    repo = result.scalar_one_or_none()

    if not repo:
        raise ValueError("Repository not found.")

    return repo


async def analyze_repository(
    request_url: str,
    user_id: str | uuid.UUID,
    db: AsyncSession,
) -> RepositoryResponse:
    """Fetch repository metadata and create/update repository record."""
    user_uuid = _normalize_uuid(user_id, "user ID")

    result = await db.execute(
        select(Repository).where(
            Repository.repo_url == request_url,
            Repository.user_id == user_uuid,
        )
    )
    repo = result.scalar_one_or_none()

    try:
        repo_meta = get_repo_metadata(request_url)
    except Exception as e:
        print(f"Error fetching metadata for {request_url}: {e}")
        raise ValueError("Failed to fetch repository metadata. Please check the URL and make sure target repository is public.")

    print(f"Fetched metadata for {request_url}:")
    print(f"  Title: {repo_meta.title}")
    print(f"  Latest commit: {repo_meta.latest_commit_hash} - {repo_meta.latest_commit_message}")
    print(f"  Author: {repo_meta.latest_commit_author} <{repo_meta.latest_commit_author_email}> on {repo_meta.latest_commit_date}")
    print(f"  Default branch: {repo_meta.default_branch}")
    print(f"  Provider/owner/repo: {repo_meta.url} -> {repo_meta.url.split('/')[-2:]}")
    print(f"  Parsed URL: {urlparse(request_url)}")

    parsed = urlparse(request_url)
    netloc = parsed.netloc or ""
    provider = netloc.split(".")[0] if netloc else None
    path_parts = parsed.path.strip("/").split("/")
    owner_name = path_parts[0] if len(path_parts) >= 1 else None

    if not repo:
        repo = Repository(
            user_id=user_uuid,
            repo_url=request_url,
            provider=provider,
            owner_name=owner_name,
            repo_name=repo_meta.title,
            latest_commit_hash=repo_meta.latest_commit_hash,
        )
        db.add(repo)
        await db.commit()
        await db.refresh(repo)
    else:
        repo.latest_commit_hash = repo_meta.latest_commit_hash
        await db.commit()
        await db.refresh(repo)

    print(repo.id)

    return RepositoryResponse(
        id=str(repo.id),
        repo_url=repo.repo_url,
        provider=repo.provider,
        owner_name=repo.owner_name,
        repo_name=repo.repo_name,
    )


async def get_repository_by_id(
    repository_id: str,
    db: AsyncSession,
) -> RepositoryResponse:
    """Fetch repository by ID."""
    repo = await get_repository_record_by_id(repository_id, db)

    return RepositoryResponse(
        id=str(repo.id),
        repo_url=repo.repo_url,
        provider=repo.provider,
        owner_name=repo.owner_name,
        repo_name=repo.repo_name,
    )
