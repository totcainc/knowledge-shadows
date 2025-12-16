import os
import secrets
from pydantic_settings import BaseSettings


def get_secure_default_key() -> str:
    """Generate a secure random key if not provided via environment."""
    return secrets.token_urlsafe(32)


class Settings(BaseSettings):
    # Database - using SQLite for easy setup (change to PostgreSQL in production)
    database_url: str = "sqlite:///./knowledge_shadows.db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # AI Services
    assemblyai_api_key: str = ""  # For transcription
    gemini_api_key: str = ""  # For analysis
    # Legacy - kept for backwards compatibility
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # Storage
    video_storage_path: str = "./storage/videos"
    thumbnail_storage_path: str = "./storage/thumbnails"

    # App - debug defaults to False for security
    debug: bool = False
    secret_key: str = ""

    # JWT Authentication - keys must be set via environment
    jwt_secret_key: str = ""
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15  # Short-lived access token
    refresh_token_expire_days: int = 7  # Long-lived refresh token

    # CORS - comma-separated list of allowed origins
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Generate secure keys if not provided (for development convenience)
        if not self.secret_key:
            self.secret_key = get_secure_default_key()
        if not self.jwt_secret_key:
            self.jwt_secret_key = get_secure_default_key()


settings = Settings()
