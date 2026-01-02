# train_real_weather_ai.py
#
# Trains models on your real weather_dataset.csv

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
import joblib

# 1. Load prepared dataset
df = pd.read_csv("weather_dataset.csv")
print("Loaded rows for training:", len(df))

if len(df) < 10:
    print("⚠ Dataset is very small; models may be poor. Let system run longer for better data.")
if len(df) < 3:
    raise SystemExit("Not enough data to train. Collect more logs and run prepare_dataset.py again.")

# 2. Features from your logs (no Pressure_hPa because BMP is not working)
feature_cols = [
    "Temperature",
    "Humidity",
    "AQI_Analog",
    "Wind_Analog",
    "Wind_m_s",
    "LDR_Digital",
    "Rain_Digital"
]

X = df[feature_cols]
y_temp = df["Temp_next_1h"]      # label: next reading temp
y_rain = df["Rain_next_1h"]      # label: next reading rain 0/1

# 3. Train / test split (if enough data)
if len(df) >= 20:
    X_train, X_test, y_temp_train, y_temp_test = train_test_split(
        X, y_temp, test_size=0.2, random_state=42
    )
    _, _, y_rain_train, y_rain_test = train_test_split(
        X, y_rain, test_size=0.2, random_state=42
    )
else:
    # Use all data for training, skip test metrics
    X_train, y_temp_train, y_rain_train = X, y_temp, y_rain
    X_test = y_temp_test = y_rain_test = None

# 4. Train temperature regression model
temp_model = LinearRegression()
temp_model.fit(X_train, y_temp_train)

# 5. Train rain classification model
rain_model = RandomForestClassifier(n_estimators=100, random_state=42)
rain_model.fit(X_train, y_rain_train)

# 6. Evaluate (only if we have a test set)
if X_test is not None:
    print("\n--- Model Performance (rough) ---")
    print("Temp model R^2:", temp_model.score(X_test, y_temp_test))
    print("Rain model accuracy:", rain_model.score(X_test, y_rain_test))
else:
    print("\nNot enough data for a proper test split; trained on all rows.")

# 7. Save models to disk
joblib.dump(temp_model, "real_temp_next_model.pkl")
joblib.dump(rain_model, "real_rain_next_model.pkl")

print("\n✅ Saved models:")
print(" - real_temp_next_model.pkl")
print(" - real_rain_next_model.pkl")
