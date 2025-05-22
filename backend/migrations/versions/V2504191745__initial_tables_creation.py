"""create initial tables

Revision ID: 0001
Revises:
Create Date: 2025-04-19 17:45:00
"""

from alembic import op

# Revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Enable uuid-ossp extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    # User table
    op.execute("""
        CREATE TABLE "user" (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR NOT NULL UNIQUE,
            username VARCHAR NOT NULL UNIQUE,
            password VARCHAR NOT NULL,
            phone_number VARCHAR,
            address TEXT,
            profile_photo TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        );
    """)

    # Business table
    op.execute("""
        CREATE TABLE business (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES "user" (id),
            branch_name VARCHAR NOT NULL,
            hot_line VARCHAR,
            address TEXT,
            targeted_gender VARCHAR,
            cover_photo TEXT,
            start_hour TEXT,
            close_hour TEXT,
            opening_days TEXT
        );
    """)

    # Customer table
    op.execute("""
        CREATE TABLE customer (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES "user" (id),
            marital_status VARCHAR,
            age INTEGER,
            price_range VARCHAR,
            gender VARCHAR
        );
    """)

    # Category table
    op.execute("""
        CREATE TABLE category (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            key VARCHAR NOT NULL UNIQUE,
            name VARCHAR NOT NULL
        );
    """)

    # User-Category relationship
    op.execute("""
        CREATE TABLE user_category (
            user_id UUID NOT NULL,
            category_id UUID NOT NULL,
            PRIMARY KEY (user_id, category_id),
            FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
        );
    """)

    # Business Offer table
    op.execute("""
        CREATE TABLE business_offer (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            business_id UUID NOT NULL,
            name VARCHAR NOT NULL,
            description TEXT,
            start_date TIMESTAMPTZ NOT NULL,
            end_date TIMESTAMPTZ NOT NULL,
            photo TEXT,
            FOREIGN KEY (business_id) REFERENCES business(id) ON DELETE CASCADE
        );
    """)


def downgrade():
    op.execute("DROP TABLE IF EXISTS business_offer;")
    op.execute("DROP TABLE IF EXISTS user_category;")
    op.execute("DROP TABLE IF EXISTS category;")
    op.execute("DROP TABLE IF EXISTS business;")
    op.execute("DROP TABLE IF EXISTS customer;")
    op.execute('DROP TABLE IF EXISTS "user";')
    op.execute('DROP EXTENSION IF EXISTS "uuid-ossp";')
