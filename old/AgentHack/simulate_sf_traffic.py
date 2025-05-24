import osmnx as ox
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# 1. Download SF road network
print("📦 Downloading SF road network...")
G = ox.graph_from_place("San Francisco, California, USA", network_type='drive')
edges = ox.graph_to_gdfs(G, nodes=False)

# 2. Define time range
start_time = datetime(2024, 5, 1)
end_time = start_time + timedelta(days=7)
timestamps = pd.date_range(start=start_time, end=end_time, freq='H')

# 3. Simulate traffic levels
def simulate_traffic(hour):
    if 7 <= hour <= 9 or 16 <= hour <= 18:
        return random.choices([2, 3, 4], weights=[0.2, 0.4, 0.4])[0]
    else:
        return random.choices([1, 2, 3], weights=[0.5, 0.4, 0.1])[0]

print("🚦 Simulating traffic data...")
data = []

for _, row in edges.iterrows():
    road_id = row.name
    road_name = row['name'] if isinstance(row['name'], str) else f"Unnamed_{road_id}"
    
    for t in timestamps:
        level = simulate_traffic(t.hour)
        data.append({
            "timestamp": t,
            "road_id": road_id,
            "road_name": road_name,
            "traffic_level": level
        })

df = pd.DataFrame(data)

# 4. Save to CSV
df.to_csv("sf_simulated_traffic.csv", index=False)
print("✅ Traffic data saved to sf_simulated_traffic.csv")
