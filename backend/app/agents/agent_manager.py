# backend/app/agents/agent_manager.py
import asyncio
from typing import Dict, List, Set
import redis.asyncio as redis
import json
from datetime import datetime
import numpy as np
from .traffic_agent import TrafficAgent
from ..maps.google_maps import GoogleMapsService

class AgentManager:
    def __init__(self, maps_service: GoogleMapsService, redis_client: redis.Redis):
        self.maps_service = maps_service
        self.redis = redis_client
        self.agents: Dict[str, TrafficAgent] = {}
        self.road_conditions: Dict[str, Dict] = {}
        self.update_interval = 0.1  # 100ms
        self.is_running = False
        self._update_task = None
        
    async def spawn_agents(self, count: int, bounds: Dict) -> List[str]:
        """Spawn new agents within bounds"""
        agent_ids = []
        
        for _ in range(count):
            # Random origin and destination within bounds
            origin = (
                np.random.uniform(bounds["south"], bounds["north"]),
                np.random.uniform(bounds["west"], bounds["east"])
            )
            
            destination = (
                np.random.uniform(bounds["south"], bounds["north"]),
                np.random.uniform(bounds["west"], bounds["east"])
            )
            
            # Create agent
            agent = TrafficAgent(
                agent_id=None,
                origin=origin,
                destination=destination,
                maps_service=self.maps_service
            )
            
            # Initialize route
            await agent.initialize_route()
            
            self.agents[agent.id] = agent
            agent_ids.append(agent.id)
        
        return agent_ids
    
    async def add_road_blockage(self, segment_key: str, location: Dict):
        """Add a road blockage"""
        self.road_conditions[segment_key] = {
            "blocked": True,
            "location": location,
            "timestamp": datetime.now().isoformat()
        }
        
        # Store in Redis for persistence
        await self.redis.hset(
            "road_conditions",
            segment_key,
            json.dumps(self.road_conditions[segment_key])
        )
        
        # Trigger agent perception update
        await self._trigger_agent_updates()
    
    async def remove_road_blockage(self, segment_key: str):
        """Remove a road blockage"""
        if segment_key in self.road_conditions:
            del self.road_conditions[segment_key]
            await self.redis.hdel("road_conditions", segment_key)
    
    async def _trigger_agent_updates(self):
        """Force all agents to re-perceive environment"""
        tasks = []
        for agent in self.agents.values():
            tasks.append(self._update_agent_perception(agent))
        
        await asyncio.gather(*tasks)
    
    async def _update_agent_perception(self, agent: TrafficAgent):
        """Update single agent's perception"""
        # Find nearby agents
        nearby_agents = self._find_nearby_agents(agent, radius_km=0.5)
        
        # Perceive environment
        perception = await agent.perceive_environment(
            nearby_agents, 
            self.road_conditions
        )
        
        # Make decision
        await agent.make_decision(perception)
    
    def _find_nearby_agents(self, agent: TrafficAgent, radius_km: float) -> List[TrafficAgent]:
        """Find agents within radius"""
        nearby = []
        
        for other_agent in self.agents.values():
            if other_agent.id == agent.id:
                continue
                
            distance = self.maps_service._calculate_distance(
                agent.current_position,
                other_agent.current_position
            )
            
            if distance <= radius_km:
                nearby.append(other_agent)
        
        return nearby
    
    async def start_simulation(self):
        """Start the simulation loop"""
        self.is_running = True
        self._update_task = asyncio.create_task(self._simulation_loop())
    
    async def stop_simulation(self):
        """Stop the simulation"""
        self.is_running = False
        if self._update_task:
            await self._update_task
    
    async def _simulation_loop(self):
        """Main simulation loop"""
        while self.is_running:
            start_time = asyncio.get_event_loop().time()
            
            # Update all agents
            update_tasks = []
            for agent in list(self.agents.values()):
                update_tasks.append(self._update_agent(agent))
            
            await asyncio.gather(*update_tasks)
            
            # Broadcast state
            await self._broadcast_state()
            
            # Maintain update rate
            elapsed = asyncio.get_event_loop().time() - start_time
            sleep_time = max(0, self.update_interval - elapsed)
            await asyncio.sleep(sleep_time)
    
    async def _update_agent(self, agent: TrafficAgent):
        """Update individual agent"""
        # Move agent
        agent.move(self.update_interval)
        
        # Periodic perception update (every second)
        if np.random.random() < self.update_interval:
            await self._update_agent_perception(agent)
        
        # Learn from experience
        agent.learn_from_experience()
        
        # Remove if reached destination
        if agent.current_segment >= len(agent.current_route.get("steps", [])):
            del self.agents[agent.id]
    
    async def _broadcast_state(self):
        """Broadcast current state to Redis for websocket distribution"""
        state = {
            "timestamp": datetime.now().isoformat(),
            "agents": [agent.to_dict() for agent in self.agents.values()],
            "road_conditions": self.road_conditions,
            "stats": self._calculate_stats()
        }
        
        await self.redis.publish("traffic_state", json.dumps(state))
    
    def _calculate_stats(self) -> Dict:
        """Calculate simulation statistics"""
        if not self.agents:
            return {
                "total_agents": 0,
                "avg_stress": 0,
                "stuck_agents": 0,
                "rethinking_agents": 0
            }
        
        stress_levels = [agent.stress_level for agent in self.agents.values()]
        
        return {
            "total_agents": len(self.agents),
            "avg_stress": np.mean(stress_levels),
            "stuck_agents": sum(1 for agent in self.agents.values() if agent.is_stuck),
            "rethinking_agents": sum(1 for agent in self.agents.values() if agent.is_rethinking)
        }