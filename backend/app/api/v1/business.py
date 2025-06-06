from uuid import UUID
from fastapi import APIRouter, status
from typing import List, Optional
from pydantic import BaseModel, EmailStr

from app.model.model import Business, Category, User
from app.core.db import db_dep
from sqlalchemy.orm import selectinload
from datetime import time
from .category import (
    CategoryRead,
)  # Assuming you have CategoryRead schema in category.py
from .dependencies import auth_dep

router = APIRouter(prefix="/businesses", tags=["Businesses"])


# --- SCHEMAS ---
class BusinessCreate(BaseModel):
    email: EmailStr
    password: str
    branch_name: str
    phone_number: Optional[str] = None
    hot_line: Optional[str] = None
    address: Optional[str] = None
    targeted_gender: Optional[str] = None
    cover_photo: Optional[str] = None
    profile_photo: Optional[str] = None
    start_hour: Optional[str] = None
    close_hour: Optional[str] = None
    opening_days: Optional[str] = None
    categories: List[UUID]


class BusinessUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    branch_name: Optional[str] = None
    phone_number: Optional[str] = None
    hot_line: Optional[str] = None
    address: Optional[str] = None
    targeted_gender: Optional[str] = None
    cover_photo: Optional[str] = None
    profile_photo: Optional[str] = None
    start_hour: Optional[time] = None
    close_hour: Optional[time] = None
    opening_days: Optional[str] = None
    categories: List[UUID]


class BusinessRead(BaseModel):
    id: UUID
    email: EmailStr
    branch_name: str
    phone_number: Optional[str]
    hot_line: Optional[str]
    address: Optional[str]
    targeted_gender: Optional[str]
    cover_photo: Optional[str]
    profile_photo: Optional[str]
    start_hour: Optional[str]
    close_hour: Optional[str]
    opening_days: Optional[str]
    categories: List[UUID]
    photos: Optional[str]

    class Config:
        from_attributes = True


# --- ROUTES ---


@router.post("/", response_model=BusinessRead, status_code=status.HTTP_201_CREATED)
async def create_business(business: BusinessCreate, db: db_dep):
    try:
        # Ensure categories are valid
        if business.categories:
            categories = []
            for cat_id in business.categories:
                # Check if category exists in the DB
                category = await db.execute(
                    select(Category).filter(Category.id == cat_id)
                )
                category = category.scalars().first()
                if not category:
                    raise HTTPException(
                        status_code=404, detail=f"Category {cat_id} not found."
                    )
                categories.append(category)
        else:
            raise HTTPException(status_code=400, detail="Categories are required.")

        # Create the business without categories initially
        db_business = Business(
            **business.model_dump(exclude={"categories"}),
        )

        db.add(db_business)
        await db.commit()
        await db.refresh(db_business)

        # Now assign categories to the business after it is created
        db_business.categories = categories
        await db.merge(db_business)
        await db.commit()  # Assign categories after the business is created

        # Create the response
        return BusinessRead(
            id=db_business.id,
            email=db_business.email,
            branch_name=db_business.branch_name,
            phone_number=db_business.phone_number,
            hot_line=db_business.hot_line,
            address=db_business.address,
            targeted_gender=db_business.targeted_gender,
            cover_photo=db_business.cover_photo,
            photos=db_business.photos,
            profile_photo=db_business.profile_photo,
            start_hour=db_business.start_hour.strftime("%H:%M:%S")
            if db_business.start_hour
            else None,
            close_hour=db_business.close_hour.strftime("%H:%M:%S")
            if db_business.close_hour
            else None,
            opening_days=db_business.opening_days,
            categories=[
                CategoryRead(
                    id=cat.id,
                    key=cat.key,
                    name=cat.name,
                )
                for cat in db_business.categories
            ],
        )

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[BusinessRead], dependencies=[])
async def list_businesses(db: db_dep):
    # Step 1: Fetch businesses
    result = await db.execute(select(Business))
    businesses = result.scalars().all()

    # Step 2: Fetch user_id → categories for each business
    response = []
    for b in businesses:
        # Fetch categories for this business's user
        cat_result = await db.execute(
            select(Category).join(User.categories).where(User.id == b.user_id)
        )
        categories = cat_result.scalars().all()

        user = await db.execute(select(User).filter(User.id == b.user_id))
        user = user.scalars().first()

        # Build the response
        response.append(
            BusinessRead(
                id=b.id,
                email=user.email if user else None,
                branch_name=b.branch_name,
                phone_number=user.phone_number if user else None,
                hot_line=b.hot_line,
                address=b.address,
                targeted_gender=b.targeted_gender,
                cover_photo=b.cover_photo,
                photos=b.photos,
                profile_photo=user.profile_photo if user else None,
                start_hour=b.start_hour if b.start_hour else None,
                close_hour=b.close_hour if b.close_hour else None,
                opening_days=b.opening_days,
                categories=[
                    CategoryRead(id=c.id, key=c.key, name=c.name) for c in categories
                ],
            )
        )

    return response


@router.get("/{business_id}", response_model=BusinessRead)
async def get_business_by_id(business_id: UUID, db: db_dep):
    try:
        result = await db.execute(select(Business).filter(Business.id == business_id))
        db_business = result.scalars().first()

        if not db_business:
            raise HTTPException(status_code=404, detail="Business not found")

        # get user_id
        user_id = db_business.user_id
        fetch_user = await db.execute(select(User).filter(User.id == user_id))
        user = fetch_user.scalars().first()

        # Fetch categories for this user
        cat_result = await db.execute(
            select(Category).join(User.categories).where(User.id == user_id)
        )

        return BusinessRead(
            id=db_business.id,
            email=user.email if user else None,
            branch_name=db_business.branch_name,
            phone_number=user.phone_number if user else None,
            hot_line=db_business.hot_line,
            address=db_business.address,
            targeted_gender=db_business.targeted_gender,
            cover_photo=db_business.cover_photo,
            photos=db_business.photos,
            profile_photo=user.profile_photo if user else None,
            start_hour=db_business.start_hour if db_business.start_hour else None,
            close_hour=db_business.close_hour if db_business.close_hour else None,
            opening_days=db_business.opening_days,
            categories=[
                CategoryRead(id=c.id, key=c.key, name=c.name)
                for c in cat_result.scalars().all()
            ],
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


from fastapi import HTTPException, status
from sqlalchemy.future import select


@router.put("/{business_id}", response_model=BusinessRead)
async def update_business(business_id: UUID, update: BusinessUpdate, db: db_dep):
    try:
        # Fetch the business object by its ID
        result = await db.execute(select(Business).filter(Business.id == business_id))
        business = result.scalars().first()

        if not business:
            raise HTTPException(status_code=404, detail="Business not found")

        # Get update data excluding categories (we'll handle them separately)
        update_data = update.model_dump(exclude={"categories"}, exclude_unset=True)

        # Update the business with the new values
        for key, value in update_data.items():
            setattr(business, key, value)

        # Handle categories if provided
        if hasattr(update, "categories") and update.categories is not None:
            categories = []
            for cat_id in update.categories:
                # Check if the category exists in the DB
                category = await db.execute(
                    select(Category).filter(Category.id == cat_id)
                )
                category = category.scalars().first()
                if not category:
                    raise HTTPException(
                        status_code=404, detail=f"Category {cat_id} not found."
                    )
                categories.append(category)

            # Assign the valid categories to the business
            business.categories = categories

        # Commit changes to the database and refresh the business object
        await db.commit()
        await db.refresh(business)

        # Return the updated business object
        return BusinessRead(
            id=business.id,
            email=business.email,
            branch_name=business.branch_name,
            phone_number=business.phone_number,
            hot_line=business.hot_line,
            address=business.address,
            targeted_gender=business.targeted_gender,
            cover_photo=business.cover_photo,
            profile_photo=business.profile_photo,
            start_hour=business.start_hour.strftime("%H:%M:%S")
            if business.start_hour
            else None,
            close_hour=business.close_hour.strftime("%H:%M:%S")
            if business.close_hour
            else None,
            opening_days=business.opening_days,
            categories=[
                CategoryRead(id=cat.id, key=cat.key, name=cat.name)
                for cat in business.categories
            ],
        )

    except Exception as e:
        # If there is any error during commit or refresh, rollback and raise an HTTPException
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to update business: {str(e)}"
        )


@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_business(business_id: UUID, db: db_dep):
    result = await db.execute(select(Business).filter(Business.id == business_id))
    business = result.scalars().first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    await db.delete(business)
    await db.commit()
    return {"deleted": "success"}


class BusinessIdResponse(BaseModel):
    business_id: UUID
    user_id: UUID

    class Config:
        from_attributes = True


# --- ROUTES ---
@router.get("/user/{user_id}", response_model=BusinessIdResponse)
async def get_business_by_user_id(user_id: UUID, db: db_dep):
    """
    Get business ID by user ID
    """
    try:
        result = await db.execute(select(Business).filter(Business.user_id == user_id))
        business = result.scalars().first()

        if not business:
            raise HTTPException(
                status_code=404, detail="Business not found for this user"
            )

        return BusinessIdResponse(business_id=business.id, user_id=user_id)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching business: {str(e)}"
        )
