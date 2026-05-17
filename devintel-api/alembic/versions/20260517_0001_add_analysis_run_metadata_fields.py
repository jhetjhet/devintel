"""add analysis run metadata fields

Revision ID: 20260517_0001
Revises:
Create Date: 2026-05-17 00:00:00

"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260517_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE analysis_runs ADD COLUMN IF NOT EXISTS duration_ms INTEGER")
    op.execute("ALTER TABLE analysis_runs ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ")
    op.execute("ALTER TABLE analysis_runs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ")
    op.execute("ALTER TABLE analysis_runs ADD COLUMN IF NOT EXISTS with_llm BOOLEAN")
    op.execute("ALTER TABLE analysis_runs ADD COLUMN IF NOT EXISTS metadata_snapshot JSONB")


def downgrade() -> None:
    op.execute("ALTER TABLE analysis_runs DROP COLUMN IF EXISTS metadata_snapshot")
    op.execute("ALTER TABLE analysis_runs DROP COLUMN IF EXISTS with_llm")
    op.execute("ALTER TABLE analysis_runs DROP COLUMN IF EXISTS completed_at")
    op.execute("ALTER TABLE analysis_runs DROP COLUMN IF EXISTS started_at")
    op.execute("ALTER TABLE analysis_runs DROP COLUMN IF EXISTS duration_ms")
