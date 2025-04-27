from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from sqlalchemy import select

from app.model.model import User
from app.core.db import db_dep

router = APIRouter(prefix="/users", tags=["Users"])


# --- SCHEMAS ---
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

    class Config:
        from_attributes = True


# --- ROUTES ---
@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: db_dep):
    result = await db.execute(
        select(User).filter(
            (User.email == user.email) | (User.username == user.username)
        )
    )
    db_user = result.scalars().first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email or username already exists")
    new_user = User(**user.dict())
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.get("/", response_model=List[UserRead])
async def list_users(db: db_dep):
    result = await db.execute(select(User))
    return result.scalars().all()


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: UUID, db: db_dep):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserRead)
async def update_user(user_id: UUID, update: UserUpdate, db: db_dep):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in update.dict(exclude_unset=True).items():
        setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: UUID, db: db_dep):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return {"deleted": "success"}
