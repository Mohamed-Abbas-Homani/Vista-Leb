from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.api.v1.dependencies import auth_dep
from app.model.model import BusinessOffer  # Adjust the path if needed
from app.core.db import db_dep  # Your db dependency

router = APIRouter(prefix="/offers", tags=["Offers"], dependencies=[auth_dep])


# --- SCHEMAS ---
class OfferCreate(BaseModel):
    business_id: UUID
    name: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    photo: Optional[str] = None


class OfferUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    photo: Optional[str] = None


class OfferRead(BaseModel):
    id: UUID
    business_id: UUID
    name: str
    description: Optional[str]
    start_date: datetime
    end_date: datetime
    photo: Optional[str]

    class Config:
        from_attributes = True


# --- ROUTES ---
@router.post("/", response_model=OfferRead, status_code=status.HTTP_201_CREATED)
async def create_offer(offer: OfferCreate, db: db_dep):
    try:
        db_offer = BusinessOffer(**offer.dict())
        db.add(db_offer)
        await db.commit()
        await db.refresh(db_offer)
        return db_offer
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[OfferRead])
async def list_offers(db: db_dep):
    result = await db.execute(select(BusinessOffer))
    return result.scalars().all()


@router.get("/{offer_id}", response_model=OfferRead)
async def get_offer(offer_id: UUID, db: db_dep):
    result = await db.execute(
        select(BusinessOffer).filter(BusinessOffer.id == offer_id)
    )
    offer = result.scalars().first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer


@router.put("/{offer_id}", response_model=OfferRead)
async def update_offer(offer_id: UUID, offer_update: OfferUpdate, db: db_dep):
    result = await db.execute(
        select(BusinessOffer).filter(BusinessOffer.id == offer_id)
    )
    offer = result.scalars().first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    for key, value in offer_update.dict(exclude_unset=True).items():
        setattr(offer, key, value)

    try:
        await db.commit()
        await db.refresh(offer)
        return offer
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_offer(offer_id: UUID, db: db_dep):
    result = await db.execute(
        select(BusinessOffer).filter(BusinessOffer.id == offer_id)
    )
    offer = result.scalars().first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    await db.delete(offer)
    await db.commit()
    return {"detail": "Offer deleted successfully."}
