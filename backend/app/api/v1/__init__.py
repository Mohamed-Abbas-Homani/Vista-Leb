from fastapi import APIRouter
from .health import router as health_router
from .user import router as user_router
from .business import router as business_router
from .category import router as category_router
from .offer import router as offer_router
from .auth import router as login_router
from .mail_service import router as mail_router

router = APIRouter(prefix="/v1")

router.include_router(health_router)
router.include_router(login_router)
router.include_router(user_router)
router.include_router(business_router)
router.include_router(category_router)
router.include_router(offer_router)
router.include_router(mail_router)
