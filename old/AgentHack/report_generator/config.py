from pydantic_settings import BaseSettings
from pydantic import Extra
from functools import lru_cache

class Settings(BaseSettings):
    google_traffic_api_key: str = ""
    react_app_google_maps_api_key: str = ""
    react_app_backend_url: str = ""
    novita_ai_api_key: str = ""
    redis_url: str = "redis://localhost:6379"
    websocket_port: int = 8000
    cors_origins: list = ["http://localhost:8000"]
    agent_update_interval: float = 0.1
    max_agents_per_sector: int = 100
    prediction_horizon: int = 30

    class Config:
        env_file = ".env"
        extra = Extra.allow  # ✅ Add this line

@lru_cache()
def get_settings():
    return Settings()
