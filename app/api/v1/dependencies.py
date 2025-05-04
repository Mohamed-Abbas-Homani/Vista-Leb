from typing import Annotated

from fastapi import Depends

from app.core.security import get_current_user

current_user = Depends(get_current_user)