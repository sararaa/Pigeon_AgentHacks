#!/usr/bin/env python3
"""
Loads SF traffic data, fetches all streets in the Mission District via OSMnx
(using a buffered point), filters the dataset to those streets, trains a RandomForest per street,
and predicts traffic levels at a user-specified timestamp.
"""
import os
import sys
import osmnx as ox
import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.ensemble import RandomForestRegressor

# ─── Configuration ─────────────────────────────────────────────────────────────
CSV_PATH = "sf_simulated_traffic.csv"
DISTRICT_NAME = "Mission District, San Francisco, California, USA"
BUFFER_DIST_M = 1500  # buffer distance in meters

# ─── Load data ─────────────────────────────────────────────────────────────────
if not os.path.exists(CSV_PATH):
    print(f"❌ CSV file not found at {CSV_PATH}", file=sys.stderr)
    sys.exit(1)

print(f"⏳ Loading traffic data from {CSV_PATH}...")
df = pd.read_csv(CSV_PATH, parse_dates=["timestamp"])

# ─── Fetch street network via buffered point ───────────────────────────────────
print(f"⏳ Geocoding district center: {DISTRICT_NAME}...")
try:
    location_point = ox.geocode(DISTRICT_NAME)
except Exception as e:
    print(f"❌ Could not geocode '{DISTRICT_NAME}': {e}", file=sys.stderr)
    sys.exit(1)

print(f"⏳ Downloading street network within {BUFFER_DIST_M}m of center...")
G = ox.graph_from_point(location_point, dist=BUFFER_DIST_M, network_type='drive', simplify=True)
edges = ox.graph_to_gdfs(G, nodes=False)

# ─── Extract unique street names from OSM edges ────────────────────────────────
street_names = set()
for name in edges['name']:
    if isinstance(name, list):
        street_names.update(name)
    elif isinstance(name, str):
        street_names.add(name)

# ─── Filter dataset to those streets ───────────────────────────────────────────
available = set(df['road_name'].unique())
roads = [r for r in available if r in street_names]
if not roads:
    print("❌ No matching streets found in Mission District buffer.", file=sys.stderr)
    sys.exit(1)
print(f"✅ Found {len(roads)} matching streets in Mission District buffer.")

# ─── Utility: train models ─────────────────────────────────────────────────────
def train_models(df, roads):
    models, histories, lags_map = {}, {}, {}
    for road in roads:
        rd = df[df['road_name'] == road].sort_values('timestamp')
        if rd.shape[0] < 20:
            continue
        # determine safe lags
        start_ts = rd['timestamp'].min()
        last_ts = rd['timestamp'].max()
        max_hours = int((last_ts - start_ts).total_seconds() // 3600)
        candidate_lags = [1, 2, 3, 24]
        lags = [h for h in candidate_lags if h <= max_hours]
        if len(lags) < 2:
            continue
        # feature engineering
        for lag in lags:
            rd[f'lag_{lag}'] = rd['traffic_level'].shift(lag)
        rd['hour'] = rd['timestamp'].dt.hour
        rd['dayofweek'] = rd['timestamp'].dt.dayofweek
        rd2 = rd.dropna().reset_index(drop=True)
        X = rd2[[f'lag_{lag}' for lag in lags] + ['hour', 'dayofweek']].values
        y = rd2['traffic_level'].astype(int).values
        model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
        model.fit(X, y)
        models[road] = model
        histories[road] = {row.timestamp: int(row.traffic_level) for row in rd2.itertuples()}
        lags_map[road] = lags
    return models, histories, lags_map

# ─── Utility: predict level ────────────────────────────────────────────────────
def predict_level(road, target_ts, models, histories, lags_map):
    hist = histories[road]
    model = models[road]
    lags = lags_map[road]
    last_ts = max(hist)
    if target_ts in hist:
        return hist[target_ts]
    current = last_ts
    while current < target_ts:
        nxt = current + timedelta(hours=1)
        feats = []
        for lag in lags:
            ts_lag = nxt - timedelta(hours=lag)
            if ts_lag in hist:
                feats.append(hist[ts_lag])
            else:
                prev = [t for t in hist if t < ts_lag]
                feats.append(hist[max(prev)] if prev else 2)
        feats += [nxt.hour, nxt.dayofweek]
        pred = model.predict(np.array(feats).reshape(1, -1))[0]
        hist[nxt] = int(round(pred))
        current = nxt
    return hist[target_ts]

# ─── Main routine ─────────────────────────────────────────────────────────────
def main():
    print("⏳ Training models... this may take a moment.")
    models, histories, lags_map = train_models(df, roads)
    if not models:
        print("❌ No models trained. Check your data and district.", file=sys.stderr)
        sys.exit(1)
    ts_str = input("Enter future timestamp (YYYY-MM-DD HH:MM): ")
    try:
        target_ts = pd.to_datetime(ts_str)
    except Exception:
        print("❌ Invalid timestamp format.", file=sys.stderr)
        sys.exit(1)
    print(f"\n🔮 Predictions for Mission District buffer at {target_ts}:\n")
    for road in models:
        lvl = predict_level(road, target_ts, models, histories, lags_map)
        print(f"- {road}: Level {lvl}")

if __name__ == "__main__":
    main()
