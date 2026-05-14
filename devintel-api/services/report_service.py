import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

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
from schemas.analysis import AnalysisRunSummary, AnalysisRunDetail
from schemas.report import (
    RadarMetricOut,
    ArchitecturalRecommendationOut,
    RefactorSuggestionOut,
    QuickWinOut,
    SecurityVulnerabilityOut,
    RiskyEntityOut,
    FileHealthEntryOut,
    AnalysisDependencyOut,
)


async def list_analysis_runs(repository_id: str, db: AsyncSession) -> list[AnalysisRunSummary]:
    """Fetch all analysis runs for a repository."""
    try:
        repo_uuid = uuid.UUID(repository_id)
    except ValueError:
        raise ValueError("Invalid repository ID format.")

    repo_result = await db.execute(select(Repository).where(Repository.id == repo_uuid))
    if not repo_result.scalar_one_or_none():
        raise ValueError("Repository not found.")

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


async def get_analysis_run_detail_by_id(repository_id: str, analysis_run_id: str, db: AsyncSession) -> AnalysisRunDetail:
    """Fetch detailed analysis run by its own UUID."""
    try:
        repo_uuid = uuid.UUID(repository_id)
        run_uuid = uuid.UUID(analysis_run_id)
    except ValueError:
        raise ValueError("Invalid ID format.")

    repo_result = await db.execute(select(Repository).where(Repository.id == repo_uuid))
    if not repo_result.scalar_one_or_none():
        raise ValueError("Repository not found.")

    run_result = await db.execute(
        select(AnalysisRun).where(
            AnalysisRun.id == run_uuid,
            AnalysisRun.repository_id == repo_uuid,
        )
    )
    run = run_result.scalar_one_or_none()
    if not run:
        raise ValueError("Analysis run not found.")

    run_id = run.id

    radar = (await db.execute(select(RadarMetric).where(RadarMetric.analysis_run_id == run_id))).scalars().all()
    arch_recs = (await db.execute(select(ArchitecturalRecommendation).where(ArchitecturalRecommendation.analysis_run_id == run_id).order_by(ArchitecturalRecommendation.rank))).scalars().all()
    refactors = (await db.execute(select(RefactorSuggestion).where(RefactorSuggestion.analysis_run_id == run_id))).scalars().all()
    wins = (await db.execute(select(QuickWin).where(QuickWin.analysis_run_id == run_id))).scalars().all()
    vulns = (await db.execute(select(SecurityVulnerability).where(SecurityVulnerability.analysis_run_id == run_id))).scalars().all()
    entities = (await db.execute(select(RiskyEntity).where(RiskyEntity.analysis_run_id == run_id).order_by(RiskyEntity.rank))).scalars().all()
    health = (await db.execute(select(FileHealthEntry).where(FileHealthEntry.analysis_run_id == run_id))).scalars().all()

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


async def get_analysis_run_detail(repository_id: str, commit_hash: str, db: AsyncSession) -> AnalysisRunDetail:
    """Fetch detailed analysis run with all child relations."""
    try:
        repo_uuid = uuid.UUID(repository_id)
    except ValueError:
        raise ValueError("Invalid repository ID format.")

    repo_result = await db.execute(select(Repository).where(Repository.id == repo_uuid))
    if not repo_result.scalar_one_or_none():
        raise ValueError("Repository not found.")

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
        raise ValueError("Report not found for this commit.")

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
