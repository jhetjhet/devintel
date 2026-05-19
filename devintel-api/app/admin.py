from __future__ import annotations

from typing import Type

from fastapi import FastAPI
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse

from app.config import settings
from app.database import engine
from app.models import (
    AnalysisDependency,
    AnalysisRun,
    ArchitecturalRecommendation,
    Dependency,
    FileHealthEntry,
    QuickWin,
    RadarMetric,
    RefactorSuggestion,
    Repository,
    RiskyEntity,
    SecurityVulnerability,
    User,
)


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = str(form.get("username", "")).strip()
        password = str(form.get("password", ""))

        if (
            settings.ADMIN_USERNAME is None
            or settings.ADMIN_PASSWORD is None
            or username != settings.ADMIN_USERNAME
            or password != settings.ADMIN_PASSWORD
        ):
            return False

        request.session.update({"admin_authenticated": True, "admin_username": username})
        return True

    async def logout(self, request: Request) -> bool | RedirectResponse:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool | RedirectResponse:
        if request.session.get("admin_authenticated") is True:
            return True
        return False


class ReadOnlyModelView(ModelView):
    can_create = False
    can_edit = False
    can_delete = False
    can_view_details = True
    page_size = 50


class UserAdmin(ReadOnlyModelView, model=User):
    can_edit = True
    can_create = False
    can_delete = False

    form_edit_rules = [
        'ai_analysis_enabled',  # editable
    ]
    
    column_list = [User.id, User.full_name, User.email, User.provider, User.ai_analysis_enabled, User.created_at, User.last_login_at]


class RepositoryAdmin(ReadOnlyModelView, model=Repository):
    column_list = [Repository.id, Repository.user_id, Repository.repo_url, Repository.owner_name, Repository.repo_name, Repository.latest_commit_hash, Repository.last_scanned_at, Repository.is_active]


class AnalysisRunAdmin(ReadOnlyModelView, model=AnalysisRun):
    column_list = [AnalysisRun.id, AnalysisRun.user_id, AnalysisRun.repository_id, AnalysisRun.job_id, AnalysisRun.commit_hash, AnalysisRun.overall_score, AnalysisRun.technical_debt_score, AnalysisRun.confidence, AnalysisRun.with_llm, AnalysisRun.created_at, AnalysisRun.completed_at]


class RadarMetricAdmin(ReadOnlyModelView, model=RadarMetric):
    column_list = [RadarMetric.id, RadarMetric.analysis_run_id, RadarMetric.subject, RadarMetric.score, RadarMetric.max]


class ArchitecturalRecommendationAdmin(ReadOnlyModelView, model=ArchitecturalRecommendation):
    column_list = [ArchitecturalRecommendation.id, ArchitecturalRecommendation.analysis_run_id, ArchitecturalRecommendation.rank, ArchitecturalRecommendation.recommendation]


class RefactorSuggestionAdmin(ReadOnlyModelView, model=RefactorSuggestion):
    column_list = [RefactorSuggestion.id, RefactorSuggestion.analysis_run_id, RefactorSuggestion.title, RefactorSuggestion.file_path, RefactorSuggestion.severity, RefactorSuggestion.confidence]


class QuickWinAdmin(ReadOnlyModelView, model=QuickWin):
    column_list = [QuickWin.id, QuickWin.analysis_run_id, QuickWin.title, QuickWin.impact, QuickWin.type]


class SecurityVulnerabilityAdmin(ReadOnlyModelView, model=SecurityVulnerability):
    column_list = [SecurityVulnerability.id, SecurityVulnerability.analysis_run_id, SecurityVulnerability.title, SecurityVulnerability.severity, SecurityVulnerability.file_path, SecurityVulnerability.line_number]


class RiskyEntityAdmin(ReadOnlyModelView, model=RiskyEntity):
    column_list = [RiskyEntity.id, RiskyEntity.analysis_run_id, RiskyEntity.rank, RiskyEntity.name, RiskyEntity.file_path, RiskyEntity.pain_score]


class FileHealthEntryAdmin(ReadOnlyModelView, model=FileHealthEntry):
    column_list = [FileHealthEntry.id, FileHealthEntry.analysis_run_id, FileHealthEntry.path, FileHealthEntry.health_score, FileHealthEntry.file_count, FileHealthEntry.status]


class DependencyAdmin(ReadOnlyModelView, model=Dependency):
    column_list = [Dependency.id, Dependency.ecosystem, Dependency.name]


class AnalysisDependencyAdmin(ReadOnlyModelView, model=AnalysisDependency):
    column_list = [AnalysisDependency.id, AnalysisDependency.analysis_run_id, AnalysisDependency.dependency_id, AnalysisDependency.current_version, AnalysisDependency.latest_version, AnalysisDependency.is_outdated, AnalysisDependency.is_unused]


def setup_admin(app: FastAPI) -> Admin | None:
    if not (settings.ADMIN_USERNAME and settings.ADMIN_PASSWORD and settings.ADMIN_SECRET_KEY):
        return None

    authentication_backend = AdminAuth(secret_key=settings.ADMIN_SECRET_KEY)
    admin = Admin(app=app, engine=engine, authentication_backend=authentication_backend, base_url="/admin")

    admin.add_view(UserAdmin)
    admin.add_view(RepositoryAdmin)
    admin.add_view(AnalysisRunAdmin)
    admin.add_view(RadarMetricAdmin)
    admin.add_view(ArchitecturalRecommendationAdmin)
    admin.add_view(RefactorSuggestionAdmin)
    admin.add_view(QuickWinAdmin)
    admin.add_view(SecurityVulnerabilityAdmin)
    admin.add_view(RiskyEntityAdmin)
    admin.add_view(FileHealthEntryAdmin)
    admin.add_view(DependencyAdmin)
    admin.add_view(AnalysisDependencyAdmin)

    return admin