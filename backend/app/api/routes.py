# app/api/routes.py
from fastapi import APIRouter, HTTPException
from typing import Dict, List

router = APIRouter()

@router.post("/agents/spawn")
async def spawn_agents(count: int, bounds: Dict):
    """Spawn new agents in the simulation"""
    from ..main import agent_manager
    try:
        agent_ids = await agent_manager.spawn_agents(count, bounds)
        return {"agent_ids": agent_ids, "count": len(agent_ids)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/roads/block")
async def block_road(location: Dict):
    """Add a road blockage"""
    from ..main import agent_manager
    segment_key = f"{location['lat']}_{location['lng']}"
    await agent_manager.add_road_blockage(segment_key, location)
    return {"status": "blocked", "segment_key": segment_key}

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

@router.get("/traffic/conditions")
async def get_traffic_conditions(bounds: Dict):
    """Get current traffic conditions from Google"""
    from ..main import maps_service
    conditions = await maps_service.get_traffic_data(bounds)
    return conditions