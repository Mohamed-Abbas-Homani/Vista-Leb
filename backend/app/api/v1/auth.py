from fastapi import APIRouter
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from starlette import status

from app.api.v1.schemas.schemas import UserRead, UserCreate, CategoryRead
from app.core.db import db_dep
from app.core.security import authenticate_user, create_access_token, get_password_hash
from app.model.model import User, Category, Business, Customer

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
async def login(db: db_dep, form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username, "id": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "phone_number": user.phone_number,
            "address": user.address,
            "categories": [
                CategoryRead(id=c.id, name=c.name, key=c.key)
                for c in user.categories
            ],
            "cover_image": user.profile_photo,
        }
    }


@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, is_business: bool, db: db_dep):
    try:
        # Check for existing user
        existing = await db.execute(
            select(User).filter(
                (User.email == user.email) | (User.username == user.username)
            )
        )
        if existing.scalars().first():
            raise HTTPException(
                status_code=400, detail="Email or username already exists"
            )

        # Validate categories
        categories = []
        if user.categories:
            for cat_id in user.categories:
                category = await db.execute(
                    select(Category).filter(Category.id == cat_id)
                )
                category = category.scalars().first()
                if not category:
                    raise HTTPException(
                        status_code=404, detail=f"Category {cat_id} not found"
                    )
                categories.append(category)

        # Hash the password
        hashed_password = get_password_hash(user.password)

        # Create user with hashed password
        db_user = User(
            **user.model_dump(exclude={"categories", "password", "business", "customer"}),
            password=hashed_password)
        if is_business:
                db_user.business = Business(**user.business.model_dump())
        else:
            db_user.customer = Customer(**user.customer.model_dump())

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
            categories=[
                CategoryRead(id=c.id, name=c.name, key=c.key)
                for c in db_user.categories
            ],
        )

    except Exception as e:
        print(e)
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
