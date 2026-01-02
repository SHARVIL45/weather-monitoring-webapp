# predict_and_push.py
#
# 1) Load latest WeatherLogs data from CSV
# 2) Use trained models to predict next-step temperature & rain probability
# 3) Push prediction to Firebase under /WeatherForecast

import pandas as pd
import joblib
import requests
import time

# --------- CONFIG ---------
FIREBASE_BASE_URL = "https://weather-monitoring-8b62f-default-rtdb.firebaseio.com"
FORECAST_PATH = "/WeatherForecast.json"  # single object
# --------------------------


def main():
    # 1. Load latest log
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

    # 2. Load models
    temp_model = joblib.load("real_temp_next_model.pkl")
    rain_model = joblib.load("real_rain_next_model.pkl")

    # 3. Predict next-step temperature
    temp_pred = float(temp_model.predict(X_latest)[0])

    # 4. Predict rain probability safely (handle single-class case)
    classes = list(rain_model.classes_)
    if len(classes) == 2:
        proba = rain_model.predict_proba(X_latest)[0]
        idx_one = classes.index(1)
        rain_prob = float(proba[idx_one])
    else:
        only_class = classes[0]
        rain_prob = 1.0 if only_class == 1 else 0.0

    # 5. Build payload for Firebase
    payload = {
        "temp_pred_next": temp_pred,                      # °C next step
        "rain_prob_next": rain_prob,                      # 0..1
        "source_timestamp_ms": int(latest["timestamp_ms"]),  # from log
        "generated_at_unix": int(time.time()),            # real time (seconds since epoch)
        "current_temp": float(latest["Temperature"]),
        "current_humidity": float(latest["Humidity"]),
        "current_rain": int(latest["Rain_Digital"])
    }

    print("Prediction payload to send:")
    print(payload)

    # 6. Send to Firebase
    url = FIREBASE_BASE_URL + FORECAST_PATH
    resp = requests.put(url, json=payload)
    print("\nFirebase response status:", resp.status_code)
    print("Response text:", resp.text)


if __name__ == "__main__":
    main()
