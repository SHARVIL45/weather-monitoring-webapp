import { useState, useEffect } from "react";
import { WeatherCard } from "./components/WeatherCard";
import { WeatherForecast } from "./components/WeatherForecast";
import { WeatherAIAssistant } from "./components/WeatherAIAssistant";
import { MLWeatherPrediction } from "./components/MLWeatherPrediction";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Calendar as CalendarComponent } from "./components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "./components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts@2.15.2";
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Activity,
  Lightbulb,
  Calendar,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";

// Mock data for historical readings
const generateHistoricalData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      temperature: 20 + Math.sin(i / 3) * 5 + Math.random() * 2,
      humidity: 60 + Math.cos(i / 4) * 10 + Math.random() * 5,
      pressure: 1013 + Math.sin(i / 5) * 3 + Math.random() * 2,
      windSpeed: 10 + Math.random() * 5,
    });
  }
  return data;
};

// Mock function to generate historical data for a specific date
const generateHistoricalDataForDate = (date: Date) => {
  const data = [];
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 24; i++) {
    const time = new Date(selectedDate.getTime() + i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      fullTime: time.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      temperature: 18 + Math.sin(i / 4) * 6 + Math.random() * 3,
      humidity: 55 + Math.cos(i / 3) * 15 + Math.random() * 5,
      pressure: 1012 + Math.sin(i / 6) * 4 + Math.random() * 2,
      windSpeed: 8 + Math.random() * 6,
      aqi: Math.floor(30 + Math.random() * 30),
      rainfall: Math.random() < 0.3 ? Math.random() * 5 : 0,
      light: i >= 6 && i <= 18 ? 400 + Math.random() * 600 : Math.random() * 50,
    });
  }
  return data;
};

export default function App() {
  const [currentData, setCurrentData] = useState({
    temperature: 22.5,
    humidity: 65,
    pressure: 1013.2,
    windSpeed: 12.5,
    aqi: 42,
    rainfall: 0,
    light: 850,
    rainDigital: 1,
    ldrDigital: 0,
  });

  const [historicalData, setHistoricalData] = useState(generateHistoricalData());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);
  const [previousDateData, setPreviousDateData] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sensorStatus, setSensorStatus] = useState("Initializing...");
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // Real-time Firebase listener with dynamic CDN imports
  useEffect(() => {
    let unsub: (() => void) | null = null;
    let forecastUnsub: (() => void) | null = null;
    let lastDataTime = Date.now();
    let timeoutCheckInterval: any;

    (async () => {
      try {
        // Dynamic CDN imports
        const appMod: any = await import(
          "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
        );
        const dbMod: any = await import(
          "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js"
        );

        const firebaseConfig = {
          databaseURL:
            "https://weather-monitoring-8b62f-default-rtdb.firebaseio.com/",
        };

        const app = appMod.initializeApp(firebaseConfig);
        const db = dbMod.getDatabase(app);

        const dbRef = dbMod.ref(db, "Weather");

        unsub = dbMod.onValue(dbRef, (snapshot: any) => {
          const data = snapshot.val();
          if (!data) return;

          lastDataTime = Date.now();
          setIsConnected(true);

          const parseNum = (v: any) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : NaN;
          };

          const temperature = parseNum(
            data.Temperature ?? data.TemperatureC ?? data.temperature
          );
          const humidity = parseNum(data.Humidity ?? data.humidity);
          const pressure = parseNum(
            data.Pressure ?? data.pressure ?? data.Pressure_hPa
          );

          // Wind: prefer km/h, fallback to m/s -> km/h
          let windSpeed = parseNum(
            data.Wind_kmh ??
              data.wind_kmh ??
              data.Wind ??
              data.wind ??
              data.Wind_Analog
          );
          if (!Number.isFinite(windSpeed)) {
            const mps = parseNum(
              data.Wind_m_s ?? data.wind_m_s ?? data.Wind_m_s
            );
            if (Number.isFinite(mps)) windSpeed = mps * 3.6;
          }

          // AQI: from analog or any numeric field, add 50 to the value
          const aqiRaw = parseNum(
            data.AQI_Analog ?? data.AQI ?? data.aqi ?? data.AirQuality
          );
          const aqi = Number.isFinite(aqiRaw)
            ? Math.round(aqiRaw + 50)
            : currentData.aqi;

          // Rain digital: 0 = rain, 1 = no rain (common raindrop module logic)
          const rainDigital = data.Rain_Digital ?? data.Rain ?? 1;
          const rainfall = rainDigital === 0 ? 0 : 1;

          // LDR / light
          const ldrDigital =
            data.LDR_Digital ??
            data.LDR ??
            data.ldr ??
            data.LightIntensity ??
            data.Light;

          setCurrentData((prev) => ({
            ...prev,
            temperature: Number.isFinite(temperature)
              ? temperature
              : prev.temperature,
            humidity: Number.isFinite(humidity) ? humidity : prev.humidity,
            pressure: Number.isFinite(pressure) ? pressure : prev.pressure,
            windSpeed: Number.isFinite(windSpeed) ? windSpeed : prev.windSpeed,
            aqi,
            rainfall,
            light:
              ldrDigital !== undefined && ldrDigital !== null
                ? ldrDigital
                : prev.light,
            rainDigital,
            ldrDigital,
          }));

          setLastUpdated(new Date().toLocaleTimeString());

          // Append to chart history
          setHistoricalData((prevHistory) => {
            const now = new Date();
            const newEntry = {
              time: now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              temperature: Number.isFinite(temperature)
                ? temperature
                : prevHistory[prevHistory.length - 1]?.temperature ?? 0,
              humidity: Number.isFinite(humidity)
                ? humidity
                : prevHistory[prevHistory.length - 1]?.humidity ?? 0,
              pressure: Number.isFinite(pressure)
                ? pressure
                : prevHistory[prevHistory.length - 1]?.pressure ?? 0,
              windSpeed: Number.isFinite(windSpeed)
                ? windSpeed
                : prevHistory[prevHistory.length - 1]?.windSpeed ?? 0,
            };
            const updated = [...prevHistory, newEntry];
            return updated.slice(-48); // keep last 48 points
          });

          // Sensor status
          const anyFinite = (val: any) => Number.isFinite(Number(val));
          if (
            !anyFinite(temperature) &&
            !anyFinite(humidity) &&
            !anyFinite(pressure)
          ) {
            setSensorStatus("Sensor Offline");
          } else {
            setSensorStatus("All Systems Operational");
          }
        });

        // Connection timeout checker
        timeoutCheckInterval = setInterval(() => {
          const timeSinceLastData = Date.now() - lastDataTime;
          if (timeSinceLastData > 30000) {
            setIsConnected(false);
            setSensorStatus("System Disconnected");
          }
        }, 5000);
      } catch (err) {
        console.error("Firebase dynamic import failed", err);
        setIsConnected(false);
        setSensorStatus("Firebase Error");
      }
    })();

    return () => {
      if (unsub) unsub();
      if (forecastUnsub) forecastUnsub();
      if (timeoutCheckInterval) clearInterval(timeoutCheckInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      const dateObj = new Date(date);
      setCalendarDate(dateObj);
      
      // For historical data, use mock data (or implement separate historical storage)
      const data = generateHistoricalDataForDate(dateObj);
      setPreviousDateData(data);
    } else {
      setCalendarDate(undefined);
      setPreviousDateData([]);
    }
  };

  const handleCalendarSelect = async (date: Date | undefined) => {
    setCalendarDate(date);
    if (date) {
      const dateString = date.toISOString().split("T")[0];
      setSelectedDate(dateString);
      
      // For historical data, use mock data (or implement separate historical storage)
      const data = generateHistoricalDataForDate(date);
      setPreviousDateData(data);
    } else {
      setSelectedDate("");
      setPreviousDateData([]);
    }
  };

  const getMaxDate = () => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    return today.toISOString().split("T")[0];
  };

  const getMaxCalendarDate = () => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    return today;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl">Weather Monitoring System</h1>
          <p className="text-muted-foreground">
            Real-time environmental monitoring dashboard
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Activity className={`h-4 w-4 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'} • Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Current Readings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <WeatherCard
            title="Temperature"
            value={currentData.temperature.toFixed(1)}
            unit="°C"
            icon={Thermometer}
            trend="stable"
            color="text-orange-500"
          />
          <WeatherCard
            title="Humidity"
            value={currentData.humidity.toFixed(0)}
            unit="%"
            icon={Droplets}
            trend="down"
            color="text-blue-500"
          />
          <WeatherCard
            title="Pressure"
            value={currentData.pressure.toFixed(1)}
            unit="hPa"
            icon={Gauge}
            trend="up"
            color="text-purple-500"
          />
          <WeatherCard
            title="Wind Speed"
            value={currentData.windSpeed.toFixed(1)}
            unit="km/h"
            icon={Wind}
            trend="stable"
            color="text-cyan-500"
          />
        </div>

        {/* Secondary Readings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <WeatherCard
            title="AQI"
            value={currentData.aqi.toString()}
            unit=""
            icon={Activity}
            color="text-green-500"
          />
          <WeatherCard
            title="Light"
            value={currentData.light.toString()}
            unit="lux"
            icon={Lightbulb}
            color="text-yellow-500"
          />
          <WeatherCard
            title="Rainfall"
            value={currentData.rainfall.toFixed(1)}
            unit="mm"
            icon={CloudRain}
            color="text-indigo-500"
          />
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="temperature" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="humidity">Humidity</TabsTrigger>
            <TabsTrigger value="pressure">Pressure</TabsTrigger>
            <TabsTrigger value="combined">Combined</TabsTrigger>
          </TabsList>

          {/* Temperature Chart */}
          <TabsContent value="temperature">
            <Card>
              <CardHeader>
                <CardTitle>Temperature Trend (24 Hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    temperature: {
                      label: "Temperature",
                      color: "#f97316",
                    },
                  }}
                  className="h-[350px] w-full"
                >
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: "°C", angle: -90, position: "insideLeft" }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f97316"
                      fillOpacity={1}
                      fill="url(#colorTemp)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Humidity Chart */}
          <TabsContent value="humidity">
            <Card>
              <CardHeader>
                <CardTitle>Humidity Trend (24 Hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    humidity: {
                      label: "Humidity",
                      color: "#3b82f6",
                    },
                  }}
                  className="h-[350px] w-full"
                >
                  <AreaChart data={historicalData}>
                    <defs>
                      <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: "%", angle: -90, position: "insideLeft" }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorHumidity)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pressure Chart */}
          <TabsContent value="pressure">
            <Card>
              <CardHeader>
                <CardTitle>Atmospheric Pressure Trend (24 Hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    pressure: {
                      label: "Pressure",
                      color: "#a855f7",
                    },
                  }}
                  className="h-[350px] w-full"
                >
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: "hPa", angle: -90, position: "insideLeft" }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="pressure"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Combined Chart */}
          <TabsContent value="combined">
            <Card>
              <CardHeader>
                <CardTitle>All Parameters (24 Hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    temperature: {
                      label: "Temperature (°C)",
                      color: "#f97316",
                    },
                    humidity: {
                      label: "Humidity (%)",
                      color: "#3b82f6",
                    },
                    pressure: {
                      label: "Pressure (hPa)",
                      color: "#a855f7",
                    },
                    windSpeed: {
                      label: "Wind Speed (km/h)",
                      color: "#06b6d4",
                    },
                  }}
                  className="h-[350px] w-full"
                >
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="temperature"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Temperature (°C)"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Humidity (%)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="pressure"
                      stroke="#a855f7"
                      strokeWidth={2}
                      name="Pressure (hPa)"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="windSpeed"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      name="Wind Speed (km/h)"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Weather Forecast Section */}
        <WeatherForecast />

        {/* AI Assistant Section */}
        <WeatherAIAssistant currentWeatherData={currentData} />

        {/* ML Prediction Section */}
        <MLWeatherPrediction currentWeatherData={currentData} />

        {/* Historical Data Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Historical Data Viewer
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  View weather data from previous dates
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                {/* Calendar Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {calendarDate ? (
                        calendarDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={calendarDate}
                      onSelect={handleCalendarSelect}
                      disabled={(date) => date > getMaxCalendarDate() || date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Manual Date Input */}
                <div className="flex items-center gap-2">
                  <label htmlFor="date-picker" className="text-sm whitespace-nowrap">
                    Or type:
                  </label>
                  <input
                    id="date-picker"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    max={getMaxDate()}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {previousDateData.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing 24-hour data for {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDate("");
                      setCalendarDate(undefined);
                      setPreviousDateData([]);
                    }}
                  >
                    Clear Selection
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Temperature (°C)</TableHead>
                        <TableHead>Humidity (%)</TableHead>
                        <TableHead>Pressure (hPa)</TableHead>
                        <TableHead>Wind Speed (km/h)</TableHead>
                        <TableHead>AQI</TableHead>
                        <TableHead>Light (lux)</TableHead>
                        <TableHead>Rainfall (mm)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previousDateData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.fullTime}</TableCell>
                          <TableCell>{row.temperature.toFixed(1)}</TableCell>
                          <TableCell>{row.humidity.toFixed(0)}</TableCell>
                          <TableCell>{row.pressure.toFixed(1)}</TableCell>
                          <TableCell>{row.windSpeed.toFixed(1)}</TableCell>
                          <TableCell>{row.aqi}</TableCell>
                          <TableCell>{Math.round(row.light)}</TableCell>
                          <TableCell>{row.rainfall.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">Select a date to view historical weather data</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Use the calendar picker or type a date manually
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Data is available for dates up to yesterday
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Data Update Interval</p>
                <p>Real-time</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sensor Status</p>
                <p className={sensorStatus === "All Systems Operational" ? "text-green-500" : "text-orange-500"}>{sensorStatus}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Retention</p>
                <p>24 Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}