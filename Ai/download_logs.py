# download_logs.py
#
# Downloads WeatherLogs from Firebase Realtime Database
# and saves them as weather_logs_raw.csv

import requests
import pandas as pd

# Your Firebase Realtime Database URL for WeatherLogs (NO auth)
FIREBASE_URL = "https://weather-monitoring-8b62f-default-rtdb.firebaseio.com/WeatherLogs.json"

def main():
    print("Fetching data from Firebase...")
    r = requests.get(FIREBASE_URL)
    r.raise_for_status()

    data = r.json()

    if not data:
        print("No data found under /WeatherLogs yet.")
        return

    rows = []

    # data is a dict: { "<timestamp_ms>": { Temperature, Humidity, ... } }
    for key, entry in data.items():
        if not isinstance(entry, dict):
            continue
        row = entry.copy()
        row["id"] = key         # keep the key (timestamp string)
        rows.append(row)

    df = pd.DataFrame(rows)

    # sort by timestamp if present
    if "timestamp_ms" in df.columns:
        df = df.sort_values("timestamp_ms")

    out_file = "weather_logs_raw.csv"
    df.to_csv(out_file, index=False)

    print(f"Saved {len(df)} rows to {out_file}")
    print("First few rows:")
    print(df.head())

if __name__ == "__main__":
    main()
