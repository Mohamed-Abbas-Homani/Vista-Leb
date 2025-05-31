import uuid
from fastapi import APIRouter, HTTPException, status, Query, Form
from sqlalchemy import select

from app.model.model import Business, Customer, User, Category
from app.core.db import db_dep
from .category import CategoryRead
from .dependencies import auth_dep, current_user_dep
from .schemas.schemas import BusinessRead, CustomerRead, UserCreate, UserRead, UserUpdate
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
async def upload_photo(
    user: current_user_dep,
    db: db_dep,
    file: UploadFile = File(...),
    photo_type: str = Form(...)  # 'avatar' or 'cover'
):
    # Validate photo type
    if photo_type not in ["avatar", "cover"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid photo type. Must be 'avatar' or 'cover'"
        )

    # Fetch user
    result = await db.execute(select(User).filter(User.id == user["id"]))
    user_obj = result.scalars().first()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")

    # Create upload directory
    upload_dir = Path("uploads") / str(user["id"])
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{photo_type}_{uuid.uuid4().hex}.{file_ext}"
    file_path = upload_dir / unique_filename

    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Update user's photo field
    relative_path = f"/uploads/{user['id']}/{unique_filename}"
    
    if photo_type == "avatar":
        user_obj.profile_photo = relative_path
    else:
        user_obj.business.cover_photo = relative_path

    await db.commit()
    await db.refresh(user_obj)

    return {
        "message": f"{photo_type.capitalize()} photo updated successfully",
        "file_path": relative_path,
        "type": photo_type
    }

@router.put("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: UUID,
    updated_data: UserUpdate,
    is_business: bool,
    db: db_dep
):
    try:
        db_user = await db.get(User, user_id)
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Handle category updates
        categories = []
        if updated_data.categories:
            for cat_id in updated_data.categories:
                result = await db.execute(select(Category).filter(Category.id == cat_id))
                category = result.scalars().first()
                if not category:
                    raise HTTPException(status_code=404, detail=f"Category {cat_id} not found")
                categories.append(category)

        # Update base user fields
        for field in updated_data.model_fields_set - {"categories", "password", "business", "customer", "profile_photo"}:
            setattr(db_user, field, getattr(updated_data, field))

        # Update nested Business or Customer
        if is_business and updated_data.business:
            if db_user.business:
                for field, value in updated_data.business.model_dump().items():
                    setattr(db_user.business, field, value)
            else:
                db_user.business = Business(**updated_data.business.model_dump())
        elif not is_business and updated_data.customer:
            if db_user.customer:
                for field, value in updated_data.customer.model_dump().items():
                    setattr(db_user.customer, field, value)
            else:
                db_user.customer = Customer(**updated_data.customer.model_dump())

        db_user.categories = categories

        await db.commit()
        await db.refresh(db_user)

        # Manual mapping of nested objects
        business_data = None
        if db_user.business:
            business_data = BusinessRead(
                branch_name=db_user.business.branch_name,
                hot_line=db_user.business.hot_line,
                targeted_gender=db_user.business.targeted_gender,
                cover_photo=db_user.business.cover_photo,
                start_hour=db_user.business.start_hour,
                close_hour=db_user.business.close_hour,
                opening_days=db_user.business.opening_days
            )

        customer_data = None
        if db_user.customer:
            customer_data = CustomerRead(
                age=db_user.customer.age,
                marital_status=db_user.customer.marital_status,
                price_range=db_user.customer.price_range,
                gender=db_user.customer.gender
            )

        return UserRead(
            id=db_user.id,
            email=db_user.email,
            username=db_user.username,
            phone_number=db_user.phone_number,
            address=db_user.address,
            profile_photo=db_user.profile_photo,
            categories=[
                CategoryRead(id=c.id, name=c.name, key=c.key)
                for c in db_user.categories
            ],
            business=business_data,
            customer=customer_data
        )

    except Exception as e:
        print("Update Error:", e)
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


