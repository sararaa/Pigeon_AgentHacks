# app/api/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import redis.asyncio as redis
import json
import asyncio
from typing import Set

router = APIRouter()  # Add this line

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.redis_client = None
        self.pubsub = None
        self._broadcast_task = None
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        
        if not self.redis_client:
            self.redis_client = await redis.from_url("redis://localhost:6379")
            self.pubsub = self.redis_client.pubsub()
            await self.pubsub.subscribe("traffic_state")
            self._broadcast_task = asyncio.create_task(self._broadcast_loop())
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
    
    async def _broadcast_loop(self):
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                data = message["data"].decode("utf-8")
                await self.broadcast(data)
    
    async def broadcast(self, message: str):
        disconnected = set()
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.add(connection)
        
        self.active_connections -= disconnected
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "ping":
                await manager.send_personal_message(
                    json.dumps({"type": "pong"}), 
                    websocket
                )
    except WebSocketDisconnect:
        manager.disconnect(websocket)