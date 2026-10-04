from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[3]

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kaucja_Boys"
    SECRET_KEY: str = "super-secret-hackathon-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    DATABASE_URL: str = "sqlite:///./kaucja.db"

    # Real environment variables (e.g. on Render) take precedence over the file.
    model_config = SettingsConfigDict(
        env_file=REPO_ROOT / ".env.local",
        case_sensitive=True,
        extra="ignore",
    )

settings = Settings()
