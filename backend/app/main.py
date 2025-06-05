from app.api import router

from .core.config import settings
from .core.setup import create_application
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

app = create_application(router=router, settings=settings)
app.mount("/static", StaticFiles(directory="static"), name="static")

