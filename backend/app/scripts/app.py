#!/usr/bin/env python3
"""
Loads SF traffic data, fetches street network by district or specific street via OSMnx,
trains per-street RandomForest models, predicts traffic levels at a user-specified timestamp,
and dumps a JSON for frontend mapping.
"""
import os, sys, json
import osmnx as ox
import pandas as pd
import numpy as np
from datetime import timedelta
from shapely.geometry import LineString, MultiLineString
from sklearn.ensemble import RandomForestRegressor

# ─── Configuration ─────────────────────────────────────────────────────────────
CSV_PATH = "sf_simulated_traffic.csv"
DEFAULT_DISTRICT = "Mission District, San Francisco, California, USA"
BUFFER_DIST_M = 1500  # buffer in meters around geocoded point

# ─── Load data ─────────────────────────────────────────────────────────────────
if not os.path.exists(CSV_PATH):
    print(f"❌ CSV file not found at {CSV_PATH}", file=sys.stderr)
    sys.exit(1)
print(f"⏳ Loading traffic data from {CSV_PATH}...")
df = pd.read_csv(CSV_PATH, parse_dates=["timestamp"])
available = set(df['road_name'].unique())

# ─── Helper: retrieve edges for a given area ────────────────────────────────────
def get_edges_for_district(district_name):
    pt = ox.geocode(district_name)
    G = ox.graph_from_point(pt, dist=BUFFER_DIST_M, network_type='drive', simplify=True)
    return ox.graph_to_gdfs(G, nodes=False)

def get_edges_for_street(street_name):
    # geocode street name in SF
    query = f"{street_name}, San Francisco, California, USA"
    pt = ox.geocode(query)
    G = ox.graph_from_point(pt, dist=BUFFER_DIST_M, network_type='drive', simplify=True)
    return ox.graph_to_gdfs(G, nodes=False)

# ─── Prompt user for area type ──────────────────────────────────────────────────
area_choice = input("Select area type ([d]istrict or [s]treet): ").strip().lower()
if area_choice in ('d', 'district'):
    area_name = input(f"Enter district name (default: {DEFAULT_DISTRICT}): ").strip() or DEFAULT_DISTRICT
    edges = get_edges_for_district(area_name)
    label = area_name
elif area_choice in ('s', 'street'):
    street_name = input("Enter street name (e.g. Valencia Street): ").strip()
    edges = get_edges_for_street(street_name)
    label = street_name
else:
    print("❌ Invalid choice. Exiting.", file=sys.stderr)
    sys.exit(1)

# ─── Extract and clean street names from edges ──────────────────────────────────
street_names = set()
for name in edges['name']:
    if isinstance(name, list): street_names.update(name)
    elif isinstance(name, str):  street_names.add(name)

# ─── Determine which roads to model ─────────────────────────────────────────────
if area_choice in ('s', 'street'):
    # exact match for single street
    roads = [r for r in available if r.lower() == street_name.lower()]
else:
    # all roads in district
    roads = [r for r in available if r in street_names]

if not roads:
    print(f"❌ No matching streets found for '{label}'.", file=sys.stderr)
    sys.exit(1)
print(f"✅ Found {len(roads)} streets for '{label}'.")

# ─── Train models ──────────────────────────────────────────────────────────────
def train_models(df, roads):
    models, histories, lags_map = {}, {}, {}
    for road in roads:
        rd = df[df['road_name']==road].sort_values('timestamp')
        if rd.shape[0] < 20: continue

        # create time-lag features
        start_ts, last_ts = rd['timestamp'].min(), rd['timestamp'].max()
        max_hr = int((last_ts - start_ts).total_seconds() // 3600)
        candidate = [1,2,3,24]
        lags = [h for h in candidate if h <= max_hr]
        if len(lags) < 2: continue

        for lag in lags:
            rd[f'lag_{lag}'] = rd['traffic_level'].shift(lag)
        rd['hour']      = rd['timestamp'].dt.hour
        rd['dayofweek'] = rd['timestamp'].dt.dayofweek
        rd2 = rd.dropna().reset_index(drop=True)

        X = rd2[[f'lag_{lag}' for lag in lags]+['hour','dayofweek']]
        y = rd2['traffic_level'].astype(int)
        model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
        model.fit(X, y)

        models[road] = model
        histories[road] = {row.timestamp: int(row.traffic_level) for row in rd2.itertuples()}
        lags_map[road]  = lags
    return models, histories, lags_map

# ─── Predict level ─────────────────────────────────────────────────────────────
def predict_level(road, ts, models, histories, lags_map):
    hist = histories[road]
    model, lags = models[road], lags_map[road]
    last = max(hist)
    if ts in hist: return hist[ts]
    curr = last
    while curr < ts:
        nxt = curr + timedelta(hours=1)
        feats = []
        for lag in lags:
            t_lag = nxt - timedelta(hours=lag)
            if t_lag in hist:
                feats.append(hist[t_lag])
            else:
                prev = [t for t in hist if t < t_lag]
                feats.append(hist[max(prev)] if prev else 2)
        feats += [nxt.hour, nxt.dayofweek]
        pred = model.predict(np.array(feats).reshape(1,-1))[0]
        hist[nxt] = int(round(pred))
        curr = nxt
    return hist[ts]

# ─── Dump JSON for frontend ───────────────────────────────────────────────────
def build_predictions_json(ts, models, histories, lags_map, edges):
    out = []
    # prepare cleaned names column
    edges = edges.copy()
    edges['clean_name'] = edges['name'].apply(
        lambda n: ", ".join(n).lower() if isinstance(n,list) else str(n).lower()
    )
    
    for road in models:
        lvl = predict_level(road, ts, models, histories, lags_map)
        # filter segments by name match
        segs = edges[edges['clean_name'].str.contains(road.lower(), na=False)].geometry
        if segs.empty:
            print(f"⚠️ skipping {road}: no geometry.")
            continue
        # pick longest representative segment
        longest = max(segs, key=lambda g: g.length)
        coords  = [[y,x] for x,y in longest.coords]
        out.append({ 'road': road, 'level': lvl, 'path': coords })

    with open('predictions.json','w') as f:
        json.dump(out, f, indent=2)

# ─── Main ──────────────────────────────────────────────────────────────────────
def main():
    models, histories, lags_map = train_models(df, roads)
    if not models:
        print("❌ No models trained. Exiting.", file=sys.stderr)
        sys.exit(1)

    ts_str = input("Enter future timestamp (YYYY-MM-DD HH:MM): ")
    try:
        target_ts = pd.to_datetime(ts_str)
    except:
        print("❌ Invalid timestamp format.", file=sys.stderr)
        sys.exit(1)

    build_predictions_json(target_ts, models, histories, lags_map, edges)
    print(f"✅ Wrote predictions.json for '{label}' at {target_ts}")

if __name__ == '__main__':
    main()
