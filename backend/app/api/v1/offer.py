from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query, Depends
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.api.v1.dependencies import auth_dep
from app.model.model import BusinessOffer  # Adjust the path if needed
from app.core.db import db_dep  # Your db dependency

from fastapi import UploadFile, File, Form
import uuid
from pathlib import Path
import os
import qrcode

router = APIRouter(prefix="/offers", tags=["Offers"], dependencies=[auth_dep])

def generate_qr_code(data: str, filename: str, save_dir="static/qrcodes") -> str:
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, f"{filename}.png")
    img = qrcode.make(data)
    img.save(file_path)
    return file_path


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
    qr_code_path: Optional[str]

    class Config:
        from_attributes = True



# --- ROUTES ---
@router.post("/", response_model=OfferRead, status_code=status.HTTP_201_CREATED)
async def create_offer(offer: OfferCreate, db: db_dep):
    try:
        # Create the offer
        db_offer = BusinessOffer(**offer.dict())
        db_offer.redemption_code = uuid.uuid4().hex  # Unique redemption code

        db.add(db_offer)
        await db.flush()  # to get db_offer.id

        # Generate the QR code
        qr_data = f"http://localhost:8000/redeem/{db_offer.redemption_code}"
        qr_filename = str(db_offer.id)
        qr_relative_path = generate_qr_code(data=qr_data, filename=qr_filename)
        db_offer.qr_code_path = "/" + qr_relative_path.replace("\\", "/")  # Ensure UNIX-style path

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

@router.post("/upload-photo-offer", status_code=status.HTTP_200_OK)
async def upload_offer_photo(file: UploadFile = File(...)):
    # Create general upload directory for offers
    upload_dir = Path("uploads") / "offers"
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
    file_path = upload_dir / unique_filename

    # Save the file
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Construct relative URL path
    relative_path = f"/uploads/offers/{unique_filename}"

    return {
        "message": "Offer photo uploaded successfully",
        "file_path": relative_path,
        "type": "offer"
    }

@router.get("/business/{business_id}", response_model=List[OfferRead])
async def get_offers_by_business_id(
    business_id: UUID,
    db: db_dep,
):
    result = await db.execute(
        select(BusinessOffer).filter(BusinessOffer.business_id == business_id)
    )
    offers = result.scalars().all()
    if not offers:
        raise HTTPException(status_code=404, detail="No offers found for this business ID")
    return offers

@router.get("/redeem/{code}")
async def redeem_offer(code: str, db: db_dep):
    result = await db.execute(select(BusinessOffer).filter_by(redemption_code=code))
    offer = result.scalars().first()
    if not offer:
        raise HTTPException(status_code=404, detail="Invalid or expired QR code")
    return {"message": f"Offer '{offer.name}' redeemed successfully!"}
