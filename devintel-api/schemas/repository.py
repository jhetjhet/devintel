from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    repo_url: str


class RepositoryResponse(BaseModel):
    id: str
    user_id: str | None = None
    repo_url: str
    provider: str | None = None
    owner_name: str | None = None
    repo_name: str | None = None
    first_seen_at: str | None = None
    latest_commit_hash: str | None = None
    last_scanned_at: str | None = None
    is_active: bool = True
    report_count: int = 0


class AuditRequest(BaseModel):
    repository_id: str
    force: bool = False


class AuditResponse(BaseModel):
    repository_id: str
    commit_hash: str
