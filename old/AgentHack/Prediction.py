import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.ensemble import RandomForestRegressor
import sys

# === 1. Load your CSV ===
df = pd.read_csv("sf_simulated_traffic.csv", parse_dates=["timestamp"])

# === 2. Select one road (or loop for multiple) ===
road_name = "San Francisco – Oakland Bay Bridge"
road_df = df[df["road_name"] == road_name].sort_values("timestamp").reset_index(drop=True)

# === 3. Determine safe lags ===
data_start = road_df["timestamp"].min()
last_ts = road_df["timestamp"].iloc[-1]
min_lag_hours = int((last_ts - data_start).total_seconds() // 3600)
candidate_lags = [1, 2, 3, 24, 168]
lags = [lag for lag in candidate_lags if lag <= min_lag_hours]
if len(lags) < 3:
    raise RuntimeError(f"Not enough history: need up to {max(candidate_lags)}h, have {min_lag_hours}h.")

# === 4. Feature engineering ===
for lag in lags:
    road_df[f"lag_{lag}"] = road_df["traffic_level"].shift(lag)
road_df["hour"] = road_df["timestamp"].dt.hour
road_df["dayofweek"] = road_df["timestamp"].dt.dayofweek
road_df = road_df.dropna().reset_index(drop=True)

# === 5. Train regressor ===
feature_cols = [f"lag_{lag}" for lag in lags] + ["hour", "dayofweek"]
X_train = road_df[feature_cols].values
y_train = road_df["traffic_level"].astype(int).values
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# === 6. Build history map ===
history = {row.timestamp: row.traffic_level for row in road_df.itertuples()}

def predict_at(target_ts):
    global last_ts, history, model, lags
    if target_ts in history:
        return history[target_ts]
    current_ts = last_ts
    while current_ts < target_ts:
        next_ts = current_ts + timedelta(hours=1)
        feats = []
        for lag in lags:
            lag_ts = next_ts - timedelta(hours=lag)
            if lag_ts in history:
                feats.append(history[lag_ts])
            else:
                known = [ts for ts in history if ts < lag_ts]
                fallback = history[max(known)] if known else 2
                feats.append(fallback)
        feats.append(next_ts.hour)
        feats.append(next_ts.dayofweek)
        pred = model.predict(np.array(feats).reshape(1, -1))[0]
        history[next_ts] = int(round(pred))
        current_ts = next_ts
    return history[target_ts]

# === 7. Interactive prompt ===
if __name__ == "__main__":
    inp = input("Enter future timestamp (YYYY-MM-DD HH:MM): ")
    try:
        target = pd.to_datetime(inp)
    except:
        print("❌ Invalid format. Use YYYY-MM-DD HH:MM")
        sys.exit(1)

    if target <= last_ts:
        print(f"⚠️ {target} is within existing data; showing actual value.")
    level = predict_at(target)
    color_map = {1: "Green", 2: "Orange", 3: "Red", 4: "Dark Red"}
    print(f"🔮 Predicted traffic at {target}: Level {level} ({color_map[level]})")

    # === 8. Print all predicted high-congestion timestamps ===
    high_congestion = sorted(
        ts for ts, lvl in history.items()
        if ts > last_ts and lvl == 4
    )
    if high_congestion:
        print("\n⛔ Predicted high (level 4) congestion at these times:")
        for ts in high_congestion:
            print(ts)
    else:
        print("\n✅ No predicted level-4 congestion in the forecast window.")
