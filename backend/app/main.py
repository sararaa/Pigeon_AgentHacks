# backend/app/main.py - Update CORS for localhost
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

from .config import get_settings
from .api import routes, websocket
from .agents.agent_manager import AgentManager
from .maps.google_maps import GoogleMapsService

# Global instances
agent_manager = None
maps_service = None
redis_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global agent_manager, maps_service, redis_client
    
    redis_client = await redis.from_url("redis://localhost:6379")
    maps_service = GoogleMapsService()
    agent_manager = AgentManager(maps_service, redis_client)
    
    # Build initial road network
    await maps_service.build_road_network(
        center=(37.7749, -122.4194),  # San Francisco
        radius_km=5
    )
    
    yield
    
    # Shutdown
    await redis_client.close()

app = FastAPI(lifespan=lifespan)

# CORS for localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(routes.router, prefix="/api")
app.include_router(websocket.router)

# Dependency injection functions
async def get_agent_manager():
    return agent_manager

async def get_maps_service():
    return maps_service

from .api import routes

# Add these to routes.py imports
routes.get_agent_manager = get_agent_manager
routes.get_maps_service = get_maps_service
