from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    repo_url: str


class RepositoryResponse(BaseModel):
    id: str
    repo_url: str
    provider: str | None = None
    owner_name: str | None = None
    repo_name: str | None = None
    user_id: str | None = None


class AuditRequest(BaseModel):
    repository_id: str
    force: bool = False


class AuditResponse(BaseModel):
    repository_id: str
    commit_hash: str
