import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# === 1. Load & prep ===
df = pd.read_csv("datasets/sf_simulated_traffic.csv", parse_dates=["timestamp"])
road_name = "Market St"
rd = df[df["road_name"] == road_name].sort_values("timestamp").reset_index(drop=True)

# === 2. Determine lags based on available history ===
data_start = rd["timestamp"].min()
last_ts = rd["timestamp"].iloc[-1]
hours_available = int((last_ts - data_start).total_seconds() // 3600)
candidate_lags = [1,2,3,24,168]
lags = [lag for lag in candidate_lags if lag <= hours_available]
if len(lags) < 3:
    raise RuntimeError(f"Need >= {max(candidate_lags)}h of data; have {hours_available}h.")

# === 3. Feature engineering ===
for lag in lags:
    rd[f"lag_{lag}"] = rd["traffic_level"].shift(lag)
rd["hour"] = rd["timestamp"].dt.hour
rd["dow"]  = rd["timestamp"].dt.dayofweek
rd = rd.dropna().reset_index(drop=True)

# === 4. Train/test split & classifier ===
feature_cols = [f"lag_{lag}" for lag in lags] + ["hour","dow"]
X = rd[feature_cols]
y = rd["traffic_level"].astype(int)
Xtr, Xte, ytr, yte = train_test_split(X, y, shuffle=False)

clf = RandomForestClassifier(
    n_estimators=200,
    class_weight="balanced",
    random_state=42
)
clf.fit(Xtr, ytr)
print(classification_report(yte, clf.predict(Xte), digits=3))

# === 5. Build history map ===
history = {row.timestamp: row.traffic_level for row in rd.itertuples()}

# === 6. Recursive forecast function using DataFrame for feature names ===
def forecast(n_hours=168):
    preds = []
    times = []
    # start feature vector from last known row
    last_row = rd.iloc[-1]
    current_feats = last_row[feature_cols].values.astype(float)
    cur_ts = last_ts

    for i in range(1, n_hours+1):
        next_ts = cur_ts + timedelta(hours=1)

        # build a DataFrame so clf sees valid feature names
        feat_dict = dict(zip(feature_cols, current_feats))
        feat_df = pd.DataFrame([feat_dict])

        p = clf.predict(feat_df)[0]
        preds.append(int(p))
        times.append(next_ts)
        history[next_ts] = p

        # slide the window: newlags + time features
        newlags = [p] + list(current_feats[:len(lags)-1])
        current_feats = np.array(newlags + [next_ts.hour, next_ts.dayofweek], dtype=float)
        cur_ts = next_ts

    return pd.DataFrame({"timestamp": times, "predicted": preds})

# === 7. Run forecast & list level-4 times ===
forecast_df = forecast(168)
high4 = forecast_df[forecast_df["predicted"] == 4]["timestamp"]

print("\nPredicted level-4 congestion at:")
if not high4.empty:
    for ts in high4:
        print(ts)
else:
    print(" None")

# (Optional) Save forecast
forecast_df.to_csv("sf_level4_forecast.csv", index=False)
