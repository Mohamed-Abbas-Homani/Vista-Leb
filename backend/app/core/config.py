import os
from enum import Enum
from pydantic_settings import BaseSettings
from starlette.config import Config

current_file_dir = os.path.dirname(os.path.realpath(__file__))
app_path = os.path.join(current_file_dir, "..")
env_path = os.path.join(app_path, "..", ".env")
alembic_cfg_path = os.path.join(app_path, "..", "alembic.ini")
config = Config(env_path)


class AppSettings(BaseSettings):
    APP_NAME: str = config("APP_NAME", default="FastAPI app")
    APP_DESCRIPTION: str | None = config("APP_DESCRIPTION", default=None)
    APP_VERSION: str | None = config("APP_VERSION", default=None)
    CONTACT_NAME: str | None = config("CONTACT_NAME", default=None)
    CONTACT_EMAIL: str | None = config("CONTACT_EMAIL", default=None)


class DatabaseSettings(BaseSettings):
    pass


class PostgresSettings(DatabaseSettings):
    POSTGRES_USER: str = config("POSTGRES_USER", default="postgres")
    POSTGRES_PASSWORD: str = config("POSTGRES_PASSWORD", default="postgres")
    POSTGRES_SERVER: str = config("POSTGRES_SERVER", default="localhost")
    POSTGRES_PORT: int = config("POSTGRES_PORT", default=5432)
    POSTGRES_DB: str = config("POSTGRES_DB", default="postgres")
    POSTGRES_SYNC_PREFIX: str = config("POSTGRES_SYNC_PREFIX", default="postgresql://")
    POSTGRES_ASYNC_PREFIX: str = config(
        "POSTGRES_ASYNC_PREFIX", default="postgresql+asyncpg://"
    )
    POSTGRES_URI: str = f"{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    POSTGRES_URL: str | None = config("POSTGRES_URL", default=None)
    DATABASE_LOGGING: bool = config("DATABASE_LOGGING", default=True)


class EnvironmentOption(Enum):
    LOCAL = "local"
    STAGING = "staging"
    PRODUCTION = "production"


class EnvironmentSettings(BaseSettings):
    ENVIRONMENT: EnvironmentOption = config("ENVIRONMENT", default="local")


class LogLevelOption(Enum):
    NOTSET = "0"
    DEBUG = "10"
    INFO = "20"
    WARNING = "30"
    ERROR = "40"
    CRITICAL = "50"


class LoggingSettings(BaseSettings):
    LOGLEVEL: LogLevelOption = config("LOGLEVEL", default=LogLevelOption.DEBUG)


class CORSSettings(BaseSettings):
    ALLOW_ORIGINS: str = config(
        "ALLOW_ORIGINS",
        default="http://localhost:5173",
    )
    ALLOW_METHODS: str = config("ALLOW_METHODS", default="*")
    ALLOW_HEADERS: str = config("ALLOW_HEADERS", default="*")
    ALLOW_CREDENTIALS: bool = config("ALLOW_CREDENTIALS", default=True)

    @property
    def allow_origins(self):
        return self.ALLOW_ORIGINS.split(",")

    @property
    def allow_methods(self):
        return self.ALLOW_METHODS.split(",")

    @property
    def allow_headers(self):
        return self.ALLOW_HEADERS.split(",")


class AuthSettings(BaseSettings):
    SECRET_KEY: str = config("SECRET_KEY")
    ALGORITHM: str = config("ALGORITHM", default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30)


class Settings(
    AppSettings,
    PostgresSettings,
    EnvironmentSettings,
    LoggingSettings,
    CORSSettings,
    AuthSettings,
):
    pass


settings = Settings()
