# backend/app/config.py
from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache

class Settings(BaseSettings):
    # Google Maps
    google_maps_api_key: str
    
    # Redis Configuration
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Environment
    environment: str = "development"
    
    # CORS
    cors_origins: Optional[str] = '["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"]'
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # This will ignore any extra fields in .env

@lru_cache()
def get_settings():
    return Settings()