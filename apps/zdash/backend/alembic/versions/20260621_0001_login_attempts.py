"""login_attempts

Revision ID: 20260621_0001
Revises: 7054888e2a84
Create Date: 2026-06-21 15:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260621_0001"
down_revision: Union[str, None] = "7054888e2a84"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(table_name: str) -> bool:
    return bool(sa.inspect(op.get_bind()).has_table(table_name))


def upgrade() -> None:
    if not _table_exists("login_attempts"):
        op.create_table(
            "login_attempts",
            sa.Column("username", sa.String(), primary_key=True, nullable=False),
            sa.Column("failure_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column(
                "window_started_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("(CURRENT_TIMESTAMP)"),
            ),
            sa.Column(
                "last_attempt_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("(CURRENT_TIMESTAMP)"),
            ),
        )


def downgrade() -> None:
    if _table_exists("login_attempts"):
        op.drop_table("login_attempts")
