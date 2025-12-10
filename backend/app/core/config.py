from pydantic_settings import BaseSettings

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

    # App
    debug: bool = True
    secret_key: str = "change-this-in-production"

    # JWT Authentication
    jwt_secret_key: str = "your-super-secret-jwt-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15  # Short-lived access token
    refresh_token_expire_days: int = 7  # Long-lived refresh token

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
