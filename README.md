# Weather Monitoring Web App

A modern, real-time weather monitoring system with IoT integration, AI chatbot powered by Google Gemini, and Firebase Realtime Database connectivity.

![Weather Dashboard](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue)
![Firebase](https://img.shields.io/badge/Firebase-RTDB-orange)
![Gemini AI](https://img.shields.io/badge/Gemini-2.0%20Flash-purple)

## 🌟 Features

### Real-time Weather Monitoring
- **Live sensor data** from ESP32/Arduino via Firebase RTDB
- Real-time updates every second
- Temperature, humidity, pressure, wind speed monitoring
- Air Quality Index (AQI) tracking
- Rain detection and light level monitoring
- Interactive charts with 48-point rolling history

### AI Weather Assistant
- Powered by **Google Gemini 2.0 Flash**
- Context-aware weather analysis
- Personalized clothing recommendations
- Activity suggestions based on weather conditions
- Natural language conversations

### Beautiful UI
- Modern gradient design with glassmorphism effects
- Responsive layout for all devices
- Animated charts using Recharts
- Interactive dashboard with real-time updates
- Professional weather cards and data visualization

### Firebase Integration
- Real-time database connectivity
- Dynamic CDN imports for Firebase
- Connection status monitoring
- Automatic reconnection handling
- Historical data storage

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/weather-monitoring-webapp.git
cd weather-monitoring-webapp
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Update `src/firebase-config.ts` with your Firebase credentials
   - Or the app will use dynamic CDN imports (current setup)

4. Configure Gemini AI:
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Update the `GEMINI_API_KEY` in `src/components/WeatherAIAssistant.tsx`

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to `http://localhost:5173`

## 📊 Firebase RTDB Structure

Your Firebase Realtime Database should have the following structure:

```
Weather/
  ├── Temperature: 25.5
  ├── Humidity: 65
  ├── Pressure: 1013.2
  ├── Wind_kmh: 12.5
  ├── AQI_Analog: 42
  ├── Rain_Digital: 1
  └── LDR_Digital: 850
```

## 🔧 Configuration

### Firebase Setup
The app automatically connects to your Firebase RTDB at:
```
https://weather-monitoring-8b62f-default-rtdb.firebaseio.com/
```

To change the database URL, update `src/App.tsx`:
```typescript
const firebaseConfig = {
  databaseURL: "YOUR_FIREBASE_URL_HERE",
};
```

### Gemini AI Setup
Update your API key in `src/components/WeatherAIAssistant.tsx`:
```typescript
const GEMINI_API_KEY = "YOUR_API_KEY_HERE";
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Custom components with Radix UI primitives
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **AI**: Google Gemini 2.0 Flash
- **Database**: Firebase Realtime Database
- **State Management**: React Hooks

## 📱 Features in Detail

### Weather Dashboard
- 4 primary weather cards (Temperature, Humidity, Pressure, Wind Speed)
- 3 secondary cards (AQI, Light Level, Rainfall)
- Connection status indicator
- Last update timestamp
- System status monitoring

### Historical Data Viewer
- Calendar picker for date selection
- 24-hour historical data display
- Sortable data table
- Fallback to mock data when Firebase data unavailable

### Weather Forecast
- 7-day forecast display
- Temperature ranges and conditions
- Weather icons and descriptions

### Charts
- Temperature trend (24 hours)
- Humidity trend (24 hours)
- Atmospheric pressure trend (24 hours)
- Combined view with all parameters

### AI Chatbot
- Natural language processing
- Weather condition explanations
- Clothing recommendations
- Outdoor activity suggestions
- Real-time sensor data integration

## 🔐 Security Notes

⚠️ **Important**: 
- Never commit API keys to version control
- Use environment variables for production
- Implement proper Firebase security rules
- Consider using a backend proxy for API calls in production

## 📄 Project Structure

```
├── src/
│   ├── components/
│   │   ├── ui/              # UI component library
│   │   ├── WeatherCard.tsx
│   │   ├── WeatherForecast.tsx
│   │   ├── WeatherAIAssistant.tsx
│   │   └── MLWeatherPrediction.tsx
│   ├── App.tsx              # Main application
│   ├── main.tsx             # Entry point
│   ├── firebase-config.ts   # Firebase configuration
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Sharvil**

## 🙏 Acknowledgments

- Google Gemini AI for intelligent weather assistance
- Firebase for real-time database services
- Radix UI for accessible component primitives
- Tailwind CSS for styling
- Recharts for beautiful data visualization

## 📞 Support

If you have any questions or need help with setup, please open an issue in the repository.

---

Made with ❤️ for IoT Weather Monitoring

---

_Original Figma design: https://www.figma.com/design/57KdXF0kV0xlSQkLZ8W5D0/Weather-Monitoring-Web-App_