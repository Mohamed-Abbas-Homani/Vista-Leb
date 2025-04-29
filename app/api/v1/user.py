from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from sqlalchemy import select

from app.model.model import User, Category
from app.core.db import db_dep
from .category import CategoryRead

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
    categories: List[UUID] = []


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
    categories: Optional[List[UUID]] = None


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
    categories: List[CategoryRead]

    class Config:
        from_attributes = True


# --- ROUTES ---
@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: db_dep):
    try:
        # Check for existing user
        existing = await db.execute(
            select(User).filter(
                (User.email == user.email) | (User.username == user.username)
            )
        )
        if existing.scalars().first():
            raise HTTPException(status_code=400, detail="Email or username already exists")

        # Validate categories
        categories = []
        if user.categories:
            for cat_id in user.categories:
                category = await db.execute(select(Category).filter(Category.id == cat_id))
                category = category.scalars().first()
                if not category:
                    raise HTTPException(status_code=404, detail=f"Category {cat_id} not found")
                categories.append(category)

        # Create user
        db_user = User(**user.model_dump(exclude={"categories"}))
        db_user.categories = categories

        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)

        return UserRead(
            id=db_user.id,
            email=db_user.email,
            username=db_user.username,
            phone_number=db_user.phone_number,
            address=db_user.address,
            age=db_user.age,
            marital_status=db_user.marital_status,
            price_range=db_user.price_range,
            gender=db_user.gender,
            profile_photo=db_user.profile_photo,
            categories=[
                CategoryRead(id=c.id, name=c.name, key=c.key)
                for c in db_user.categories
            ]
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[UserRead])
async def list_users(db: db_dep):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return [
        UserRead(
            id=user.id,
            email=user.email,
            username=user.username,
            phone_number=user.phone_number,
            address=user.address,
            age=user.age,
            marital_status=user.marital_status,
            price_range=user.price_range,
            gender=user.gender,
            profile_photo=user.profile_photo,
            categories=[
                CategoryRead(id=c.id, name=c.name, key=c.key)
                for c in user.categories
            ]
        )
        for user in users
    ]


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: UUID, db: db_dep):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserRead(
        id=user.id,
        email=user.email,
        username=user.username,
        phone_number=user.phone_number,
        address=user.address,
        age=user.age,
        marital_status=user.marital_status,
        price_range=user.price_range,
        gender=user.gender,
        profile_photo=user.profile_photo,
        categories=[
            CategoryRead(id=c.id, name=c.name, key=c.key)
            for c in user.categories
        ]
    )


@router.put("/{user_id}", response_model=UserRead)
async def update_user(user_id: UUID, update: UserUpdate, db: db_dep):
    try:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update basic fields
        update_data = update.model_dump(exclude={"categories"}, exclude_unset=True)
        for key, value in update_data.items():
            setattr(user, key, value)

        # Update categories if provided
        if update.categories is not None:
            categories = []
            for cat_id in update.categories:
                category = await db.execute(select(Category).filter(Category.id == cat_id))
                category = category.scalars().first()
                if not category:
                    raise HTTPException(status_code=404, detail=f"Category {cat_id} not found")
                categories.append(category)
            user.categories = categories

        await db.commit()
        await db.refresh(user)

        return UserRead(
            id=user.id,
            email=user.email,
            username=user.username,
            phone_number=user.phone_number,
            address=user.address,
            age=user.age,
            marital_status=user.marital_status,
            price_range=user.price_range,
            gender=user.gender,
            profile_photo=user.profile_photo,
            categories=[
                CategoryRead(id=c.id, name=c.name, key=c.key)
                for c in user.categories
            ]
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: UUID, db: db_dep):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return {"deleted": "success"}
