# Python ML Weather Prediction Integration Guide

This guide will help you integrate your Python ML weather prediction model with the React weather monitoring app.

## Overview

The app includes an ML prediction component that fetches weather forecasts from your Python ML backend. The component expects hourly predictions for the next 24 hours.

## Architecture

```
React Frontend (Port 3000)
    ↓ HTTP POST Request
Python ML Backend (Port 5000)
    ↓ ML Model Prediction
Response with Predictions
```

## Step 1: Python Backend Setup

### Option A: Flask Backend (Recommended for Simple APIs)

Create a file `ml_backend.py`:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import pickle  # or joblib if you prefer

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load your trained ML model
# Replace this with your actual model loading code
try:
    # Example: model = pickle.load(open('weather_model.pkl', 'rb'))
    model = None  # Replace with your actual model
    scaler = None  # Replace with your actual scaler if needed
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    scaler = None

@app.route('/api/predict', methods=['POST'])
def predict_weather():
    try:
        data = request.get_json()
        current_data = data.get('current_data')
        prediction_hours = data.get('prediction_hours', 24)
        
        if not current_data:
            return jsonify({'error': 'Missing current_data'}), 400
        
        # Extract current weather parameters
        temperature = current_data.get('temperature')
        humidity = current_data.get('humidity')
        pressure = current_data.get('pressure')
        wind_speed = current_data.get('windSpeed')
        aqi = current_data.get('aqi')
        rainfall = current_data.get('rainfall')
        light = current_data.get('light')
        
        # Generate predictions for next 24 hours
        predictions = []
        
        for hour in range(1, prediction_hours + 1):
            # Calculate timestamp
            prediction_time = datetime.now() + timedelta(hours=hour)
            
            # REPLACE THIS WITH YOUR ACTUAL ML MODEL PREDICTION
            # Example format for your model input:
            # features = np.array([[temperature, humidity, pressure, wind_speed, 
            #                       aqi, rainfall, light, hour_of_day, day_of_week]])
            # 
            # If using scaler:
            # features_scaled = scaler.transform(features)
            # 
            # Make prediction:
            # prediction = model.predict(features_scaled)
            
            # For demonstration, this generates mock predictions
            # REPLACE with your actual model predictions
            hour_of_day = prediction_time.hour
            
            # Example: Simple linear trend + noise (REPLACE WITH YOUR MODEL)
            temp_pred = temperature + np.sin(hour / 6) * 3 + np.random.normal(0, 0.5)
            humidity_pred = humidity + np.cos(hour / 5) * 5 + np.random.normal(0, 1)
            pressure_pred = pressure + np.random.normal(0, 0.5)
            wind_pred = max(0, wind_speed + np.random.normal(0, 1))
            rainfall_pred = max(0, np.random.exponential(0.5) if np.random.random() < 0.2 else 0)
            aqi_pred = max(0, aqi + np.random.normal(0, 5))
            light_pred = (400 + np.random.uniform(0, 600)) if 6 <= hour_of_day <= 18 else np.random.uniform(0, 50)
            
            # Calculate confidence score (optional)
            # You can calculate this based on model uncertainty, validation accuracy, etc.
            confidence = 0.85 + np.random.uniform(-0.1, 0.1)
            
            predictions.append({
                'timestamp': prediction_time.isoformat(),
                'temperature': float(temp_pred),
                'humidity': float(humidity_pred),
                'pressure': float(pressure_pred),
                'windSpeed': float(wind_pred),
                'rainfall': float(rainfall_pred),
                'aqi': float(aqi_pred),
                'light': float(light_pred),
                'confidence': float(confidence)
            })
        
        # Return predictions with model info
        response = {
            'predictions': predictions,
            'model_info': {
                'name': 'Weather Prediction Model',  # Your model name
                'version': '1.0',
                'accuracy': 0.87,  # Your model's validation accuracy
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/model-info', methods=['GET'])
def get_model_info():
    """Optional endpoint to get model information"""
    return jsonify({
        'model_name': 'Weather Prediction Model',
        'version': '1.0',
        'accuracy': 0.87,
        'features': ['temperature', 'humidity', 'pressure', 'windSpeed', 'aqi', 'rainfall', 'light'],
        'prediction_horizon': '24 hours'
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### Option B: FastAPI Backend (Modern, Async)

Create a file `ml_backend_fastapi.py`:

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from datetime import datetime, timedelta
import pickle

app = FastAPI(title="Weather ML API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your model
try:
    # model = pickle.load(open('weather_model.pkl', 'rb'))
    model = None
    scaler = None
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    scaler = None

# Pydantic models for request/response
class CurrentWeatherData(BaseModel):
    temperature: float
    humidity: float
    pressure: float
    windSpeed: float
    aqi: int
    rainfall: float
    light: float

class PredictionRequest(BaseModel):
    current_data: CurrentWeatherData
    prediction_hours: int = 24

class WeatherPrediction(BaseModel):
    timestamp: str
    temperature: float
    humidity: float
    pressure: float
    windSpeed: float
    rainfall: float
    aqi: float
    light: float
    confidence: float

class ModelInfo(BaseModel):
    name: str
    version: str
    accuracy: float

class PredictionResponse(BaseModel):
    predictions: List[WeatherPrediction]
    model_info: ModelInfo

@app.post("/api/predict", response_model=PredictionResponse)
async def predict_weather(request: PredictionRequest):
    try:
        current = request.current_data
        predictions = []
        
        for hour in range(1, request.prediction_hours + 1):
            prediction_time = datetime.now() + timedelta(hours=hour)
            
            # REPLACE WITH YOUR ACTUAL ML MODEL PREDICTION
            hour_of_day = prediction_time.hour
            
            # Mock predictions (REPLACE with your model)
            temp_pred = current.temperature + np.sin(hour / 6) * 3 + np.random.normal(0, 0.5)
            humidity_pred = current.humidity + np.cos(hour / 5) * 5 + np.random.normal(0, 1)
            pressure_pred = current.pressure + np.random.normal(0, 0.5)
            wind_pred = max(0, current.windSpeed + np.random.normal(0, 1))
            rainfall_pred = max(0, np.random.exponential(0.5) if np.random.random() < 0.2 else 0)
            aqi_pred = max(0, current.aqi + np.random.normal(0, 5))
            light_pred = (400 + np.random.uniform(0, 600)) if 6 <= hour_of_day <= 18 else np.random.uniform(0, 50)
            
            confidence = 0.85 + np.random.uniform(-0.1, 0.1)
            
            predictions.append(WeatherPrediction(
                timestamp=prediction_time.isoformat(),
                temperature=float(temp_pred),
                humidity=float(humidity_pred),
                pressure=float(pressure_pred),
                windSpeed=float(wind_pred),
                rainfall=float(rainfall_pred),
                aqi=float(aqi_pred),
                light=float(light_pred),
                confidence=float(confidence)
            ))
        
        return PredictionResponse(
            predictions=predictions,
            model_info=ModelInfo(
                name="Weather Prediction Model",
                version="1.0",
                accuracy=0.87
            )
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/model-info")
async def get_model_info():
    return {
        "model_name": "Weather Prediction Model",
        "version": "1.0",
        "accuracy": 0.87,
        "features": ["temperature", "humidity", "pressure", "windSpeed", "aqi", "rainfall", "light"],
        "prediction_horizon": "24 hours"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
```

## Step 2: Install Dependencies

### For Flask:
```bash
pip install flask flask-cors numpy pandas scikit-learn
```

### For FastAPI:
```bash
pip install fastapi uvicorn numpy pandas scikit-learn pydantic
```

## Step 3: Run Your Python Backend

### Flask:
```bash
python ml_backend.py
```

### FastAPI:
```bash
python ml_backend_fastapi.py
# or
uvicorn ml_backend_fastapi:app --reload --port 5000
```

Your API should now be running at `http://localhost:5000`

## Step 4: Update React Frontend

The React component is already configured to connect to `http://localhost:5000/api/predict`. 

If your Python backend runs on a different URL/port, update the constant in `/components/MLWeatherPrediction.tsx`:

```typescript
const PYTHON_ML_API_URL = "http://your-backend-url:port/api/predict";
```

## Step 5: Test the Integration

1. Start your Python backend (step 3)
2. Start your React app (`npm run dev` or `npm start`)
3. The ML predictions should automatically load
4. Click the refresh button to manually fetch new predictions

## Example ML Model Integration

Here's how to integrate a scikit-learn model:

```python
import pickle
import numpy as np
from sklearn.preprocessing import StandardScaler

# Load your trained model and scaler
model = pickle.load(open('weather_model.pkl', 'rb'))
scaler = pickle.load(open('scaler.pkl', 'rb'))

def predict_next_hour(current_data):
    # Prepare features
    features = np.array([[
        current_data['temperature'],
        current_data['humidity'],
        current_data['pressure'],
        current_data['windSpeed'],
        current_data['aqi'],
        current_data['rainfall'],
        current_data['light'],
        datetime.now().hour,  # hour of day
        datetime.now().weekday(),  # day of week
    ]])
    
    # Scale features
    features_scaled = scaler.transform(features)
    
    # Make prediction
    prediction = model.predict(features_scaled)
    
    # prediction might be [temp, humidity, pressure, wind, rainfall, aqi, light]
    return {
        'temperature': prediction[0][0],
        'humidity': prediction[0][1],
        'pressure': prediction[0][2],
        'windSpeed': prediction[0][3],
        'rainfall': prediction[0][4],
        'aqi': prediction[0][5],
        'light': prediction[0][6],
    }
```

## Advanced: Model Types

### Time Series Models (LSTM, ARIMA)

```python
import tensorflow as tf
from tensorflow import keras

# Load LSTM model
model = keras.models.load_model('lstm_weather_model.h5')

def prepare_sequence(current_data, history_length=24):
    # Prepare sequence of past data points
    # This requires storing historical data
    sequence = []  # Your historical data processing
    return np.array(sequence).reshape(1, history_length, num_features)

def predict_with_lstm(current_data):
    sequence = prepare_sequence(current_data)
    predictions = model.predict(sequence)
    return predictions
```

### Ensemble Models

```python
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

# Load multiple models
rf_model = pickle.load(open('rf_model.pkl', 'rb'))
gb_model = pickle.load(open('gb_model.pkl', 'rb'))

def ensemble_predict(features):
    rf_pred = rf_model.predict(features)
    gb_pred = gb_model.predict(features)
    
    # Average predictions
    final_pred = (rf_pred + gb_pred) / 2
    
    # Calculate confidence based on agreement
    confidence = 1 - abs(rf_pred - gb_pred) / max(abs(rf_pred), abs(gb_pred))
    
    return final_pred, confidence
```

## Confidence Score Calculation

```python
def calculate_confidence(prediction, historical_accuracy, uncertainty):
    """
    Calculate prediction confidence score
    
    Args:
        prediction: Model prediction
        historical_accuracy: Model's historical accuracy (0-1)
        uncertainty: Prediction uncertainty/variance
    
    Returns:
        confidence: Score between 0 and 1
    """
    # Base confidence on historical accuracy
    base_confidence = historical_accuracy
    
    # Reduce confidence based on uncertainty
    uncertainty_penalty = min(uncertainty / 10, 0.3)  # Cap at 0.3
    
    # Calculate final confidence
    confidence = max(0.1, base_confidence - uncertainty_penalty)
    
    return confidence
```

## Production Deployment

### Using Docker

Create `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "ml_backend.py"]
```

Build and run:
```bash
docker build -t weather-ml-api .
docker run -p 5000:5000 weather-ml-api
```

### Environment Variables

```python
import os

# Use environment variables for configuration
PORT = int(os.getenv('PORT', 5000))
MODEL_PATH = os.getenv('MODEL_PATH', 'weather_model.pkl')
DEBUG = os.getenv('DEBUG', 'False') == 'True'

app.run(host='0.0.0.0', port=PORT, debug=DEBUG)
```

### Deploy on Cloud

#### Heroku:
```bash
heroku create your-weather-ml-api
git push heroku main
```

#### AWS/GCP/Azure:
- Use their container services (ECS, Cloud Run, Container Apps)
- Or serverless functions (Lambda, Cloud Functions)

## Troubleshooting

### CORS Errors

Add to Flask:
```python
from flask_cors import CORS
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})
```

### Model Loading Issues

```python
import joblib

# Try different loading methods
try:
    model = pickle.load(open('model.pkl', 'rb'))
except:
    try:
        model = joblib.load('model.pkl')
    except Exception as e:
        print(f"Error: {e}")
```

### Memory Issues with Large Models

```python
# Lazy load model
_model = None

def get_model():
    global _model
    if _model is None:
        _model = pickle.load(open('model.pkl', 'rb'))
    return _model
```

## Performance Optimization

### Caching Predictions

```python
from functools import lru_cache
from datetime import datetime

@lru_cache(maxsize=100)
def cached_predict(features_tuple, timestamp_hour):
    # Convert tuple back to features
    features = np.array([features_tuple])
    return model.predict(features)
```

### Async Processing

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=4)

@app.route('/api/predict', methods=['POST'])
async def predict_weather():
    loop = asyncio.get_event_loop()
    predictions = await loop.run_in_executor(
        executor, 
        run_ml_model, 
        current_data
    )
    return jsonify(predictions)
```

## Testing Your API

### Using curl:
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "current_data": {
      "temperature": 22.5,
      "humidity": 65,
      "pressure": 1013.2,
      "windSpeed": 12.5,
      "aqi": 42,
      "rainfall": 0,
      "light": 850
    },
    "prediction_hours": 24
  }'
```

### Using Python requests:
```python
import requests

response = requests.post('http://localhost:5000/api/predict', json={
    'current_data': {
        'temperature': 22.5,
        'humidity': 65,
        'pressure': 1013.2,
        'windSpeed': 12.5,
        'aqi': 42,
        'rainfall': 0,
        'light': 850
    },
    'prediction_hours': 24
})

print(response.json())
```

## Best Practices

1. ✅ **Validate input data** before making predictions
2. ✅ **Handle model errors gracefully** with fallback responses
3. ✅ **Log predictions** for monitoring and improvement
4. ✅ **Version your models** (include version in response)
5. ✅ **Monitor API performance** (response time, error rate)
6. ✅ **Implement rate limiting** to prevent abuse
7. ✅ **Use proper error codes** (400 for bad input, 500 for server errors)
8. ✅ **Keep models updated** regularly with new training data

## Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [scikit-learn Model Persistence](https://scikit-learn.org/stable/model_persistence.html)
- [TensorFlow Model Deployment](https://www.tensorflow.org/tfx/guide/serving)

---

**Need Help?**
- Check API logs for errors
- Verify CORS is properly configured
- Ensure model file paths are correct
- Test API endpoints with curl/Postman first

**Last Updated**: December 2024
