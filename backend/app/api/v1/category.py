from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from typing import List

from app.api.v1.dependencies import auth_dep
from app.api.v1.schemas.schemas import CategoryRead, CategoryCreate
from app.model.model import Category  # Assuming you have Category model here
from app.core.db import db_dep

router = APIRouter(prefix="/categories", tags=["Categories"], dependencies=[auth_dep])


# --- ROUTES ---
@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryCreate, db: db_dep):
    try:
        # Check if key already exists
        result = await db.execute(select(Category).filter(Category.key == category.key))
        existing_category = result.scalars().first()
        if existing_category:
            raise HTTPException(status_code=400, detail="Category key already exists.")

        db_category = Category(**category.dict())
        db.add(db_category)
        await db.commit()
        await db.refresh(db_category)
        return db_category
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[CategoryRead])
async def list_categories(db: db_dep):
    result = await db.execute(select(Category))
    return result.scalars().all()


@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(category_id: UUID, db: db_dep):
    result = await db.execute(select(Category).filter(Category.id == category_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: UUID, db: db_dep):
    result = await db.execute(select(Category).filter(Category.id == category_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    await db.delete(category)
    await db.commit()
    return {"detail": "Category deleted successfully."}
