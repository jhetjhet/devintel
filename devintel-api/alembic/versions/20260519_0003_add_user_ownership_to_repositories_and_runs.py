"""add user ownership to repositories and analysis runs

Revision ID: 20260519_0003
Revises: 20260517_0002
Create Date: 2026-05-19 00:15:00

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260519_0003"
down_revision: Union[str, None] = "20260517_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE repositories ADD COLUMN IF NOT EXISTS user_id UUID")
    op.execute("ALTER TABLE analysis_runs ADD COLUMN IF NOT EXISTS user_id UUID")

    op.execute(
        "ALTER TABLE repositories "
        "ADD CONSTRAINT fk_repositories_user_id_users "
        "FOREIGN KEY (user_id) REFERENCES users (id)"
    )
    op.execute(
        "ALTER TABLE analysis_runs "
        "ADD CONSTRAINT fk_analysis_runs_user_id_users "
        "FOREIGN KEY (user_id) REFERENCES users (id)"
    )

    op.execute("DROP INDEX IF EXISTS ix_repositories_repo_url")
    op.execute("ALTER TABLE repositories DROP CONSTRAINT IF EXISTS repositories_repo_url_key")

    op.execute("CREATE INDEX IF NOT EXISTS ix_repositories_user_id ON repositories (user_id)")
    op.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_repositories_user_repo_url "
        "ON repositories (user_id, repo_url)"
    )

    op.execute("CREATE INDEX IF NOT EXISTS ix_analysis_runs_user_id ON analysis_runs (user_id)")
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_analysis_runs_user_repository "
        "ON analysis_runs (user_id, repository_id)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_analysis_runs_user_repository")
    op.execute("DROP INDEX IF EXISTS ix_analysis_runs_user_id")
    op.execute("DROP INDEX IF EXISTS uq_repositories_user_repo_url")
    op.execute("DROP INDEX IF EXISTS ix_repositories_user_id")

    op.execute(
        "ALTER TABLE analysis_runs DROP CONSTRAINT IF EXISTS fk_analysis_runs_user_id_users"
    )
    op.execute(
        "ALTER TABLE repositories DROP CONSTRAINT IF EXISTS fk_repositories_user_id_users"
    )

    op.execute("ALTER TABLE analysis_runs DROP COLUMN IF EXISTS user_id")
    op.execute("ALTER TABLE repositories DROP COLUMN IF EXISTS user_id")

    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_repositories_repo_url ON repositories (repo_url)")