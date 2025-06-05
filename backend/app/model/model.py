from datetime import datetime, time
from enum import Enum
from typing import List, Optional
import uuid

from sqlalchemy import (
    UUID,
    Column,
    ForeignKey,
    String,
    Text,
    Time,
    Integer,
    Table,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.dialects.postgresql import UUID as PgUUID

from app.core.db import Base
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

# Association table for many-to-many relationship between User and Category
user_category = Table(
    "user_category",
    Base.metadata,
    Column("user_id", PgUUID, ForeignKey("user.id"), primary_key=True),
    Column("category_id", PgUUID, ForeignKey("category.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "user"

    id: Mapped[UUID] = mapped_column(
        PgUUID, primary_key=True, server_default=func.uuid_generate_v4()
    )
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String)
    address: Mapped[Optional[str]] = mapped_column(Text)
    profile_photo: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column()

    # Relationships
    business: Mapped[Optional["Business"]] = relationship(back_populates="user", lazy="joined")
    customer: Mapped[Optional["Customer"]] = relationship(back_populates="user", lazy="joined")
    categories: Mapped[List["Category"]] = relationship(
        secondary=user_category, back_populates="users", lazy="joined"
    )


class Business(Base):
    __tablename__ = "business"

    id: Mapped[UUID] = mapped_column(
        PgUUID, primary_key=True, server_default=func.uuid_generate_v4()
    )
    user_id: Mapped[UUID] = mapped_column(PgUUID, ForeignKey("user.id"))
    branch_name: Mapped[str] = mapped_column(String, nullable=False)
    hot_line: Mapped[Optional[str]] = mapped_column(String)
    address: Mapped[Optional[str]] = mapped_column(Text)
    targeted_gender: Mapped[Optional[str]]
    cover_photo: Mapped[Optional[str]] = mapped_column(Text)
    start_hour: Mapped[Optional[str]] 
    close_hour: Mapped[Optional[str]]
    opening_days: Mapped[Optional[str]] = mapped_column(Text)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="business")
    offers: Mapped[List["BusinessOffer"]] = relationship(back_populates="business")


class Customer(Base):
    __tablename__ = "customer"

    id: Mapped[UUID] = mapped_column(
        PgUUID, primary_key=True, server_default=func.uuid_generate_v4()
    )
    user_id: Mapped[UUID] = mapped_column(PgUUID, ForeignKey("user.id"))
    marital_status: Mapped[Optional[str]]
    age: Mapped[Optional[int]] = mapped_column(Integer)
    price_range: Mapped[Optional[str]]
    gender: Mapped[Optional[str]]

    # Relationships
    user: Mapped["User"] = relationship(back_populates="customer")


class Category(Base):
    __tablename__ = "category"

    id: Mapped[UUID] = mapped_column(
        PgUUID, primary_key=True, server_default=func.uuid_generate_v4()
    )
    key: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)

    # Relationships
    users: Mapped[List["User"]] = relationship(
        secondary=user_category, back_populates="categories"
    )


class BusinessOffer(Base):
    __tablename__ = "business_offer"

    id: Mapped[UUID] = mapped_column(
        PgUUID, primary_key=True, server_default=func.uuid_generate_v4()
    )
    business_id: Mapped[UUID] = mapped_column(PgUUID, ForeignKey("business.id"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    start_date: Mapped[datetime] = mapped_column(nullable=False)
    end_date: Mapped[datetime] = mapped_column(nullable=False)
    photo: Mapped[Optional[str]] = mapped_column(Text)

    redemption_code: Mapped[str] = mapped_column(String, default=lambda: uuid.uuid4().hex, unique=True)
    qr_code_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Relationships
    business: Mapped["Business"] = relationship(back_populates="offers")