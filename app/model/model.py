from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    DateTime,
    ForeignKey,
    Table,
    UniqueConstraint,
    Time,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

# Association tables for many-to-many relationships
user_category = Table(
    "user_category",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("user.id"), primary_key=True),
    Column(
        "category_id", UUID(as_uuid=True), ForeignKey("category.id"), primary_key=True
    ),
)

business_category = Table(
    "business_category",
    Base.metadata,
    Column(
        "business_id", UUID(as_uuid=True), ForeignKey("business.id"), primary_key=True
    ),
    Column(
        "category_id", UUID(as_uuid=True), ForeignKey("category.id"), primary_key=True
    ),
)


class User(Base):
    __tablename__ = "user"
    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default="uuid_generate_v4()"
    )
    email = Column(String, nullable=False, unique=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    phone_number = Column(String)
    address = Column(Text)
    age = Column(Integer)
    marital_status = Column(String)
    price_range = Column(String)
    gender = Column(String)
    profile_photo = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    deleted_at = Column(DateTime(timezone=True))

    # Relationship with categories
    categories = relationship(
        "Category", secondary=user_category, back_populates="users"
    )

    __table_args__ = (
        UniqueConstraint("email", name="unique_user_email"),
        UniqueConstraint("username", name="unique_user_username"),
    )


class Business(Base):
    __tablename__ = "business"
    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default="uuid_generate_v4()"
    )
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    branch_name = Column(String, nullable=False)
    phone_number = Column(String)
    hot_line = Column(String)
    address = Column(Text)
    targeted_gender = Column(String)
    cover_photo = Column(Text)
    profile_photo = Column(Text)
    start_hour = Column(Time)
    close_hour = Column(Time)
    opening_days = Column(Text)

    # Relationship with categories
    categories = relationship(
        "Category", secondary=business_category, back_populates="businesses"
    )
    offers = relationship("BusinessOffer", back_populates="business")
    __table_args__ = (UniqueConstraint("email", name="unique_business_email"),)


class Category(Base):
    __tablename__ = "category"
    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default="uuid_generate_v4()"
    )
    key = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    business_id = Column(
        UUID(as_uuid=True),
        ForeignKey("business.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    users = relationship("User", secondary=user_category, back_populates="categories")
    businesses = relationship(
        "Business", secondary=business_category, back_populates="categories"
    )

    __table_args__ = (UniqueConstraint("key", name="unique_category_key"),)


class BusinessOffer(Base):
    __tablename__ = "business_offer"
    id = Column(
        UUID(as_uuid=True), primary_key=True, server_default="uuid_generate_v4()"
    )
    business_id = Column(
        UUID(as_uuid=True),
        ForeignKey("business.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String, nullable=False)
    description = Column(Text)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    photo = Column(Text)

    # Relationship with business
    business = relationship("Business", back_populates="offers")

    __table_args__ = (
        UniqueConstraint("business_id", "name", name="unique_business_offer_name"),
    )
