import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kaucja_Boys"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-hackathon-key-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kaucja.db")

    class Config:
        case_sensitive = True

settings = Settings()
