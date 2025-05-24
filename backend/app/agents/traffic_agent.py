# backend/app/agents/traffic_agent.py
import asyncio
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import uuid
from enum import Enum

class AgentPersonality(Enum):
    AGGRESSIVE = "aggressive"
    CONSERVATIVE = "conservative"
    ADAPTIVE = "adaptive"
    EXPLORER = "explorer"

class TrafficAgent:
    def __init__(self, agent_id: str, origin: Tuple[float, float], 
                 destination: Tuple[float, float], maps_service):
        self.id = agent_id or str(uuid.uuid4())
        self.origin = origin
        self.destination = destination
        self.current_position = origin
        self.maps_service = maps_service
        
        # Agent properties
        self.personality = np.random.choice(list(AgentPersonality))
        self.speed_preference = self._init_speed_preference()
        self.risk_tolerance = np.random.uniform(0.3, 0.9)
        self.learning_rate = np.random.uniform(0.1, 0.3)
        
        # State
        self.current_route = None
        self.alternative_routes = []
        self.route_progress = 0.0
        self.current_segment = 0
        self.stress_level = 0.0
        self.is_stuck = False
        self.is_rethinking = False
        
        # Memory
        self.route_experiences = {}  # route_id -> experience_score
        self.segment_knowledge = {}  # segment_id -> congestion_history
        self.incident_memory = []    # remembered incidents
        
    def _init_speed_preference(self) -> float:
        """Initialize speed preference based on personality"""
        preferences = {
            AgentPersonality.AGGRESSIVE: np.random.uniform(0.8, 1.0),
            AgentPersonality.CONSERVATIVE: np.random.uniform(0.5, 0.7),
            AgentPersonality.ADAPTIVE: np.random.uniform(0.6, 0.8),
            AgentPersonality.EXPLORER: np.random.uniform(0.6, 0.9)
        }
        return preferences[self.personality]
    
    async def initialize_route(self):
        """Get initial route options from Google Maps"""
        routes = await self.maps_service.get_route(
            self.origin, 
            self.destination,
            departure_time=datetime.now()
        )
        
        if routes:
            # Evaluate routes based on personality
            self.alternative_routes = routes
            self.current_route = self._select_best_route(routes)
            self.current_segment = 0
            self.route_progress = 0.0
    
    def _select_best_route(self, routes: List[Dict]) -> Dict:
        """Select route based on personality and experience"""
        scores = []
        
        for route in routes:
            score = 0.0
            
            # Base score on duration and distance
            duration_score = 1.0 / (route["duration"] / 60)  # Convert to minutes
            distance_score = 1.0 / (route["distance"] / 1000)  # Convert to km
            
            # Personality adjustments
            if self.personality == AgentPersonality.AGGRESSIVE:
                score = duration_score * 0.9 + distance_score * 0.1
            elif self.personality == AgentPersonality.CONSERVATIVE:
                score = duration_score * 0.5 + distance_score * 0.5
            elif self.personality == AgentPersonality.EXPLORER:
                # Prefer less common routes
                score = duration_score * 0.4 + np.random.random() * 0.6
            else:  # ADAPTIVE
                score = duration_score * 0.7 + distance_score * 0.3
            
            # Apply experience if available
            route_key = self._get_route_key(route)
            if route_key in self.route_experiences:
                experience_factor = self.route_experiences[route_key]
                score *= experience_factor
            
            scores.append(score)
        
        # Select route with highest score
        best_idx = np.argmax(scores)
        return routes[best_idx]
    
    def _get_route_key(self, route: Dict) -> str:
        """Generate unique key for route"""
        return route["polyline"][:50]  # Use first part of polyline as key
    
    async def perceive_environment(self, nearby_agents: List['TrafficAgent'], 
                                  road_conditions: Dict) -> Dict:
        """Perceive current environment and detect issues"""
        perception = {
            "congestion_ahead": 0.0,
            "blocked_route": False,
            "better_alternative": False,
            "stress_factors": []
        }
        
        # Check congestion from nearby agents
        agents_on_same_route = [
            agent for agent in nearby_agents 
            if self._is_on_same_route(agent) and 
            self._distance_to(agent.current_position) < 0.1  # 100m
        ]
        
        if len(agents_on_same_route) > 5:
            perception["congestion_ahead"] = min(len(agents_on_same_route) / 10, 1.0)
            perception["stress_factors"].append("high_density")
        
        # Check road conditions
        current_segment_key = self._get_current_segment_key()
        if current_segment_key in road_conditions:
            if road_conditions[current_segment_key].get("blocked", False):
                perception["blocked_route"] = True
                perception["stress_factors"].append("road_blocked")
        
        # Update stress level
        self.stress_level = perception["congestion_ahead"]
        if perception["blocked_route"]:
            self.stress_level = 1.0
        
        return perception
    
    def _is_on_same_route(self, other_agent: 'TrafficAgent') -> bool:
        """Check if another agent is on the same route"""
        if not self.current_route or not other_agent.current_route:
            return False
        
        return (self._get_route_key(self.current_route) == 
                self._get_route_key(other_agent.current_route))
    
    def _distance_to(self, position: Tuple[float, float]) -> float:
        """Calculate distance to another position in km"""
        return self.maps_service._calculate_distance(
            self.current_position, position
        )
    
    def _get_current_segment_key(self) -> str:
        """Get key for current road segment"""
        if not self.current_route or self.current_segment >= len(self.current_route["steps"]):
            return ""
        
        step = self.current_route["steps"][self.current_segment]
        return f"{step['start_location']}_{step['end_location']}"
    
    async def make_decision(self, perception: Dict):
        """Decide whether to reroute based on perception"""
        if self.is_rethinking:
            return
        
        rethink_probability = 0.0
        
        # Calculate rethinking probability
        if perception["blocked_route"]:
            rethink_probability = 1.0
        elif perception["congestion_ahead"] > 0.7:
            rethink_probability = perception["congestion_ahead"] * self.risk_tolerance
        
        # Personality-based exploration
        if self.personality == AgentPersonality.EXPLORER:
            rethink_probability += 0.1
        elif self.personality == AgentPersonality.ADAPTIVE:
            rethink_probability += perception["congestion_ahead"] * 0.2
        
        # Execute rethinking
        if np.random.random() < rethink_probability:
            await self.rethink_route()
    
    async def rethink_route(self):
        """Recalculate route based on current conditions"""
        self.is_rethinking = True
        
        try:
            # Get fresh routes from current position
            new_routes = await self.maps_service.get_route(
                self.current_position,
                self.destination,
                departure_time=datetime.now()
            )
            
            if new_routes:
                # Store experience about current route
                if self.current_route:
                    route_key = self._get_route_key(self.current_route)
                    # Negative experience due to rerouting
                    self.route_experiences[route_key] = max(
                        self.route_experiences.get(route_key, 1.0) - 0.1,
                        0.3
                    )
                
                # Select new route
                self.alternative_routes = new_routes
                old_route = self.current_route
                self.current_route = self._select_best_route(new_routes)
                
                # Reset progress if route changed
                if old_route != self.current_route:
                    self.current_segment = 0
                    self.route_progress = 0.0
                    self.is_stuck = False
        
        finally:
            self.is_rethinking = False
    
    def move(self, delta_time: float):
        """Move agent along current route"""
        if not self.current_route or self.is_stuck:
            return
        
        if self.current_segment >= len(self.current_route["steps"]):
            # Reached destination
            return
        
        current_step = self.current_route["steps"][self.current_segment]
        
        # Calculate movement speed (affected by stress)
        effective_speed = self.speed_preference * (1 - self.stress_level * 0.5)
        
        # Move along segment
        segment_length = current_step["distance"]
        progress_delta = (effective_speed * delta_time * 50) / segment_length
        
        self.route_progress += progress_delta
        
        if self.route_progress >= 1.0:
            # Move to next segment
            self.current_segment += 1
            self.route_progress = 0.0
            
            # Update knowledge about completed segment
            segment_key = self._get_current_segment_key()
            if segment_key:
                if segment_key not in self.segment_knowledge:
                    self.segment_knowledge[segment_key] = []
                
                self.segment_knowledge[segment_key].append({
                    "timestamp": datetime.now(),
                    "congestion": self.stress_level,
                    "duration": current_step["duration"]
                })
        
        # Update position
        self._update_position(current_step, self.route_progress)
    
    def _update_position(self, step: Dict, progress: float):
        """Update current position based on progress along segment"""
        start = step["start_location"]
        end = step["end_location"]
        
        self.current_position = (
            start["lat"] + (end["lat"] - start["lat"]) * progress,
            start["lng"] + (end["lng"] - start["lng"]) * progress
        )
    
    def learn_from_experience(self):
        """Update agent's knowledge based on recent experience"""
        # Consolidate segment knowledge
        for segment_key, experiences in self.segment_knowledge.items():
            if len(experiences) > 5:
                # Keep only recent experiences
                self.segment_knowledge[segment_key] = experiences[-5:]
        
        # Update route preferences based on completion
        if self.current_segment >= len(self.current_route["steps"]) - 1:
            # Successfully completed route
            route_key = self._get_route_key(self.current_route)
            self.route_experiences[route_key] = min(
                self.route_experiences.get(route_key, 1.0) + self.learning_rate,
                2.0
            )
    
    def to_dict(self) -> Dict:
        """Convert agent state to dictionary for transmission"""
        return {
            "id": self.id,
            "position": {
                "lat": self.current_position[0],
                "lng": self.current_position[1]
            },
            "destination": {
                "lat": self.destination[0],
                "lng": self.destination[1]
            },
            "personality": self.personality.value,
            "stress_level": self.stress_level,
            "is_stuck": self.is_stuck,
            "is_rethinking": self.is_rethinking,
            "route_progress": self.route_progress,
            "current_segment": self.current_segment
        }