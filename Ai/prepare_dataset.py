# prepare_dataset.py
#
# Loads weather_logs_raw.csv
# Creates Temp_next_1h and Rain_next_1h columns
# Saves weather_dataset.csv

import pandas as pd

# Load raw log data
df = pd.read_csv("weather_logs_raw.csv")

print("Loaded rows:", len(df))
print(df.head())

# Sort by time (just to ensure order)
df = df.sort_values("timestamp_ms").reset_index(drop=True)

# 5-min logging -> 1 hour = 12 steps
STEP_AHEAD = 1  # change to match your interval

# Create shifted columns
df["Temp_next_1h"] = df["Temperature"].shift(-STEP_AHEAD)
df["Rain_next_1h"] = df["Rain_Digital"].shift(-STEP_AHEAD)

# Drop rows that no longer have labels (at bottom)
df_clean = df.dropna().reset_index(drop=True)

print("\nAfter adding labels:")
print(df_clean.head())

# Save final dataset
df_clean.to_csv("weather_dataset.csv", index=False)
print("\nSaved dataset to weather_dataset.csv")
print("Rows ready for training:", len(df_clean))
