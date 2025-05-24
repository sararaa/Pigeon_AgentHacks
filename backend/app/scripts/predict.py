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
from google import genai


# ─── Configuration ─────────────────────────────────────────────────────────────
CSV_PATH = "datasets/sf_simulated_traffic.csv"
DISTRICT_NAME = "Mission District, San Francisco, California, USA"
BUFFER_DIST_M = 500  # buffer distance in meters
GEMINI_KEY = "AIzaSyDSyIBzIJ9yVnXYd6sJaE7oZ0Vqnc4kEPM"
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

def generate_summary(info_for_model):
    # Create an instance of the Google GenAI API client
    client = genai.Client(api_key=GEMINI_KEY)
    #gemini-2.0-flash is also a really good option, but does have lower RPD and other dimension limits.
    model = "gemma-3-27b-it" # There are a LOT of models to choose from. But in my experience, I feel comfortable with AND use 2.0-flash the most. Will look into 2.5 series once they go through stable release.
    # the gemma 3 model here can process 10K+ requests a day, which is really good for this 
    # specific contex because, as you saw, our dataset has 10K entries, which equates to 10K requests for this dataset.
    template_prompt = f"""This is some information we got from the result of a traffic prediction model making predictions for different streets in Mission District, San Francisco. 
    For each street, there are 4 possible levels of traffic: 1, 2, 3 and 4. 4 is the worst traffic level, and 1 is the best.
    The traffic levels are based on the amount of traffic in the area.
    
    Please generate a written verbal summary of the traffic levels for each street, that is intended for any human audience to be able to read.
    It simply has to be informative. Do not directly mention the levels of 1, 2, 3 or 4 at all. These are not userfacing details. Do not mention the levels at all. 
    You can feel free to replace them with words like "extremely congested", "free-flowing", "light traffic", "packed", etc.
    I will give you the information you have to use to generate this summary. Here is the information:
    {info_for_model}

    \n\n
    Cut straight to the point, and don't add any fluff or anything else, like "as of...", or mention the day at all. Just the summary.
    Start with a general gist or overall view for the whole district (assume that all streets mentioned are in the Mission District).
    For some of them, mention some potential consequences of the traffic levels, like "or you can do construction in this area" OR OTHER THINGS
    or even something humourous like "this area is going to be a parking lot" or "this area is going to be packed.". 
    Obviously don't use "this area." Try to be as funny as possible.
    
    If there are A LOT of streets with the same traffic level, you can just say "there are a lot of streets with traffic level X" and then mention a maximum of 3 of those streets by name. This is the most important rule for you to follow."""

    prompt = template_prompt

    response = client.models.generate_content(
                model=model, contents=prompt
    )
    model_output = response.text
    with open("Full_city/model_output.txt", "w") as f:
        f.write(model_output)
    return model_output
        
# ─── Main routine ─────────────────────────────────────────────────────────────
def main():
    """
    Main entry point for the traffic prediction application.
    Returns a written text summary of the traffic levels for each street in the Mission District
    at a user-specified timestamp.
    """
    print("⏳ Training models... this may take a moment.")
    info_for_model = ""
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
        info_for_model += f"{road} has a traffic level of {lvl} at {target_ts.strftime('%Y-%m-%d %H:%M')}\n"
    model_response = generate_summary(info_for_model)
    print("\n✅ Summary generated.")
    return model_response

if __name__ == "__main__":
    main()


    