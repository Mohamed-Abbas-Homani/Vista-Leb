from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from sqlalchemy import select

from app.model.model import Business, Category
from app.core.db import db_dep

from datetime import time, datetime
from .category import (
    CategoryRead,
)  # Assuming you have CategoryRead schema in category.py
from .dependencies import current_user

router = APIRouter(prefix="/businesses", tags=["Businesses"], dependencies=[current_user])


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
    start_hour: Optional[time] = None  # Changed to time
    close_hour: Optional[time] = None  # Changed to time
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
    categories: List[CategoryRead]

    class Config:
        from_attributes = True


# --- ROUTES ---
from datetime import datetime


@router.post("/", response_model=BusinessRead, status_code=status.HTTP_201_CREATED)
async def create_business(business: BusinessCreate, db: db_dep):
    try:
        # Ensure categories are valid
        if business.categories:
            categories = []
            for cat_id in business.categories:
                # Check if category exists in the DB
                category = await db.execute(select(Category).filter(Category.id == cat_id))
                category = category.scalars().first()
                if not category:
                    raise HTTPException(status_code=404, detail=f"Category {cat_id} not found.")
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



@router.get("/", response_model=List[BusinessRead])
async def list_businesses(db: db_dep):
    result = await db.execute(select(Business))
    return result.scalars().all()


@router.get("/{business_id}", response_model=BusinessRead)
async def get_business_by_id(business_id: UUID, db: db_dep):
    try:
        result = await db.execute(select(Business).filter(Business.id == business_id))
        db_business = result.scalars().first()

        if not db_business:
            raise HTTPException(status_code=404, detail="Business not found")

        return BusinessRead(
            id=db_business.id,
            email=db_business.email,
            branch_name=db_business.branch_name,
            phone_number=db_business.phone_number,
            hot_line=db_business.hot_line,
            address=db_business.address,
            targeted_gender=db_business.targeted_gender,
            cover_photo=db_business.cover_photo,
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
        raise HTTPException(status_code=400, detail=str(e))
        


from datetime import datetime
from fastapi import HTTPException, status
from typing import Optional
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
                category = await db.execute(select(Category).filter(Category.id == cat_id))
                category = category.scalars().first()
                if not category:
                    raise HTTPException(status_code=404, detail=f"Category {cat_id} not found.")
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
            start_hour=business.start_hour.strftime("%H:%M:%S") if business.start_hour else None,
            close_hour=business.close_hour.strftime("%H:%M:%S") if business.close_hour else None,
            opening_days=business.opening_days,
            categories=[CategoryRead(id=cat.id, key=cat.key, name=cat.name) for cat in business.categories],
        )

    except Exception as e:
        # If there is any error during commit or refresh, rollback and raise an HTTPException
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update business: {str(e)}")





@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_business(business_id: UUID, db: db_dep):
    result = await db.execute(select(Business).filter(Business.id == business_id))
    business = result.scalars().first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    await db.delete(business)
    await db.commit()
    return {"deleted": "success"}
