from datetime import datetime, timezone

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
    Dependency,
    AnalysisDependency,
)


def parse_location(location: str) -> tuple[str | None, int | None]:
    """Split 'path/to/file.py:42' into ('path/to/file.py', 42)."""
    if not location:
        return None, None
    if ":" in location:
        parts = location.rsplit(":", 1)
        try:
            return parts[0], int(parts[1])
        except ValueError:
            pass
    return location, None


async def persist_analysis_result(db: AsyncSession, repo: Repository, report: dict) -> AnalysisRun:
    """
    Map a completed agent report dict into the relational schema and commit
    everything in a single transaction.

    The caller is responsible for passing the unwrapped report (i.e. the value
    of ``full_audit_report`` when the agent envelope is present).

    Returns the newly created :class:`AnalysisRun` instance.
    """
    det = report.get("deterministic_report", {})
    llm = report.get("llm_insights", {})
    repo_summary = det.get("repository_summary", {})
    finding_summary = det.get("finding_summary", {})
    security_audit = det.get("security_audit", {})
    now = datetime.now(timezone.utc)

    # ── analysis_runs ─────────────────────────────────────────────────────────
    run = AnalysisRun(
        repository_id=repo.id,
        job_id=report.get("job_id", ""),
        commit_hash=repo_summary.get("commit_hash"),
        branch=repo_summary.get("branch"),
        repo_name=repo_summary.get("name"),
        languages=repo_summary.get("languages"),
        frameworks=repo_summary.get("frameworks"),
        file_count=repo_summary.get("file_count"),
        detected_pattern=repo_summary.get("detected_pattern"),
        overall_score=llm.get("overall_score"),
        technical_debt_score=llm.get("technical_debt_score"),
        overall_verdict=llm.get("overall_verdict"),
        confidence=llm.get("confidence"),
        growth_pts=llm.get("growth_pts"),
        ai_reasoning=llm.get("ai_reasoning"),
        total_findings=finding_summary.get("total_findings"),
        total_smells=finding_summary.get("total_smells"),
        security_critical_count=security_audit.get("critical_count"),
        security_high_count=security_audit.get("high_count"),
        security_medium_count=security_audit.get("medium_count"),
        security_low_count=security_audit.get("low_count"),
        scanned_at=now,
        full_audit_report=report,
    )
    db.add(run)
    await db.flush()  # populate run.id for FK references

    # ── radar_metrics ─────────────────────────────────────────────────────────
    for metric in llm.get("radar_metrics", []):
        db.add(RadarMetric(
            analysis_run_id=run.id,
            subject=metric.get("subject", ""),
            score=metric.get("score", 0),
            max=metric.get("max", 100),
        ))

    # ── architectural_recommendations ─────────────────────────────────────────
    for rank, rec in enumerate(llm.get("architectural_recommendations", []), start=1):
        db.add(ArchitecturalRecommendation(
            analysis_run_id=run.id,
            rank=rank,
            recommendation=rec,
        ))

    # ── refactor_suggestions ──────────────────────────────────────────────────
    for suggestion in llm.get("refactor_suggestions", []):
        source = suggestion.get("source", {})
        analysis = suggestion.get("analysis", {})
        llm_meta = suggestion.get("llm", {})
        diff = suggestion.get("diff", {})
        db.add(RefactorSuggestion(
            analysis_run_id=run.id,
            suggestion_id=suggestion.get("suggestion_id"),
            title=suggestion.get("title"),
            file_path=source.get("file"),
            start_line=source.get("start_line"),
            end_line=source.get("end_line"),
            commit_hash=source.get("commit_hash"),
            symbol=source.get("symbol"),
            rule=analysis.get("rule"),
            detected_by=analysis.get("detected_by"),
            severity=analysis.get("severity"),
            confidence=analysis.get("confidence"),
            reasoning=suggestion.get("reasoning"),
            before_code=diff.get("before"),
            after_code=diff.get("after"),
            llm_provider=llm_meta.get("provider"),
            llm_model=llm_meta.get("model"),
            prompt_version=llm_meta.get("prompt_version"),
            extra=suggestion.get("metadata"),
        ))

    # ── quick_wins ────────────────────────────────────────────────────────────
    for win in det.get("quick_wins", []):
        db.add(QuickWin(
            analysis_run_id=run.id,
            win_id=win.get("id"),
            title=win.get("title"),
            description=win.get("description"),
            impact=win.get("impact"),
            type=win.get("type"),
            extra=win.get("metadata"),
        ))

    # ── security_vulnerabilities ──────────────────────────────────────────────
    for vuln in security_audit.get("vulnerabilities", []):
        raw_location = vuln.get("location") or ""
        file_path, line_number = parse_location(raw_location)
        db.add(SecurityVulnerability(
            analysis_run_id=run.id,
            vulnerability_id=vuln.get("id"),
            severity=vuln.get("severity"),
            title=vuln.get("title"),
            location=raw_location or None,
            file_path=file_path,
            line_number=line_number,
            cve=vuln.get("cve"),
            description=vuln.get("description"),
            remediation=vuln.get("remediation"),
            extra=None,
        ))

    # ── risky_entities ────────────────────────────────────────────────────────
    for entity in det.get("top_risky_entities", []):
        db.add(RiskyEntity(
            analysis_run_id=run.id,
            rank=entity.get("rank"),
            entity_id=entity.get("entity_id"),
            name=entity.get("name"),
            file_path=entity.get("file"),
            pain_score=entity.get("pain_score"),
        ))

    # ── file_health_entries ───────────────────────────────────────────────────
    for entry in det.get("file_structure_health", []):
        db.add(FileHealthEntry(
            analysis_run_id=run.id,
            path=entry.get("path"),
            health_score=entry.get("health_score"),
            file_count=entry.get("file_count"),
            status=entry.get("status"),
        ))

    # ── dependencies + analysis_dependencies ──────────────────────────────────
    dep_summary = det.get("dependency_summary", {})
    outdated_packages = dep_summary.get("outdated_packages", [])
    unused_dep_names: set[str] = set(dep_summary.get("unused_dependencies", []))

    all_dep_names: set[str] = {pkg["name"] for pkg in outdated_packages if pkg.get("name")}
    all_dep_names.update(unused_dep_names)

    if all_dep_names:
        existing_result = await db.execute(
            select(Dependency).where(
                Dependency.name.in_(all_dep_names),
                Dependency.ecosystem.is_(None),
            )
        )
        dep_catalog: dict[str, Dependency] = {
            d.name: d for d in existing_result.scalars().all()
        }

        for name in all_dep_names:
            if name not in dep_catalog:
                dep = Dependency(ecosystem=None, name=name)
                db.add(dep)
                dep_catalog[name] = dep

        await db.flush()  # ensure new Dependency rows have IDs

        processed: set[str] = set()

        for pkg in outdated_packages:
            name = pkg.get("name", "")
            if not name or name in processed:
                continue
            processed.add(name)
            dep = dep_catalog.get(name)
            if dep:
                db.add(AnalysisDependency(
                    analysis_run_id=run.id,
                    dependency_id=dep.id,
                    current_version=pkg.get("current"),
                    # agent may emit "latest" or "recommended"
                    latest_version=pkg.get("latest") or pkg.get("recommended"),
                    is_outdated=True,
                    is_unused=name in unused_dep_names,
                ))

        for name in unused_dep_names:
            if name in processed:
                continue
            processed.add(name)
            dep = dep_catalog.get(name)
            if dep:
                db.add(AnalysisDependency(
                    analysis_run_id=run.id,
                    dependency_id=dep.id,
                    current_version=None,
                    latest_version=None,
                    is_outdated=False,
                    is_unused=True,
                ))

    repo.last_scanned_at = now
    await db.commit()
    return run
