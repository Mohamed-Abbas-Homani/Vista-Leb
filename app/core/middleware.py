from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings


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
