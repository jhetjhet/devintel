from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Repository

from app.config import settings
import redis.asyncio as aioredis

router = APIRouter()


class AnalyzeRequest(BaseModel):
    repo_url: str


class AnalyzeResponse(BaseModel):
    id: str


@router.post("/api/analyze/", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Repository).where(Repository.repo_url == request.repo_url)
    )
    repo = result.scalar_one_or_none()

    if not repo:
        repo = Repository(repo_url=request.repo_url)
        db.add(repo)
        await db.commit()
        await db.refresh(repo)

    return AnalyzeResponse(id=str(repo.id))
