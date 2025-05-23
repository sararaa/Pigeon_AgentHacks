# backend/app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    google_maps_api_key: str
    redis_url: str = "redis://localhost:6379"
    websocket_port: int = 8000
    cors_origins: list = ["http://localhost:3000"]
    
    # Simulation parameters
    agent_update_interval: float = 0.1  # seconds
    max_agents_per_sector: int = 100
    prediction_horizon: int = 30  # minutes
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()