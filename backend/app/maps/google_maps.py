# backend/app/maps/google_maps.py
import googlemaps
from datetime import datetime
import asyncio
from typing import List, Dict, Tuple
import networkx as nx
from ..config import get_settings

class GoogleMapsService:
    def __init__(self):
        settings = get_settings()
        self.gmaps = googlemaps.Client(key=settings.google_maps_api_key)
        self.road_network = nx.DiGraph()
        self._cache = {}
        
    async def get_route(self, origin: Tuple[float, float], 
                       destination: Tuple[float, float],
                       departure_time: datetime = None) -> Dict:
        """Get route with real-time traffic data"""
        cache_key = f"{origin}_{destination}_{departure_time}"
        
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: self.gmaps.directions(
                origin=origin,
                destination=destination,
                mode="driving",
                departure_time=departure_time or datetime.now(),
                traffic_model="best_guess",
                alternatives=True
            )
        )
        
        # Process routes
        routes = []
        for route in result:
            processed_route = {
                "polyline": route["overview_polyline"]["points"],
                "distance": route["legs"][0]["distance"]["value"],
                "duration": route["legs"][0]["duration"]["value"],
                "duration_in_traffic": route["legs"][0].get("duration_in_traffic", {}).get("value"),
                "steps": self._extract_steps(route["legs"][0]["steps"])
            }
            routes.append(processed_route)
        
        self._cache[cache_key] = routes
        return routes
    
    def _extract_steps(self, steps: List[Dict]) -> List[Dict]:
        """Extract detailed step information"""
        return [{
            "start_location": step["start_location"],
            "end_location": step["end_location"],
            "distance": step["distance"]["value"],
            "duration": step["duration"]["value"],
            "polyline": step["polyline"]["points"],
            "instructions": step.get("html_instructions", "")
        } for step in steps]
    
    async def get_traffic_data(self, bounds: Dict) -> Dict:
        """Get current traffic conditions for an area"""
        # Google doesn't provide direct traffic density API
        # We'll sample routes to estimate traffic
        sample_points = self._generate_sample_points(bounds)
        traffic_data = {}
        
        for i in range(0, len(sample_points) - 1):
            origin = sample_points[i]
            destination = sample_points[i + 1]
            
            route_data = await self.get_route(origin, destination)
            if route_data:
                traffic_ratio = (route_data[0].get("duration_in_traffic", 0) / 
                               route_data[0]["duration"] if route_data[0]["duration"] > 0 else 1)
                
                traffic_data[f"{origin}_{destination}"] = {
                    "congestion_level": min(max(traffic_ratio - 1, 0) * 2, 1),
                    "speed_ratio": 1 / traffic_ratio if traffic_ratio > 0 else 1
                }
        
        return traffic_data
    
    def _generate_sample_points(self, bounds: Dict) -> List[Tuple[float, float]]:
        """Generate grid of sample points for traffic sampling"""
        points = []
        lat_step = (bounds["north"] - bounds["south"]) / 10
        lng_step = (bounds["east"] - bounds["west"]) / 10
        
        for i in range(11):
            for j in range(11):
                lat = bounds["south"] + i * lat_step
                lng = bounds["west"] + j * lng_step
                points.append((lat, lng))
        
        return points

    async def build_road_network(self, center: Tuple[float, float], radius_km: float = 5):
        """Build road network graph from Google Maps data"""
        # Get nearby roads using Places API
        places_result = await self._get_nearby_roads(center, radius_km)
        
        # Build network graph
        for place in places_result:
            # Add intersections as nodes
            self.road_network.add_node(
                place["place_id"],
                lat=place["geometry"]["location"]["lat"],
                lng=place["geometry"]["location"]["lng"],
                type="intersection"
            )
        
        # Connect roads based on routing data
        await self._connect_road_segments()
        
        return self.road_network
    
    async def _get_nearby_roads(self, center: Tuple[float, float], radius_km: float):
        """Get nearby roads and intersections"""
        loop = asyncio.get_event_loop()
        
        # Search for major roads and intersections
        results = await loop.run_in_executor(
            None,
            lambda: self.gmaps.places_nearby(
                location=center,
                radius=radius_km * 1000,
                type="route"
            )
        )
        
        return results.get("results", [])
    
    async def _connect_road_segments(self):
        """Connect road segments based on routing possibility"""
        nodes = list(self.road_network.nodes())
        
        for i, node1 in enumerate(nodes):
            for node2 in nodes[i+1:]:
                # Check if direct route exists
                node1_data = self.road_network.nodes[node1]
                node2_data = self.road_network.nodes[node2]
                
                distance = self._calculate_distance(
                    (node1_data["lat"], node1_data["lng"]),
                    (node2_data["lat"], node2_data["lng"])
                )
                
                # Only connect nearby nodes
                if distance < 1.0:  # 1 km threshold
                    route = await self.get_route(
                        (node1_data["lat"], node1_data["lng"]),
                        (node2_data["lat"], node2_data["lng"])
                    )
                    
                    if route and len(route) > 0:
                        self.road_network.add_edge(
                            node1, node2,
                            distance=route[0]["distance"],
                            duration=route[0]["duration"],
                            polyline=route[0]["polyline"]
                        )
    
    def _calculate_distance(self, coord1: Tuple[float, float], 
                          coord2: Tuple[float, float]) -> float:
        """Calculate distance between two coordinates in km"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth's radius in km
        lat1, lon1 = radians(coord1[0]), radians(coord1[1])
        lat2, lon2 = radians(coord2[0]), radians(coord2[1])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c