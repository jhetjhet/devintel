from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str = "redis://redis:6379"
    JWT_SECRET_KEY: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 1
    JWT_ISSUER: str = "devintel-api"
    JWT_AUDIENCE: str = "devintel-client"

    LLM_API_KEY: str
    LLM_MODEL: str = "deepseek-coder"
    LLM_BASE_URL: str = "https://api.deepseek.com"
    ENGINE_REDIS_TTL_SECONDS: int = 86400  # 24 hours

    DEVINTEL_ENGINE_IMAGE: str = "devintel_engine"
    MAX_AUDIT_WORKERS: int = 5
    ADMIN_USERNAME: str | None = None
    ADMIN_PASSWORD: str | None = None
    ADMIN_SECRET_KEY: str | None = None

    ENVIRONMENT: Literal["production", "development"] = "production"

    TRUSTED_PROXIES: str = "127.0.0.1" # Comma-separated list of trusted hosts for ProxyHeadersMiddleware
    ALLOWED_HOSTS: str = "*" # Comma-separated list of allowed hosts for TrustedHostMiddleware
    ALLOWED_ORIGINS: str = "*" # Comma-separated list of allowed origins for CORS

    DEBUG: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
