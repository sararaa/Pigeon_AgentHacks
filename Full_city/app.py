import os
import json
import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.ensemble import RandomForestRegressor
import googlemaps

CSV_PATH = "sf_simulated_traffic.csv"
API_KEY  = "AIzaSyAoH0FX8uQBoOHRIUnghIJBQUaNF-Bw-uQ"
if not API_KEY:
    print("Please set GOOGLE_MAPS_API_KEY in your env and rerun.")
    exit(1)

# ─── 1) load data ───────────────────────────────────────────────────────────────
df = pd.read_csv(CSV_PATH, parse_dates=["timestamp"])
roads = df["road_name"].unique()[:5] 

# ─── 2) train one RF per road & build history ────────────────────────────────────
models, histories, lags_by_road = {}, {}, {}
for road in roads:
    rd = df[df["road_name"] == road].sort_values("timestamp")
    print(f"⏳ Training on: {road}")
    if rd.shape[0] < 10:
        continue

    data_start, last_ts = rd["timestamp"].min(), rd["timestamp"].max()
    max_h = int((last_ts - data_start).total_seconds()//3600)
    lags = [h for h in (1,2,3,24,168) if h <= max_h]
    if len(lags) < 3:
        continue

    # create lag features
    for lag in lags:
        rd[f"lag_{lag}"] = rd["traffic_level"].shift(lag)
    rd["hour"]      = rd["timestamp"].dt.hour
    rd["dayofweek"] = rd["timestamp"].dt.dayofweek
    rd2 = rd.dropna()

    X = rd2[[f"lag_{lag}" for lag in lags] + ["hour","dayofweek"]].values
    y = rd2["traffic_level"].astype(int).values
    model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
    model.fit(X, y)

    models[road]         = model
    lags_by_road[road]   = lags
    histories[road]      = {row.timestamp: int(row.traffic_level)
                            for row in rd2.itertuples()}


def predict_level(road, target):
    hist  = histories[road]
    model = models[road]
    lags  = lags_by_road[road]
    last  = max(hist)
    if target in hist:
        return hist[target]

    cur = last
    while cur < target:
        nxt = cur + timedelta(hours=1)
        feats = []
        for lag in lags:
            ts_lag = nxt - timedelta(hours=lag)
            if ts_lag in hist:
                feats.append(hist[ts_lag])
            else:
                prev = [t for t in hist if t < ts_lag]
                feats.append(hist[max(prev)] if prev else 2)
        feats += [nxt.hour, nxt.dayofweek]
        p = model.predict(np.array(feats).reshape(1,-1))[0]
        hist[nxt] = int(round(p))
        cur = nxt
    return hist[target]

# ─── 3) geocode each road ───────────────────────────────────────────────────────
gmaps = googlemaps.Client(key=API_KEY)
road_coords = {}
for road in models:
    res = gmaps.geocode(f"{road}, San Francisco, CA")
    if res:
        loc = res[0]["geometry"]["location"]
        road_coords[road] = (loc["lat"], loc["lng"])

# ─── 4) ask user for timestamp & predict ────────────────────────────────────────
ts_input = input("Enter future timestamp (YYYY-MM-DD HH:MM): ")
try:
    target = pd.to_datetime(ts_input)
except:
    print("❌ bad format")
    exit(1)

out = []
for road in models:
    lvl = predict_level(road, target)
    coord = road_coords.get(road)
    if coord:
        out.append({
            "road":  road,
            "lat":   coord[0],
            "lng":   coord[1],
            "level": lvl
        })

# ─── 5) emit static HTML ────────────────────────────────────────────────────────
html = f"""<!DOCTYPE html>
<html>
  <head>
    <title>Traffic Predictions @ {target}</title>
    <style>#map {{ height:100vh; width:100%; }}</style>
    <script
      src="https://maps.googleapis.com/maps/api/js?key={API_KEY}&callback=initMap"
      async defer></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      function initMap() {{
        const map = new google.maps.Map(document.getElementById('map'), {{
          center: {{ lat: 37.7749, lng: -122.4194 }},
          zoom: 13
        }});
        new google.maps.TrafficLayer().setMap(map);

        const data = {json.dumps(out)};
        const colors = {{1:'green',2:'orange',3:'red',4:'darkred'}};

        data.forEach(pt => {{
          new google.maps.Circle({{
            map,
            center: {{ lat: pt.lat, lng: pt.lng }},
            radius: 80,
            strokeColor: colors[pt.level],
            fillColor:   colors[pt.level],
            fillOpacity: 0.4,
            strokeWeight: 2
          }});
        }});
      }}
    </script>
  </body>
</html>
"""

with open("output.html","w") as f:
    f.write(html)

print("✅ Wrote output.html — open it in your browser to see the map.")
