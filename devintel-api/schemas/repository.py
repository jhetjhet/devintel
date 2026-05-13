from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    repo_url: str


class RepositoryResponse(BaseModel):
    id: str
    repo_url: str
    provider: str | None = None
    owner_name: str | None = None
    repo_name: str | None = None
