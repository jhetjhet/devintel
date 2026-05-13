from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from urllib.parse import urlparse
import json
import uuid

from app.database import get_db
from app.models import (
    Repository,
    AnalysisRun,
    RadarMetric,
    ArchitecturalRecommendation,
    RefactorSuggestion,
    QuickWin,
    SecurityVulnerability,
    RiskyEntity,
    FileHealthEntry,
    AnalysisDependency,
    Dependency,
)
from app.config import settings
import redis.asyncio as aioredis
from utils.repo_meta import get_repo_metadata
from utils.analysis_persist import persist_analysis_result

router = APIRouter()


class AnalyzeRequest(BaseModel):
    repo_url: str


class RepositoryResponse(BaseModel):
    id: str
    repo_url: str
    provider: str | None = None
    owner_name: str | None = None
    repo_name: str | None = None


# ── Report list ───────────────────────────────────────────────────────────────

class AnalysisRunSummary(BaseModel):
    id: str
    job_id: str
    commit_hash: str | None
    branch: str | None
    repo_name: str | None
    overall_score: int | None
    technical_debt_score: int | None
    overall_verdict: str | None
    total_findings: int | None
    total_smells: int | None
    security_critical_count: int | None
    security_high_count: int | None
    security_medium_count: int | None
    security_low_count: int | None
    scanned_at: datetime | None
    created_at: datetime


# ── Report detail ─────────────────────────────────────────────────────────────

class RadarMetricOut(BaseModel):
    subject: str
    score: int
    max: int


class ArchitecturalRecommendationOut(BaseModel):
    rank: int
    recommendation: str


class RefactorSuggestionOut(BaseModel):
    suggestion_id: str | None
    title: str | None
    file_path: str | None
    start_line: int | None
    end_line: int | None
    commit_hash: str | None
    symbol: str | None
    rule: str | None
    detected_by: str | None
    severity: str | None
    confidence: float | None
    reasoning: str | None
    before_code: str | None
    after_code: str | None
    llm_provider: str | None
    llm_model: str | None
    prompt_version: str | None


class QuickWinOut(BaseModel):
    win_id: str | None
    title: str | None
    description: str | None
    impact: str | None
    type: str | None


class SecurityVulnerabilityOut(BaseModel):
    vulnerability_id: str | None
    severity: str | None
    title: str | None
    location: str | None
    file_path: str | None
    line_number: int | None
    cve: str | None
    description: str | None
    remediation: str | None


class RiskyEntityOut(BaseModel):
    rank: int | None
    entity_id: str | None
    name: str | None
    file_path: str | None
    pain_score: float | None


class FileHealthEntryOut(BaseModel):
    path: str | None
    health_score: int | None
    file_count: int | None
    status: str | None


class AnalysisDependencyOut(BaseModel):
    name: str
    ecosystem: str | None
    current_version: str | None
    latest_version: str | None
    is_outdated: bool
    is_unused: bool


class AnalysisRunDetail(BaseModel):
    id: str
    job_id: str
    commit_hash: str | None
    branch: str | None
    repo_name: str | None
    languages: list | None
    frameworks: list | None
    file_count: int | None
    detected_pattern: str | None
    overall_score: int | None
    technical_debt_score: int | None
    overall_verdict: str | None
    confidence: float | None
    growth_pts: int | None
    ai_reasoning: str | None
    total_findings: int | None
    total_smells: int | None
    security_critical_count: int | None
    security_high_count: int | None
    security_medium_count: int | None
    security_low_count: int | None
    scanned_at: datetime | None
    created_at: datetime
    radar_metrics: list[RadarMetricOut]
    architectural_recommendations: list[ArchitecturalRecommendationOut]
    refactor_suggestions: list[RefactorSuggestionOut]
    quick_wins: list[QuickWinOut]
    security_vulnerabilities: list[SecurityVulnerabilityOut]
    risky_entities: list[RiskyEntityOut]
    file_health_entries: list[FileHealthEntryOut]
    dependencies: list[AnalysisDependencyOut]


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

    commit_hash = repo.latest_commit_hash

    r = aioredis.from_url(settings.REDIS_URL)
    try:
        raw = await r.get(f"devintel:{repository_id}:{commit_hash}:result")
    finally:
        await r.aclose()

    if raw is None:
        raise HTTPException(status_code=404, detail="No result found for this repository.")

    data = json.loads(raw)

    # Return error results immediately without any DB writes
    if data.get("status") == "error":
        return data

    # The agent wraps the report under "full_audit_report"
    report = data.get("full_audit_report", data)
    await persist_analysis_result(db, repo, report)

    # Delete all Redis keys for this repo+commit to prevent stale data
    r = aioredis.from_url(settings.REDIS_URL)
    try:
        pattern = f"devintel:{repository_id}:{commit_hash}:*"
        keys = await r.keys(pattern)
        if keys:
            await r.delete(*keys)
    finally:
        await r.aclose()

    return {
        "repository_id": str(repo.id),
        "commit_hash": commit_hash,
    }

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


@router.get("/api/repositories/{repository_id}/reports/", response_model=list[AnalysisRunSummary])
async def list_reports(repository_id: str, db: AsyncSession = Depends(get_db)):
    try:
        repo_uuid = uuid.UUID(repository_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid repository ID format.")

    repo_result = await db.execute(select(Repository).where(Repository.id == repo_uuid))
    if not repo_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Repository not found.")

    runs_result = await db.execute(
        select(AnalysisRun)
        .where(AnalysisRun.repository_id == repo_uuid)
        .order_by(AnalysisRun.scanned_at.desc())
    )
    runs = runs_result.scalars().all()

    return [
        AnalysisRunSummary(
            id=str(r.id),
            job_id=r.job_id,
            commit_hash=r.commit_hash,
            branch=r.branch,
            repo_name=r.repo_name,
            overall_score=r.overall_score,
            technical_debt_score=r.technical_debt_score,
            overall_verdict=r.overall_verdict,
            total_findings=r.total_findings,
            total_smells=r.total_smells,
            security_critical_count=r.security_critical_count,
            security_high_count=r.security_high_count,
            security_medium_count=r.security_medium_count,
            security_low_count=r.security_low_count,
            scanned_at=r.scanned_at,
            created_at=r.created_at,
        )
        for r in runs
    ]


@router.get("/api/repositories/{repository_id}/reports/{commit_hash}/", response_model=AnalysisRunDetail)
async def get_report(repository_id: str, commit_hash: str, db: AsyncSession = Depends(get_db)):
    try:
        repo_uuid = uuid.UUID(repository_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid repository ID format.")

    repo_result = await db.execute(select(Repository).where(Repository.id == repo_uuid))
    if not repo_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Repository not found.")

    run_result = await db.execute(
        select(AnalysisRun)
        .where(
            AnalysisRun.repository_id == repo_uuid,
            AnalysisRun.commit_hash == commit_hash,
        )
        .order_by(AnalysisRun.scanned_at.desc())
        .limit(1)
    )
    run = run_result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Report not found for this commit.")

    run_id = run.id

    radar = (await db.execute(select(RadarMetric).where(RadarMetric.analysis_run_id == run_id))).scalars().all()
    arch_recs = (await db.execute(select(ArchitecturalRecommendation).where(ArchitecturalRecommendation.analysis_run_id == run_id).order_by(ArchitecturalRecommendation.rank))).scalars().all()
    refactors = (await db.execute(select(RefactorSuggestion).where(RefactorSuggestion.analysis_run_id == run_id))).scalars().all()
    wins = (await db.execute(select(QuickWin).where(QuickWin.analysis_run_id == run_id))).scalars().all()
    vulns = (await db.execute(select(SecurityVulnerability).where(SecurityVulnerability.analysis_run_id == run_id))).scalars().all()
    entities = (await db.execute(select(RiskyEntity).where(RiskyEntity.analysis_run_id == run_id).order_by(RiskyEntity.rank))).scalars().all()
    health = (await db.execute(select(FileHealthEntry).where(FileHealthEntry.analysis_run_id == run_id))).scalars().all()

    # Join analysis_dependencies with dependencies for the name/ecosystem
    deps_result = await db.execute(
        select(AnalysisDependency, Dependency)
        .join(Dependency, AnalysisDependency.dependency_id == Dependency.id)
        .where(AnalysisDependency.analysis_run_id == run_id)
    )
    deps = deps_result.all()

    return AnalysisRunDetail(
        id=str(run.id),
        job_id=run.job_id,
        commit_hash=run.commit_hash,
        branch=run.branch,
        repo_name=run.repo_name,
        languages=run.languages,
        frameworks=run.frameworks,
        file_count=run.file_count,
        detected_pattern=run.detected_pattern,
        overall_score=run.overall_score,
        technical_debt_score=run.technical_debt_score,
        overall_verdict=run.overall_verdict,
        confidence=run.confidence,
        growth_pts=run.growth_pts,
        ai_reasoning=run.ai_reasoning,
        total_findings=run.total_findings,
        total_smells=run.total_smells,
        security_critical_count=run.security_critical_count,
        security_high_count=run.security_high_count,
        security_medium_count=run.security_medium_count,
        security_low_count=run.security_low_count,
        scanned_at=run.scanned_at,
        created_at=run.created_at,
        radar_metrics=[
            RadarMetricOut(subject=m.subject, score=m.score, max=m.max)
            for m in radar
        ],
        architectural_recommendations=[
            ArchitecturalRecommendationOut(rank=r.rank, recommendation=r.recommendation)
            for r in arch_recs
        ],
        refactor_suggestions=[
            RefactorSuggestionOut(
                suggestion_id=s.suggestion_id, title=s.title, file_path=s.file_path,
                start_line=s.start_line, end_line=s.end_line, commit_hash=s.commit_hash,
                symbol=s.symbol, rule=s.rule, detected_by=s.detected_by,
                severity=s.severity, confidence=s.confidence, reasoning=s.reasoning,
                before_code=s.before_code, after_code=s.after_code,
                llm_provider=s.llm_provider, llm_model=s.llm_model,
                prompt_version=s.prompt_version,
            )
            for s in refactors
        ],
        quick_wins=[
            QuickWinOut(
                win_id=w.win_id, title=w.title, description=w.description,
                impact=w.impact, type=w.type,
            )
            for w in wins
        ],
        security_vulnerabilities=[
            SecurityVulnerabilityOut(
                vulnerability_id=v.vulnerability_id, severity=v.severity, title=v.title,
                location=v.location, file_path=v.file_path, line_number=v.line_number,
                cve=v.cve, description=v.description, remediation=v.remediation,
            )
            for v in vulns
        ],
        risky_entities=[
            RiskyEntityOut(
                rank=e.rank, entity_id=e.entity_id, name=e.name,
                file_path=e.file_path, pain_score=e.pain_score,
            )
            for e in entities
        ],
        file_health_entries=[
            FileHealthEntryOut(
                path=h.path, health_score=h.health_score,
                file_count=h.file_count, status=h.status,
            )
            for h in health
        ],
        dependencies=[
            AnalysisDependencyOut(
                name=dep.name, ecosystem=dep.ecosystem,
                current_version=ad.current_version, latest_version=ad.latest_version,
                is_outdated=ad.is_outdated, is_unused=ad.is_unused,
            )
            for ad, dep in deps
        ],
    )

