from typing import Annotated

from fastapi import Depends

from app.core.security import authenticate_token, current_user

auth_dep = Depends(authenticate_token)
current_user_dep = Annotated[dict, Depends(current_user)]
