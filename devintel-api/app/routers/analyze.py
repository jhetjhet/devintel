from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from schemas.repository import AnalyzeRequest, RepositoryResponse
from schemas.analysis import AnalysisRunSummary, AnalysisRunDetail
from services.repository_service import analyze_repository, get_repository_by_id
from services.analysis_service import process_analysis_result
from services.report_service import list_analysis_runs, get_analysis_run_detail

router = APIRouter()


@router.post("/api/analyze/", response_model=RepositoryResponse)
async def analyze(request: AnalyzeRequest, db: AsyncSession = Depends(get_db)):
    try:
        return await analyze_repository(request.repo_url, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/analyze/complete/{repository_id}/")
async def get_analysis_result(repository_id: str, db: AsyncSession = Depends(get_db)):
    try:
        return await process_analysis_result(repository_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/api/repositories/{repository_id}/", response_model=RepositoryResponse)
async def get_repository(repository_id: str, db: AsyncSession = Depends(get_db)):
    try:
        return await get_repository_by_id(repository_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/repositories/{repository_id}/reports/", response_model=list[AnalysisRunSummary])
async def list_reports(repository_id: str, db: AsyncSession = Depends(get_db)):
    try:
        return await list_analysis_runs(repository_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/repositories/{repository_id}/reports/{commit_hash}/", response_model=AnalysisRunDetail)
async def get_report(repository_id: str, commit_hash: str, db: AsyncSession = Depends(get_db)):
    try:
        return await get_analysis_run_detail(repository_id, commit_hash, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

