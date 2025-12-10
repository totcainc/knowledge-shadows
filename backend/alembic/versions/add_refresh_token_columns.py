"""add refresh token to user

Revision ID: add_refresh_token
Revises: 967b1661767d
Create Date: 2024-12-10

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_refresh_token'
down_revision = '967b1661767d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add refresh token columns to users table
    op.add_column('users', sa.Column('refresh_token', sa.String(), nullable=True))
    op.add_column('users', sa.Column('refresh_token_expires_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove refresh token columns from users table
    op.drop_column('users', 'refresh_token_expires_at')
    op.drop_column('users', 'refresh_token')
