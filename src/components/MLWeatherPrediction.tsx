import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Activity,
  Lightbulb,
  TrendingUp,
  RefreshCw,
  Brain,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts@2.15.2";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

interface MLPrediction {
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  rainfall: number;
  aqi: number;
  light: number;
  confidence: number;
}

interface MLWeatherPredictionProps {
  currentWeatherData: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    aqi: number;
    rainfall: number;
    light: number;
  };
}

export function MLWeatherPrediction({ currentWeatherData }: MLWeatherPredictionProps) {
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [modelInfo, setModelInfo] = useState({
    name: "Weather ML Model",
    accuracy: 0,
    version: "1.0",
  });

  const fetchPredictions = async () => {
    setIsLoading(true);

    try {
      // TODO: Replace with your actual Python ML backend URL
      const PYTHON_ML_API_URL = "http://localhost:5000/api/predict";
      
      const response = await fetch(PYTHON_ML_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_data: currentWeatherData,
          prediction_hours: 24, // Request 24-hour predictions
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      setPredictions(data.predictions);
      if (data.model_info) {
        setModelInfo(data.model_info);
      }
      setLastUpdated(new Date());
      setError(null);
      setIsConnected(true);
    } catch (err) {
      // Silently fall back to demo mode on first load
      // Only show connection status, not error message
      setIsConnected(false);
      
      // Generate mock predictions for demo
      const mockPredictions = generateMockPredictions(currentWeatherData);
      setPredictions(mockPredictions);
      setLastUpdated(new Date());
      setModelInfo({
        name: "Demo ML Model",
        accuracy: 0.85,
        version: "1.0 (Demo)",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
    
    // Auto-refresh predictions every 10 minutes
    const interval = setInterval(fetchPredictions, 600000);
    return () => clearInterval(interval);
  }, [currentWeatherData]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-500";
    if (confidence >= 0.6) return "text-yellow-500";
    return "text-orange-500";
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  // Get next hour prediction for display cards
  const nextHourPrediction = predictions.length > 0 ? predictions[0] : null;

  return (
    <div className="space-y-6">
      {/* Header with Model Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-500" />
              <div>
                <CardTitle>ML Weather Predictions</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  AI-powered forecasts from your Python ML model
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isConnected && (
                <Badge variant="outline" className="gap-1 text-amber-600 border-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  Demo Mode
                </Badge>
              )}
              {isConnected && (
                <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                  <Activity className="h-3 w-3" />
                  Connected
                </Badge>
              )}
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {modelInfo.name} v{modelInfo.version}
              </Badge>
              {modelInfo.accuracy > 0 && (
                <Badge variant="secondary">
                  Accuracy: {(modelInfo.accuracy * 100).toFixed(1)}%
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPredictions}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Connection Info for Demo Mode */}
      {!isConnected && (
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertDescription>
            Running in demo mode with simulated predictions. To connect your Python ML model, see{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/python-ml-integration-guide.md</code>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Next Hour Prediction Cards */}
      {nextHourPrediction && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2">
              Next Hour Prediction
            </h3>
            <Badge
              variant="outline"
              className={getConfidenceColor(nextHourPrediction.confidence)}
            >
              Confidence: {getConfidenceBadge(nextHourPrediction.confidence)} (
              {(nextHourPrediction.confidence * 100).toFixed(0)}%)
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Temperature Prediction */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="text-2xl">
                      {nextHourPrediction.temperature.toFixed(1)}°C
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: {currentWeatherData.temperature.toFixed(1)}°C
                    </p>
                  </div>
                  <Thermometer className="h-8 w-8 text-orange-500" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    {nextHourPrediction.temperature > currentWeatherData.temperature ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">
                          +{(nextHourPrediction.temperature - currentWeatherData.temperature).toFixed(1)}°
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3 w-3 text-blue-500 rotate-180" />
                        <span className="text-blue-500">
                          {(nextHourPrediction.temperature - currentWeatherData.temperature).toFixed(1)}°
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Humidity Prediction */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                    <p className="text-2xl">
                      {nextHourPrediction.humidity.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: {currentWeatherData.humidity.toFixed(0)}%
                    </p>
                  </div>
                  <Droplets className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    {nextHourPrediction.humidity > currentWeatherData.humidity ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-blue-500" />
                        <span className="text-blue-500">
                          +{(nextHourPrediction.humidity - currentWeatherData.humidity).toFixed(0)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3 w-3 text-orange-500 rotate-180" />
                        <span className="text-orange-500">
                          {(nextHourPrediction.humidity - currentWeatherData.humidity).toFixed(0)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rainfall Prediction */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rainfall</p>
                    <p className="text-2xl">
                      {nextHourPrediction.rainfall.toFixed(1)} mm
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: {currentWeatherData.rainfall.toFixed(1)} mm
                    </p>
                  </div>
                  <CloudRain className="h-8 w-8 text-indigo-500" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    {nextHourPrediction.rainfall > 0 ? (
                      <span className="text-blue-500">Rain expected</span>
                    ) : (
                      <span className="text-muted-foreground">No rain</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AQI Prediction */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AQI</p>
                    <p className="text-2xl">{Math.round(nextHourPrediction.aqi)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: {currentWeatherData.aqi}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    {nextHourPrediction.aqi <= 50 ? (
                      <span className="text-green-500">Good</span>
                    ) : nextHourPrediction.aqi <= 100 ? (
                      <span className="text-yellow-500">Moderate</span>
                    ) : (
                      <span className="text-orange-500">Unhealthy</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 24-Hour Prediction Charts */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>24-Hour ML Predictions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Hourly forecasts generated by your ML model
              {lastUpdated && (
                <span> • Last updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Temperature Chart */}
              <div>
                <h4 className="text-sm mb-4">Temperature Forecast</h4>
                <ChartContainer
                  config={{
                    temperature: {
                      label: "Temperature (°C)",
                      color: "#f97316",
                    },
                  }}
                  className="h-[250px] w-full"
                >
                  <LineChart data={predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.getHours() + ":00";
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>

              {/* Humidity Chart */}
              <div>
                <h4 className="text-sm mb-4">Humidity Forecast</h4>
                <ChartContainer
                  config={{
                    humidity: {
                      label: "Humidity (%)",
                      color: "#3b82f6",
                    },
                  }}
                  className="h-[250px] w-full"
                >
                  <LineChart data={predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.getHours() + ":00";
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>

              {/* Rainfall Chart */}
              <div>
                <h4 className="text-sm mb-4">Rainfall Forecast</h4>
                <ChartContainer
                  config={{
                    rainfall: {
                      label: "Rainfall (mm)",
                      color: "#6366f1",
                    },
                  }}
                  className="h-[250px] w-full"
                >
                  <LineChart data={predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.getHours() + ":00";
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="rainfall"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>

              {/* AQI Chart */}
              <div>
                <h4 className="text-sm mb-4">AQI Forecast</h4>
                <ChartContainer
                  config={{
                    aqi: {
                      label: "AQI",
                      color: "#10b981",
                    },
                  }}
                  className="h-[250px] w-full"
                >
                  <LineChart data={predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.getHours() + ":00";
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="aqi"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Mock prediction generator for demo/fallback
function generateMockPredictions(currentData: any): MLPrediction[] {
  const predictions: MLPrediction[] = [];
  const now = new Date();

  for (let i = 1; i <= 24; i++) {
    const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
    
    // Simulate gradual changes with some randomness
    const tempChange = Math.sin(i / 6) * 3 + (Math.random() - 0.5) * 2;
    const humidityChange = Math.cos(i / 5) * 5 + (Math.random() - 0.5) * 3;
    
    predictions.push({
      timestamp: timestamp.toISOString(),
      temperature: currentData.temperature + tempChange,
      humidity: Math.max(0, Math.min(100, currentData.humidity + humidityChange)),
      pressure: currentData.pressure + (Math.random() - 0.5) * 2,
      windSpeed: Math.max(0, currentData.windSpeed + (Math.random() - 0.5) * 3),
      rainfall: Math.random() < 0.2 ? Math.random() * 5 : 0,
      aqi: Math.max(0, currentData.aqi + Math.floor((Math.random() - 0.5) * 10)),
      light: i >= 6 && i <= 18 ? 400 + Math.random() * 600 : Math.random() * 50,
      confidence: 0.75 + Math.random() * 0.2, // 75-95% confidence for mock data
    });
  }

  return predictions;
}