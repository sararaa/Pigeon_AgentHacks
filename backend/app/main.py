# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import redis.asyncio as redis
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os
import asyncio

# Load environment variables
load_dotenv()

from .config import get_settings
from .api import routes
from .agents.agent_manager import AgentManager
from .maps.google_maps import GoogleMapsService

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*'  # Configure this properly for production
)

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
    
    # Start Redis listener for Socket.IO broadcasts
    asyncio.create_task(redis_listener())
    
    yield
    
    # Shutdown
    await redis_client.close()

app = FastAPI(lifespan=lifespan)

# CORS for localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Socket.IO app
socket_app = socketio.ASGIApp(sio, app)

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")
    await sio.emit('connected', {'data': 'Connected to server'}, to=sid)

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")

@sio.event
async def ping(sid, data):
    await sio.emit('pong', {'timestamp': data.get('timestamp')}, to=sid)

# Redis listener for broadcasting traffic state
async def redis_listener():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("traffic_state")
    
    async for message in pubsub.listen():
        if message["type"] == "message":
            data = message["data"].decode("utf-8")
            # Broadcast to all connected Socket.IO clients
            await sio.emit('traffic_update', data)

# Include routers
app.include_router(routes.router, prefix="/api")

# Dependency injection functions
async def get_agent_manager():
    return agent_manager

async def get_maps_service():
    return maps_service

# Add these to routes.py imports
routes.get_agent_manager = get_agent_manager
routes.get_maps_service = get_maps_service