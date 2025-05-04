from typing import Annotated

from alembic import command
from alembic.config import Config
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncAttrs, async_sessionmaker, create_async_engine
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import DeclarativeBase

from .config import alembic_cfg_path, settings
from .logger import logger


class Base(DeclarativeBase, AsyncAttrs):
    def dict(self):
        return self.__dict__


DATABASE_URI = settings.POSTGRES_URI
DATABASE_PREFIX = settings.POSTGRES_ASYNC_PREFIX
DATABASE_URL = f"{DATABASE_PREFIX}{DATABASE_URI}"

async_engine = create_async_engine(
    DATABASE_URL, echo=settings.DATABASE_LOGGING, future=True
)

async_session = async_sessionmaker(
    bind=async_engine, class_=AsyncSession, expire_on_commit=False
)
logger.info("Database connected successfully")


def run_upgrade(connection, cfg):
    cfg.attributes["connection"] = connection
    command.upgrade(cfg, "head")


async def run_async_migrations():
    async_mig_engine = create_async_engine(DATABASE_URL, echo=False)
    async with async_mig_engine.begin() as conn:
        await conn.run_sync(run_upgrade, Config(alembic_cfg_path))


async def async_get_db() -> AsyncSession:
    async with async_session() as db:
        try:
            yield db
        finally:
            await db.close()


db_dep = Annotated[AsyncSession, Depends(async_get_db)]
