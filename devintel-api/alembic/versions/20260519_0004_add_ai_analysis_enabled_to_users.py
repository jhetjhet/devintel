"""add ai_analysis_enabled to users

Revision ID: 20260519_0004
Revises: 20260519_0003
Create Date: 2026-05-19 00:30:00

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260519_0004"
down_revision: Union[str, None] = "20260519_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "ai_analysis_enabled",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "ai_analysis_enabled")
