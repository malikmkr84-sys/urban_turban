"""Application configuration and environment variables."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server
    PORT: int = 5001
    HOST: str = "0.0.0.0"
    
    # Database
    DATABASE_URL: Optional[str] = None
    
    # Session
    SESSION_SECRET: str = "urban-turban-secret"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

