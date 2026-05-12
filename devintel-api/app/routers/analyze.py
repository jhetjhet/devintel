from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from urllib.parse import urlparse
import json
import uuid

from app.database import get_db
from app.models import Repository

from app.config import settings
import redis.asyncio as aioredis
from utils.repo_meta import get_repo_metadata

router = APIRouter()


class AnalyzeRequest(BaseModel):
    repo_url: str


class RepositoryResponse(BaseModel):
    id: str
    repo_url: str
    provider: str | None = None
    owner_name: str | None = None
    repo_name: str | None = None


@router.post("/api/analyze/", response_model=RepositoryResponse)
async def analyze(request: AnalyzeRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Repository).where(Repository.repo_url == request.repo_url)
    )
    repo = result.scalar_one_or_none()

    repo_meta = get_repo_metadata(request.repo_url)

    print(f"Fetched metadata for {request.repo_url}:")
    print(f"  Title: {repo_meta.title}")
    print(f"  Latest commit: {repo_meta.latest_commit_hash} - {repo_meta.latest_commit_message}")
    print(f"  Author: {repo_meta.latest_commit_author} <{repo_meta.latest_commit_author_email}> on {repo_meta.latest_commit_date}")
    print(f"  Default branch: {repo_meta.default_branch}")
    print(f"  Provider/owner/repo: {repo_meta.url} -> {repo_meta.url.split('/')[-2:]}")
    print(f"  Parsed URL: {urlparse(request.repo_url)}")

    parsed = urlparse(request.repo_url)
    netloc = parsed.netloc or ""
    provider = netloc.split(".")[0] if netloc else None
    path_parts = parsed.path.strip("/").split("/")
    owner_name = path_parts[0] if len(path_parts) >= 1 else None

    if not repo:
        repo = Repository(
            repo_url=request.repo_url,
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


@router.post("/api/analyze/complete/{repository_id}/")
async def get_analysis_result(repository_id: str, db: AsyncSession = Depends(get_db)):
    try:
        repo_uuid = uuid.UUID(repository_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid repository ID format.")

    result = await db.execute(
        select(Repository).where(Repository.id == repo_uuid)
    )
    repo = result.scalar_one_or_none()

    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found.")

    r = aioredis.from_url(settings.REDIS_URL)
    try:
        raw = await r.get(f"devintel:{repository_id}:{repo.latest_commit_hash}:result")
    finally:
        await r.aclose()

    if raw is None:
        raise HTTPException(status_code=404, detail="No result found for this repository.")

    return json.loads(raw)

@router.get("/api/repositories/{repository_id}/", response_model=RepositoryResponse)
async def get_repository(repository_id: str, db: AsyncSession = Depends(get_db)):
    try:
        repo_uuid = uuid.UUID(repository_id)
    except ValueError:
        print(f"Invalid repository ID format: {repository_id}")
        raise HTTPException(status_code=400, detail="Invalid repository ID format.")

    result = await db.execute(
        select(Repository).where(Repository.id == repo_uuid)
    )
    repo = result.scalar_one_or_none()

    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found.")

    return RepositoryResponse(id=str(repo.id), repo_url=repo.repo_url, provider=repo.provider, owner_name=repo.owner_name, repo_name=repo.repo_name)

