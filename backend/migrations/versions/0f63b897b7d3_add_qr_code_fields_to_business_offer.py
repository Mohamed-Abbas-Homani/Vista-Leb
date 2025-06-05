"""Add QR code fields to business_offer

Revision ID: 0f63b897b7d3
Revises: 0001
Create Date: 2025-06-06 00:25:56.740544
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0f63b897b7d3'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('business_offer', sa.Column(
        'redemption_code', sa.String(), nullable=False, server_default=sa.text("uuid_generate_v4()::text")))
    op.create_unique_constraint(
        'uq_business_offer_redemption_code', 'business_offer', ['redemption_code']
    )

    op.add_column('business_offer', sa.Column(
        'qr_code_path', sa.String(), nullable=True
    ))


def downgrade():
    op.drop_column('business_offer', 'qr_code_path')
    op.drop_constraint('uq_business_offer_redemption_code', 'business_offer', type_='unique')
    op.drop_column('business_offer', 'redemption_code')
