from fastapi import APIRouter


router = APIRouter(prefix='/health', tags=['Health'])


@router.get("")
async def health():
    """
    Health check endpoint.

    Returns a HealthDTO indicating the status of the service.
    """
    return {"status":"UP"}
