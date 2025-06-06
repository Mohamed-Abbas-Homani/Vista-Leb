"""Add Business photos

Revision ID: 0003
Revises: 0f63b897b7d3
Create Date: 2025-06-06 00:25:56.740544
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003'
down_revision = '0f63b897b7d3'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('business', sa.Column(
        'photos', sa.String(), nullable=True))

def downgrade():
    op.drop_column('business', 'photos')