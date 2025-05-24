# app/api/routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional

router = APIRouter()

# Request models
class SpawnAgentsRequest(BaseModel):
    count: int = 1
    bounds: Optional[Dict] = None
    origin: Optional[Dict] = None
    destination: Optional[Dict] = None

class BlockRoadRequest(BaseModel):
    lat: float
    lng: float
    location: Optional[Dict] = None

@router.post("/agents/spawn")
async def spawn_agents(request: SpawnAgentsRequest):
    """Spawn new agents in the simulation"""
    from ..main import agent_manager
    
    # If no bounds provided, use default San Francisco area
    if not request.bounds:
        request.bounds = {
            "north": 37.8199,
            "south": 37.7299,
            "east": -122.3694,
            "west": -122.5194
        }
    
    # If specific origin/destination provided, spawn single agent
    if request.origin and request.destination:
        try:
            # Convert to tuples
            origin = (request.origin['lat'], request.origin['lng'])
            destination = (request.destination['lat'], request.destination['lng'])
            
            # Create a single agent with specific route
            from ..agents.traffic_agent import TrafficAgent
            agent = TrafficAgent(
                agent_id=None,
                origin=origin,
                destination=destination,
                maps_service=agent_manager.maps_service
            )
            
            await agent.initialize_route()
            agent_manager.agents[agent.id] = agent
            
            return {"agent_ids": [agent.id], "count": 1}
        except Exception as e:
            print(f"Error spawning agent: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    else:
        # Spawn random agents within bounds
        try:
            agent_ids = await agent_manager.spawn_agents(request.count, request.bounds)
            return {"agent_ids": agent_ids, "count": len(agent_ids)}
        except Exception as e:
            print(f"Error spawning agents: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/roads/block")
async def block_road(request: BlockRoadRequest):
    """Add a road blockage"""
    from ..main import agent_manager
    
    location = request.location or {"lat": request.lat, "lng": request.lng}
    segment_key = f"{location['lat']}_{location['lng']}"
    
    await agent_manager.add_road_blockage(segment_key, location)
    return {"status": "blocked", "segment_key": segment_key, "location": location}

@router.delete("/roads/block/{segment_key}")
async def unblock_road(segment_key: str):
    """Remove a road blockage"""
    from ..main import agent_manager
    await agent_manager.remove_road_blockage(segment_key)
    return {"status": "unblocked", "segment_key": segment_key}

@router.post("/simulation/start")
async def start_simulation():
    """Start the simulation"""
    from ..main import agent_manager
    await agent_manager.start_simulation()
    return {"status": "running"}

@router.post("/simulation/stop")
async def stop_simulation():
    """Stop the simulation"""
    from ..main import agent_manager
    await agent_manager.stop_simulation()
    return {"status": "stopped"}

@router.get("/simulation/status")
async def get_simulation_status():
    """Get current simulation status"""
    from ..main import agent_manager
    return {
        "is_running": agent_manager.is_running,
        "agent_count": len(agent_manager.agents),
        "road_blocks": len(agent_manager.road_conditions)
    }

@router.get("/traffic/conditions")
async def get_traffic_conditions(north: float, south: float, east: float, west: float):
    """Get current traffic conditions from Google"""
    from ..main import maps_service
    bounds = {
        "north": north,
        "south": south,
        "east": east,
        "west": west
    }
    conditions = await maps_service.get_traffic_data(bounds)
    return conditions