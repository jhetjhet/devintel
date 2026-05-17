import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Repository(Base):
    __tablename__ = "repositories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    repo_url: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    provider: Mapped[str | None] = mapped_column(String, nullable=True)
    owner_name: Mapped[str | None] = mapped_column(String, nullable=True)
    repo_name: Mapped[str | None] = mapped_column(String, nullable=True)
    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    latest_commit_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    last_scanned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    repository_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("repositories.id"), nullable=True
    )
    job_id: Mapped[str] = mapped_column(String, nullable=False)

    # deterministic_report.repository_summary
    commit_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    branch: Mapped[str | None] = mapped_column(String, nullable=True)
    repo_name: Mapped[str | None] = mapped_column(String, nullable=True)
    languages: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    frameworks: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    file_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    detected_pattern: Mapped[str | None] = mapped_column(String, nullable=True)

    # llm_insights scalars
    overall_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    technical_debt_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    overall_verdict: Mapped[str | None] = mapped_column(String, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    growth_pts: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ai_reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)

    # deterministic_report.finding_summary
    total_findings: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_smells: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # deterministic_report.security_audit counts
    security_critical_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    security_high_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    security_medium_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    security_low_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    with_llm: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    metadata_snapshot: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    scanned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # Raw snapshot — source of truth for all normalised child data
    full_audit_report: Mapped[dict | None] = mapped_column(JSONB, nullable=True)


class RadarMetric(Base):
    __tablename__ = "radar_metrics"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analysis_runs.id"), nullable=False
    )
    subject: Mapped[str] = mapped_column(String, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    max: Mapped[int] = mapped_column(Integer, nullable=False, default=100)


class ArchitecturalRecommendation(Base):
    __tablename__ = "architectural_recommendations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analysis_runs.id"), nullable=False
    )
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)


class RefactorSuggestion(Base):
    __tablename__ = "refactor_suggestions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analysis_runs.id"), nullable=False
    )
    suggestion_id: Mapped[str | None] = mapped_column(String, nullable=True)
    title: Mapped[str | None] = mapped_column(String, nullable=True)

    # RefactorSource
    file_path: Mapped[str | None] = mapped_column(String, nullable=True)
    start_line: Mapped[int | None] = mapped_column(Integer, nullable=True)
    end_line: Mapped[int | None] = mapped_column(Integer, nullable=True)
    commit_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    symbol: Mapped[str | None] = mapped_column(String, nullable=True)

    # RefactorAnalysis
    rule: Mapped[str | None] = mapped_column(String, nullable=True)
    detected_by: Mapped[str | None] = mapped_column(String, nullable=True)
    severity: Mapped[str | None] = mapped_column(String, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    before_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    after_code: Mapped[str | None] = mapped_column(Text, nullable=True)

    llm_provider: Mapped[str | None] = mapped_column(String, nullable=True)
    llm_model: Mapped[str | None] = mapped_column(String, nullable=True)
    prompt_version: Mapped[str | None] = mapped_column(String, nullable=True)

    # "metadata" is a reserved SQLAlchemy attribute name; map to DB column "metadata"
    extra: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)


class QuickWin(Base):
    __tablename__ = "quick_wins"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analysis_runs.id"), nullable=False
    )
    win_id: Mapped[str | None] = mapped_column(String, nullable=True)
    title: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    impact: Mapped[str | None] = mapped_column(String, nullable=True)
    type: Mapped[str | None] = mapped_column(String, nullable=True)
    extra: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)


class SecurityVulnerability(Base):
    __tablename__ = "security_vulnerabilities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analysis_runs.id"), nullable=False
    )
    vulnerability_id: Mapped[str | None] = mapped_column(String, nullable=True)
    severity: Mapped[str | None] = mapped_column(String, nullable=True)
    title: Mapped[str | None] = mapped_column(String, nullable=True)

    location: Mapped[str | None] = mapped_column(String, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String, nullable=True)
    line_number: Mapped[int | None] = mapped_column(Integer, nullable=True)

    cve: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    remediation: Mapped[str | None] = mapped_column(Text, nullable=True)

    extra: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)


class RiskyEntity(Base):
    __tablename__ = "risky_entities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analysis_runs.id"), nullable=False
    )
    rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    entity_id: Mapped[str | None] = mapped_column(String, nullable=True)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String, nullable=True)
    pain_score: Mapped[float | None] = mapped_column(Float, nullable=True)


class FileHealthEntry(Base):
    __tablename__ = "file_health_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analysis_runs.id"), nullable=False
    )
    path: Mapped[str | None] = mapped_column(String, nullable=True)
    health_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    file_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str | None] = mapped_column(String, nullable=True)


class Dependency(Base):
    __tablename__ = "dependencies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    ecosystem: Mapped[str | None] = mapped_column(String, nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=False, index=True)


class AnalysisDependency(Base):
    __tablename__ = "analysis_dependencies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("analysis_runs.id"), nullable=False
    )
    dependency_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("dependencies.id"), nullable=False
    )
    current_version: Mapped[str | None] = mapped_column(String, nullable=True)
    latest_version: Mapped[str | None] = mapped_column(String, nullable=True)
    is_outdated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_unused: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
