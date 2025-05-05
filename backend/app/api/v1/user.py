from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.model.model import User, Category
from app.core.db import db_dep
from .category import CategoryRead
from .dependencies import auth_dep, current_user_dep
from .schemas.schemas import UserRead, UserUpdate
from ...core.security import get_password_hash
from fastapi import UploadFile, File
from uuid import UUID
from pathlib import Path

router = APIRouter(prefix="/users", tags=["Users"], dependencies=[auth_dep])


@router.get("", response_model=list[UserRead])
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
                CategoryRead(id=c.id, name=c.name, key=c.key) for c in user.categories
            ],
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
            CategoryRead(id=c.id, name=c.name, key=c.key) for c in user.categories
        ],
    )


@router.put("/{user_id}", response_model=UserRead)
async def update_user(user_id: UUID, update: UserUpdate, db: db_dep):
    try:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Prepare updated fields (excluding categories and password initially)
        update_data = update.model_dump(
            exclude={"categories", "password"}, exclude_unset=True
        )

        for key, value in update_data.items():
            setattr(user, key, value)

        # Hash password if provided
        if update.password:
            user.password = get_password_hash(update.password)

        # Update categories if provided
        if update.categories is not None:
            categories = []
            for cat_id in update.categories:
                category = await db.execute(
                    select(Category).filter(Category.id == cat_id)
                )
                category = category.scalars().first()
                if not category:
                    raise HTTPException(
                        status_code=404, detail=f"Category {cat_id} not found"
                    )
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
                CategoryRead(id=c.id, name=c.name, key=c.key) for c in user.categories
            ],
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


@router.post("/upload-photo", status_code=status.HTTP_200_OK)
async def upload_profile_picture(
    user: current_user_dep, db: db_dep, file: UploadFile = File(...)
):
    # Check if user exists
    user_id = user["id"]
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create upload folder if it doesn't exist
    upload_dir = Path("uploads") / str(user_id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Save file
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Update user's profile_photo
    relative_path = f"/uploads/{user_id}/{file.filename}"
    user.profile_photo = relative_path
    await db.commit()
    await db.refresh(user)

    return {"filename": file.filename, "profile_photo": relative_path}
