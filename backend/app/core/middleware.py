from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from jose import JWTError, jwt

def setup_cors_middleware(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allow_origins,
        allow_credentials=settings.ALLOW_CREDENTIALS,
        allow_methods=settings.allow_methods,
        allow_headers=settings.allow_headers,
    )


def setup_middlewares(app: FastAPI):
    setup_cors_middleware(app)
    # @app.middleware("http")
    # async def auth_middleware(request: Request, call_next):
    #     if request.url.path in ["/api/v1/login", "/api/v1/health", "/api/v1/users/signup","/docs", "/openapi.json"]:  # public endpoints
    #         return await call_next(request)
    #     token = request.headers.get("Authorization")
    #     if not token or not token.startswith("Bearer "):
    #         return JSONResponse(status_code=401, content={"detail": "Not authenticated"})
    #     try:
    #         payload = jwt.decode(token[7:], settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    #         request.state.user = payload.get("sub")
    #     except JWTError:
    #         return JSONResponse(status_code=401, content={"detail": "Invalid token"})
    #     return await call_next(request)
