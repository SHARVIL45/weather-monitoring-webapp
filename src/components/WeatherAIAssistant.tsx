import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface WeatherAIAssistantProps {
  currentWeatherData: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    aqi: number;
    rainfall: number;
    light: number;
    rainDigital?: number | string;
    ldrDigital?: number | string;
  };
}

/* 🔑 GEMINI CONFIG – EDIT THIS ONLY */
const GEMINI_API_KEY = "PUT YOUR GEMINI API KEY HERE"; // <-- put your key here
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export function WeatherAIAssistant({
  currentWeatherData,
}: WeatherAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI weather assistant powered by Gemini. I can help you understand weather patterns, provide insights about current conditions, and answer questions about the weather data. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Simple debug so you can confirm key is loaded
  console.log("DEBUG GEMINI KEY PREFIX:", GEMINI_API_KEY.slice(0, 4));

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await callGeminiAPI(input, currentWeatherData);

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);

      const { temperature, humidity, pressure, windSpeed, aqi, rainfall, light } =
        currentWeatherData;

      const errorMessage: Message = {
        role: "assistant",
        content:
          "I'm currently unable to reach Gemini, so I'll answer based only on your sensor data.\n\n" +
          `• Temperature: ${temperature.toFixed(1)}°C\n` +
          `• Humidity: ${humidity.toFixed(0)}%\n` +
          `• Pressure: ${pressure.toFixed(1)} hPa\n` +
          `• Wind Speed: ${windSpeed.toFixed(1)} km/h\n` +
          `• AQI: ${aqi}\n` +
          `• Light: ${light} lux\n` +
          (rainfall > 0
            ? `• Rainfall: ${rainfall.toFixed(1)} mm (take an umbrella!)`
            : "• No rainfall detected right now."),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Weather Assistant
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by Gemini
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask questions about weather conditions, get insights, and receive recommendations
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef as any}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about weather conditions, trends, or recommendations..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          💡 Try asking: &quot;What should I wear today?&quot; or &quot;Is it a good day for outdoor activities?&quot;
        </div>
      </CardContent>
    </Card>
  );
}

/* 🌩️ Real Gemini 2.0 Flash API call using your weather data */
async function callGeminiAPI(
  userMessage: string,
  weatherData: WeatherAIAssistantProps["currentWeatherData"]
): Promise<string> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
    throw new Error("Gemini API key not set");
  }

  const prompt = `
You are an AI weather assistant for a student's IoT weather monitoring project.

Current live sensor readings:
- Temperature: ${weatherData.temperature.toFixed(1)} °C
- Humidity: ${weatherData.humidity.toFixed(0)} %
- Pressure: ${weatherData.pressure.toFixed(1)} hPa
- Wind speed: ${weatherData.windSpeed.toFixed(1)} km/h
- AQI: ${weatherData.aqi}
- Rain status: ${weatherData.rainfall === 0 ? "Rain detected" : "Dry"}
- Light level: ${weatherData.light} (approx lux / LDR reading)

User message: "${userMessage}"

Rules:
- If the user just says "hi", "hello", or "hey", reply with a short friendly greeting and mention what you can do.
- If they ask "what should I wear" / "clothes" / "outfit", focus mainly on clothing advice based on these conditions, with only a short weather summary.
- If they ask for recommendations or "what should I do today", suggest 2–3 activities (indoor/outdoor) based on weather and air quality.
- If they ask "how is the weather", describe how it feels (hot/cold, humid/dry, windy or calm, bright or dim).
- Do NOT repeat the same wording every time; vary examples.
- Answer in simple, friendly English, about 4–7 short sentences.
- Don’t mention sensors or technical device details. Talk like a normal weather assistant.
`.trim();

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("Gemini raw error:", txt);
    throw new Error("Gemini API error: " + txt);
  }

  const data = await res.json();
  const reply =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text || "")
      .join("") || "Gemini did not return any text.";
  return reply;
}
