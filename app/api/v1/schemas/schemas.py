# --- SCHEMAS ---
from typing import Optional
from uuid import UUID

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


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    marital_status: Optional[str] = None
    price_range: Optional[str] = None
    gender: Optional[str] = None
    profile_photo: Optional[str] = None
    categories: list[UUID] = []


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    marital_status: Optional[str] = None
    price_range: Optional[str] = None
    gender: Optional[str] = None
    profile_photo: Optional[str] = None
    categories: Optional[list[UUID]] = None


class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    phone_number: Optional[str]
    address: Optional[str]
    age: Optional[int]
    marital_status: Optional[str]
    price_range: Optional[str]
    gender: Optional[str]
    profile_photo: Optional[str]
    categories: list[CategoryRead]

    class Config:
        from_attributes = True
