# test_real_models.py

import pandas as pd
import joblib
import numpy as np

# Load latest log row
logs_df = pd.read_csv("weather_logs_raw.csv")
logs_df = logs_df.sort_values("timestamp_ms")
latest = logs_df.iloc[-1]

feature_cols = [
    "Temperature",
    "Humidity",
    "AQI_Analog",
    "Wind_Analog",
    "Wind_m_s",
    "LDR_Digital",
    "Rain_Digital"
]

X_latest = latest[feature_cols].to_frame().T

# Load trained models
temp_model = joblib.load("real_temp_next_model.pkl")
rain_model = joblib.load("real_rain_next_model.pkl")

# Predict next reading (next log)
temp_pred = temp_model.predict(X_latest)[0]

# ---- Safe rain probability ----
classes = list(rain_model.classes_)

if len(classes) == 2:
    # Normal case: both 0 and 1 seen during training
    proba = rain_model.predict_proba(X_latest)[0]
    # class_ index for "1"
    idx_one = classes.index(1)
    rain_prob = proba[idx_one]
else:
    # Only one class seen (all 0 or all 1 in training)
    only_class = classes[0]
    rain_prob = 1.0 if only_class == 1 else 0.0

print("Current latest reading:")
print(latest[feature_cols])

print(f"\nPredicted Temperature next step: {temp_pred:.2f} °C")
print(f"Chance of rain next step: {rain_prob*100:.1f}%")
