from pydantic import BaseModel


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
