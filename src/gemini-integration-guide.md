# Gemini AI Integration Guide

This guide will help you integrate Google's Gemini AI API with your Weather Monitoring System.

## Overview

The Weather AI Assistant component uses Google's Gemini AI to provide intelligent responses to weather-related questions. Currently, it's running in **demo mode** with mock responses. Follow this guide to enable full AI capabilities.

## Prerequisites

- Google Cloud Account
- Gemini API Key
- Node.js and npm installed

## Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key and store it securely

⚠️ **SECURITY WARNING**: Never commit API keys to version control or expose them in client-side code!

## Step 2: Choose Your Integration Method

### Option A: Client-Side Integration (Quick Start - Not Recommended for Production)

This method is faster to set up but less secure. Use only for development/testing.

#### 2A.1: Install Gemini SDK

```bash
npm install @google/generative-ai
```

#### 2A.2: Update WeatherAIAssistant.tsx

Replace the `callGeminiAPI` function in `/components/WeatherAIAssistant.tsx`:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

async function callGeminiAPI(
  userMessage: string,
  weatherData: any
): Promise<string> {
  try {
    // ⚠️ WARNING: This exposes your API key in client code
    // Use environment variables at minimum
    const API_KEY = "YOUR_GEMINI_API_KEY_HERE";
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are a helpful weather assistant. The current weather conditions are:
      - Temperature: ${weatherData.temperature.toFixed(1)}°C
      - Humidity: ${weatherData.humidity.toFixed(0)}%
      - Pressure: ${weatherData.pressure.toFixed(1)} hPa
      - Wind Speed: ${weatherData.windSpeed.toFixed(1)} km/h
      - Air Quality Index (AQI): ${weatherData.aqi}
      - Light Intensity: ${weatherData.light} lux
      - Rainfall: ${weatherData.rainfall.toFixed(1)} mm
      
      User question: ${userMessage}
      
      Provide a helpful, friendly, and concise response (2-3 sentences) about the weather. 
      Give practical advice when appropriate (e.g., clothing suggestions, activity recommendations).`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
```

### Option B: Backend Integration (Recommended for Production)

This is the secure way to integrate Gemini API using Firebase Cloud Functions or your own backend.

#### 2B.1: Set Up Firebase Cloud Functions

If you're already using Firebase for historical data storage, you can add Cloud Functions:

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Initialize Cloud Functions in your project
firebase init functions
```

#### 2B.2: Create Cloud Function

Create a file `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(functions.config().gemini.apikey);

export const chatWithGemini = functions.https.onCall(async (data, context) => {
  // Optional: Add authentication check
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  // }

  const { message, weatherData } = data;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are a helpful weather assistant. The current weather conditions are:
      - Temperature: ${weatherData.temperature}°C
      - Humidity: ${weatherData.humidity}%
      - Pressure: ${weatherData.pressure} hPa
      - Wind Speed: ${weatherData.windSpeed} km/h
      - Air Quality Index (AQI): ${weatherData.aqi}
      - Light Intensity: ${weatherData.light} lux
      - Rainfall: ${weatherData.rainfall} mm
      
      User question: ${message}
      
      Provide a helpful, friendly, and concise response about the weather.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return { response: response.text() };
  } catch (error) {
    console.error('Error calling Gemini:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate response');
  }
});
```

#### 2B.3: Set API Key in Firebase

```bash
firebase functions:config:set gemini.apikey="YOUR_GEMINI_API_KEY"
```

#### 2B.4: Deploy Cloud Function

```bash
firebase deploy --only functions
```

#### 2B.5: Update Client Code

In `/components/WeatherAIAssistant.tsx`, update the `callGeminiAPI` function:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

async function callGeminiAPI(
  userMessage: string,
  weatherData: any
): Promise<string> {
  try {
    const functions = getFunctions();
    const chatWithGemini = httpsCallable(functions, 'chatWithGemini');
    
    const result = await chatWithGemini({
      message: userMessage,
      weatherData: weatherData
    });
    
    return (result.data as any).response;
  } catch (error) {
    console.error('Error calling Cloud Function:', error);
    throw error;
  }
}
```

### Option C: Custom Backend Server

If you have your own backend server, create an API endpoint:

#### Backend Endpoint (Node.js/Express example):

```javascript
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/weather-chat', async (req, res) => {
  try {
    const { message, weatherData } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `You are a helpful weather assistant...`; // Same prompt as above
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ response: response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
```

#### Update Client:

```typescript
async function callGeminiAPI(
  userMessage: string,
  weatherData: any
): Promise<string> {
  const response = await fetch('http://localhost:3001/api/weather-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage,
      weatherData: weatherData
    })
  });
  
  const data = await response.json();
  return data.response;
}
```

## Step 3: Testing

After implementing your chosen method:

1. Start your development server
2. Navigate to the AI Weather Assistant section
3. Try asking questions like:
   - "What should I wear today?"
   - "Is it a good day for outdoor activities?"
   - "Should I bring an umbrella?"
   - "What's the air quality like?"

## Rate Limiting & Costs

### Gemini API Pricing (as of 2024)

- **Free Tier**: 60 requests per minute
- **Paid Tier**: Higher limits available

Check current pricing: [Google AI Pricing](https://ai.google.dev/pricing)

### Implement Rate Limiting

To prevent abuse and control costs:

```typescript
// Simple client-side rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

async function callGeminiAPI(userMessage: string, weatherData: any): Promise<string> {
  const now = Date.now();
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    throw new Error('Please wait a moment before sending another message');
  }
  lastRequestTime = now;
  
  // ... rest of implementation
}
```

## Troubleshooting

### Common Issues

1. **"API key not valid" error**
   - Verify your API key is correct
   - Check that the API key has Gemini API enabled
   - Ensure no extra spaces in the key

2. **CORS errors (client-side integration)**
   - Use backend proxy instead
   - Or configure CORS in Google Cloud Console

3. **Rate limit exceeded**
   - Implement client-side rate limiting
   - Consider caching responses for similar questions
   - Upgrade to paid tier if needed

4. **Slow response times**
   - Normal for AI responses (1-3 seconds)
   - Show loading indicator to users
   - Consider implementing streaming responses

## Best Practices

1. ✅ **Always use backend proxy for production**
2. ✅ **Implement rate limiting**
3. ✅ **Cache common responses**
4. ✅ **Add error handling and fallbacks**
5. ✅ **Monitor API usage and costs**
6. ✅ **Sanitize user input before sending to AI**
7. ✅ **Set response length limits in prompts**

## Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Firebase Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [Google AI Studio](https://makersuite.google.com/)

## Support

For issues specific to:
- **Gemini API**: [Google AI Support](https://ai.google.dev/support)
- **Firebase**: [Firebase Support](https://firebase.google.com/support)
- **This App**: Check the console for error messages

---

**Last Updated**: December 2024
