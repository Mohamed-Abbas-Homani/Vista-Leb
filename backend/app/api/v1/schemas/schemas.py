# --- SCHEMAS ---
from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr


class CategoryCreate(BaseModel):
    key: str
    name: str


class CategoryRead(BaseModel):
    id: UUID
    key: str
    name: str

    class Config:
        from_attributes = True


class BusinessCreate(BaseModel):
    branch_name: str
    hot_line: Optional[str] = None
    targeted_gender: Optional[str] = None
    start_hour: Optional[str] = None
    close_hour: Optional[str] = None
    opening_days: Optional[str] = None

    class Config:
        from_attributes=True

class CustomerCreate(BaseModel):
    age: Optional[int] = None
    marital_status: Optional[str] = None
    price_range: Optional[str] = None
    gender: Optional[str] = None
    class Config:
        from_attributes=True
class UserCreate(BaseModel):
    password: str
    phone_number: Optional[str] = None
    username: str
    categories: list[UUID] = []
    email: EmailStr
    business: Optional[BusinessCreate] = None
    customer: Optional[CustomerCreate] = None
    address: Optional[str] = None

class UserUpdate(BaseModel):
    phone_number: Optional[str] = None
    username: str
    categories: list[UUID] = []
    email: EmailStr
    business: Optional[BusinessCreate] = None
    customer: Optional[CustomerCreate] = None
    address: Optional[str] = None
    class Config:
        from_attributes = True

class BusinessRead(BaseModel):
    branch_name: str
    hot_line: Optional[str] = None
    targeted_gender: Optional[str] = None
    cover_photo: Optional[str] = None
    start_hour: Optional[str] = None
    close_hour: Optional[str] = None
    opening_days: Optional[str] = None

    class Config:
        from_attributes = True


class CustomerRead(BaseModel):
    age: Optional[int] = None
    marital_status: Optional[str] = None
    price_range: Optional[str] = None
    gender: Optional[str] = None

    class Config:
        from_attributes = True


class UserRead(BaseModel):
    id: UUID
    email: str
    username: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    profile_photo: Optional[str] = None
    categories: list[CategoryRead]
    business: Optional[BusinessRead] = None
    customer: Optional[CustomerRead] = None

    class Config:
        from_attributes = True