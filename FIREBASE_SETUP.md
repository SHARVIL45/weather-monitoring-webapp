# Firebase Setup Instructions

Your weather monitoring app is now connected to Firebase! Follow these steps to complete the setup:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## 2. Enable Firestore Database

1. In your Firebase project, go to **Build** > **Firestore Database**
2. Click "Create database"
3. Choose **Production mode** (you can modify rules later)
4. Select your preferred location
5. Click "Enable"

### Set up Firestore Rules (Optional but recommended)

Go to the **Rules** tab and update with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /weather_data/{document=**} {
      allow read, write: if true;  // For development - update for production!
    }
  }
}
```

## 3. Create a Web App in Firebase

1. In Firebase Console, click the **gear icon** (⚙️) > **Project settings**
2. Scroll down to "Your apps" section
3. Click the **Web icon** (`</>`)
4. Register your app with a nickname (e.g., "Weather Monitoring App")
5. Firebase will show you a config object

## 4. Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Firebase config values:

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
```

## 5. Create Firestore Index (Required for Queries)

Since we're querying with `where` and `orderBy`, you need to create a composite index:

1. In Firebase Console, go to **Firestore Database** > **Indexes** tab
2. Click **Add index**
3. Set:
   - **Collection ID**: `weather_data`
   - **Fields to index**:
     - Field: `date`, Order: Ascending
     - Field: `timestamp`, Order: Ascending
4. Click **Create**

Alternatively, when you run the app and try to fetch historical data, Firestore will show an error with a direct link to create the index automatically.

## 6. Start Your Application

```bash
npm run dev
```

## How It Works

### Real-time Data Saving
- Every 5 seconds, the app generates new weather data
- Data is automatically saved to Firestore collection: `weather_data`
- Each document contains: temperature, humidity, pressure, wind speed, AQI, rainfall, light, timestamp, and date

### Historical Data Retrieval
- Select a date using the calendar picker or date input
- The app queries Firestore for all data from that date
- If no Firebase data exists, it falls back to mock data
- Data is displayed in a sortable table

## Firestore Data Structure

```
weather_data (collection)
  └── auto-generated-id (document)
      ├── temperature: number
      ├── humidity: number
      ├── pressure: number
      ├── windSpeed: number
      ├── aqi: number
      ├── rainfall: number
      ├── light: number
      ├── timestamp: Timestamp
      └── date: string (YYYY-MM-DD)
```

## Troubleshooting

### 1. Firebase not saving data
- Check browser console for errors
- Verify your `.env.local` values are correct
- Ensure Firestore rules allow write access
- Restart the dev server after changing `.env.local`

### 2. "Missing or insufficient permissions" error
- Update your Firestore Security Rules to allow read/write
- For development, you can use the rules shown in step 2

### 3. "index not found" error
- Follow step 5 to create the required composite index
- Or click the link in the error message to auto-create it

### 4. Environment variables not loading
- Ensure the file is named `.env.local` (not `.env`)
- Restart the Vite dev server
- Variables must start with `VITE_` prefix

## Security Notes

⚠️ **Important**: The current Firestore rules allow anyone to read/write data. For production:

1. Implement Firebase Authentication
2. Update Firestore rules to restrict access:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /weather_data/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Next Steps

- Set up Firebase Authentication for user management
- Create data visualization dashboards in Firebase Console
- Set up Cloud Functions for data processing
- Implement data export/backup strategies
- Add real-time listeners for live updates across devices

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
