from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str = "redis://redis:6379"

    LLM_API_KEY: str
    LLM_MODEL: str = "deepseek-coder"
    LLM_BASE_URL: str = "https://api.deepseek.com"
    DEVINTEL_ENGINE_IMAGE: str = "devintel_engine"
    MAX_AUDIT_WORKERS: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
