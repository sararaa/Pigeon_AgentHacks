#!/usr/bin/env python3
# test_api.py - Test the API endpoints

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_simulation_start():
    """Test starting the simulation"""
    print("Testing simulation start...")
    response = requests.post(f"{BASE_URL}/simulation/start")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_spawn_agents():
    """Test spawning agents"""
    print("\nTesting agent spawn...")
    
    # Test with bounds
    data = {
        "count": 5,
        "bounds": {
            "north": 37.7849,
            "south": 37.7649,
            "east": -122.4094,
            "west": -122.4294
        }
    }
    
    response = requests.post(f"{BASE_URL}/agents/spawn", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test with specific origin/destination
    print("\nTesting specific route spawn...")
    data = {
        "count": 1,
        "origin": {"lat": 37.7749, "lng": -122.4194},
        "destination": {"lat": 37.7849, "lng": -122.4094}
    }
    
    response = requests.post(f"{BASE_URL}/agents/spawn", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    return response.status_code == 200

def test_simulation_status():
    """Get simulation status"""
    print("\nChecking simulation status...")
    response = requests.get(f"{BASE_URL}/simulation/status")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_block_road():
    """Test blocking a road"""
    print("\nTesting road block...")
    data = {
        "lat": 37.7749,
        "lng": -122.4194
    }
    
    response = requests.post(f"{BASE_URL}/roads/block", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

if __name__ == "__main__":
    print("Testing Traffic Simulation API")
    print("=" * 40)
    
    # Run tests
    test_simulation_start()
    test_spawn_agents()
    test_simulation_status()
    test_block_road()
    
    print("\n" + "=" * 40)
    print("Tests complete!")