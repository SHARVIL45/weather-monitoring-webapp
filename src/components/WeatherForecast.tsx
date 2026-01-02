import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CloudSun, CloudRain, Sun, Cloud } from "lucide-react";
import { useState, useEffect } from "react";

interface ForecastDay {
  day: string;
  date: string;
  temp: { min: number; max: number };
  condition: string;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  icon: any;
}

export function WeatherForecast() {
  const [forecast, setForecast] = useState<ForecastDay[]>([]);

  useEffect(() => {
    // Generate mock 7-day forecast based on current trends
    const generateForecast = () => {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain"];
      const icons = [Sun, CloudSun, Cloud, CloudRain];
      
      const today = new Date();
      const forecastData: ForecastDay[] = [];

      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const conditionIndex = Math.floor(Math.random() * conditions.length);
        const baseTemp = 20 + Math.sin(i / 2) * 5;
        
        forecastData.push({
          day: days[date.getDay()],
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          temp: {
            min: Math.round(baseTemp - 3 + Math.random() * 2),
            max: Math.round(baseTemp + 5 + Math.random() * 3),
          },
          condition: conditions[conditionIndex],
          precipitation: conditionIndex === 3 ? Math.round(20 + Math.random() * 60) : Math.round(Math.random() * 20),
          humidity: Math.round(50 + Math.random() * 30),
          windSpeed: Math.round(8 + Math.random() * 12),
          icon: icons[conditionIndex],
        });
      }

      setForecast(forecastData);
    };

    generateForecast();
    
    // Update forecast every hour
    const interval = setInterval(generateForecast, 3600000);
    return () => clearInterval(interval);
  }, []);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Sunny":
        return "text-yellow-500";
      case "Partly Cloudy":
        return "text-blue-400";
      case "Cloudy":
        return "text-gray-500";
      case "Light Rain":
        return "text-blue-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudSun className="h-5 w-5" />
          7-Day Weather Forecast
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Predicted weather conditions based on current trends and patterns
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {forecast.map((day, index) => {
            const Icon = day.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-background to-muted p-4 rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="text-center space-y-3">
                  <div>
                    <p className="text-sm opacity-70">{day.day}</p>
                    <p className="text-xs text-muted-foreground">{day.date}</p>
                  </div>
                  
                  <Icon className={`h-10 w-10 mx-auto ${getConditionColor(day.condition)}`} />
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{day.condition}</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm opacity-70">{day.temp.min}°</span>
                      <span className="mx-1">/</span>
                      <span>{day.temp.max}°</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rain:</span>
                      <span>{day.precipitation}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Humidity:</span>
                      <span>{day.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Wind:</span>
                      <span>{day.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
