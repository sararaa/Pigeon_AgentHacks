#!/usr/bin/env python3
"""
Loads SF traffic data, fetches all streets in the Mission District via OSMnx
(using a buffered point), filters the dataset to those streets, trains a RandomForest per street,
and predicts traffic levels at a user-specified timestamp.
"""
import os, sys, json
import osmnx as ox
import pandas as pd
import numpy as np
from datetime import timedelta
from shapely.geometry import LineString, MultiLineString
from sklearn.ensemble import RandomForestRegressor
from google import genai
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Configuration ─────────────────────────────────────────────────────────────
CSV_PATH = "sf_simulated_traffic.csv"
DISTRICT_NAME = "Mission District, San Francisco, California, USA"
BUFFER_DIST_M = 500  # buffer distance in meters
DEFAULT_DISTRICT = "Mission District, San Francisco, California, USA"
DEFAULT_STREET = "Folsom Street"
GEMINI_KEY = "AIzaSyDSyIBzIJ9yVnXYd6sJaE7oZ0Vqnc4kEPM"
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
def build_predictions_json(ts, models, histories, lags_map, edges) -> dict:
    """
    Return the dictionary thats written as the json too.
    """
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
    ret = json.dumps(out, indent=4)
    with open('predictions.json','w') as f:
        f.write(ret)
    return out


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
    I will give you the information you have to use to generate this summary. It will be in JSON format. There are objects in the json with key 'path', please refrain from mentioning those when writing your summaries."
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
    with open("app/scripts/model_output.txt", "w") as f:
        f.write(model_output)
    return model_output
        
        
        
        
# ─── Main routine ─────────────────────────────────────────────────────────────
def run_prediction_pipeline(area_type: str, area_name: str, ts_str: str) -> str:
    """
    Main entry point for the traffic prediction application.
    Returns a written text summary of the traffic levels for each street in the Mission District
    at a user-specified timestamp.
    """
    # ─── Load data ─────────────────────────────────────────────────────────────────
    if not os.path.exists(CSV_PATH):
        print(f"❌ CSV file not found at {CSV_PATH}", file=sys.stderr)
        sys.exit(1)
    print(f"⏳ Loading traffic data from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH, parse_dates=["timestamp"])
    available = set(df['road_name'].unique())

    # ─── Prompt user for area type ──────────────────────────────────────────────────
    area_choice = area_type.strip().lower()
    if area_choice in ('d', 'district'):
        area_name = area_name if area_name != "" else DEFAULT_DISTRICT
        edges = get_edges_for_district(area_name)
        label = area_name
    elif area_choice in ('s', 'street'):
        street_name = area_name if area_name != "" else DEFAULT_STREET
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
    
    models, histories, lags_map = train_models(df, roads)
    if not models:
        print("❌ No models trained. Exiting.", file=sys.stderr)
        sys.exit(1)

    try:
        target_ts = pd.to_datetime(ts_str)
    except:
        print("❌ Invalid timestamp format.", file=sys.stderr)
        sys.exit(1)

    json_out : dict = build_predictions_json(target_ts, models, histories, lags_map, edges)
    print(f"✅ Wrote predictions.json for '{label}' at {target_ts}")
    model_response = generate_summary(json_out)
    print(model_response)
    logger.info(model_response)
    sys.stdout.flush()
    return {
        "summary": model_response,
        "predictions" : json_out
    }


    