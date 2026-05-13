from datetime import datetime

from pydantic import BaseModel

from .report import (
    RadarMetricOut,
    ArchitecturalRecommendationOut,
    RefactorSuggestionOut,
    QuickWinOut,
    SecurityVulnerabilityOut,
    RiskyEntityOut,
    FileHealthEntryOut,
    AnalysisDependencyOut,
)


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
