from fastapi import APIRouter
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from starlette import status

from app.api.v1.schemas.schemas import BusinessRead, CustomerRead, UserRead, UserCreate, CategoryRead
from app.core.db import db_dep
from app.core.security import authenticate_user, create_access_token, get_password_hash
from app.model.model import User, Category, Business, Customer

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
async def login(db: db_dep, form_data: OAuth2PasswordRequestForm = Depends()):
    db_user = await authenticate_user(form_data.username, form_data.password, db)
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": db_user.username, "id": str(db_user.id)})
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
            opening_days=db_user.business.opening_days,
            photos=db_user.business.photos
        )

    customer_data = None
    if db_user.customer:
        customer_data = CustomerRead(
            age=db_user.customer.age,
            marital_status=db_user.customer.marital_status,
            price_range=db_user.customer.price_range,
            gender=db_user.customer.gender
        )

    user_read = UserRead(
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
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_read.model_dump()
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
        print(e)
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
