# Firebase Integration Guide for Weather Monitoring System

## Setup Instructions

### 1. Install Firebase
```bash
npm install firebase
```

### 2. Create Firebase Configuration File

Create a file `/firebase-config.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### 3. Firestore Database Structure

```
weather_data (collection)
  └── {documentId}
      ├── timestamp: Date
      ├── date: string (YYYY-MM-DD)
      ├── temperature: number
      ├── humidity: number
      ├── pressure: number
      ├── windSpeed: number
      ├── aqi: number
      ├── rainfall: number
      └── light: number
```

### 4. Code Integration

#### A. Saving Data to Firebase (every 5 seconds)

In your `App.tsx`, replace the real-time updates section with:

```typescript
import { db } from './firebase-config';
import { collection, addDoc } from 'firebase/firestore';

useEffect(() => {
  const interval = setInterval(async () => {
    const newData = {
      temperature: 20 + Math.random() * 10,
      humidity: 60 + Math.random() * 20,
      pressure: 1010 + Math.random() * 10,
      windSpeed: 10 + Math.random() * 10,
      aqi: Math.floor(30 + Math.random() * 50),
      rainfall: Math.random() * 2,
      light: 500 + Math.random() * 500,
      timestamp: new Date(),
      date: new Date().toISOString().split('T')[0]
    };

    setCurrentData(newData);

    // Save to Firebase
    try {
      await addDoc(collection(db, 'weather_data'), newData);
      console.log('Data saved to Firebase');
    } catch (error) {
      console.error('Error saving to Firebase:', error);
    }
  }, 5000);

  return () => clearInterval(interval);
}, []);
```

#### B. Fetching Historical Data from Firebase

Replace the `handleDateChange` function with:

```typescript
import { query, where, getDocs, orderBy } from 'firebase/firestore';

const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const date = e.target.value;
  setSelectedDate(date);
  
  if (date) {
    try {
      // Query Firebase for data from the selected date
      const q = query(
        collection(db, 'weather_data'),
        where('date', '==', date),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({
          time: new Date(docData.timestamp.toDate()).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          fullTime: new Date(docData.timestamp.toDate()).toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          temperature: docData.temperature,
          humidity: docData.humidity,
          pressure: docData.pressure,
          windSpeed: docData.windSpeed,
          aqi: docData.aqi,
          rainfall: docData.rainfall,
          light: docData.light,
        });
      });
      
      setPreviousDateData(data);
    } catch (error) {
      console.error('Error fetching data from Firebase:', error);
      setPreviousDateData([]);
    }
  } else {
    setPreviousDateData([]);
  }
};
```

#### C. Loading Today's Historical Data for Charts

Add this useEffect to load today's data for the charts:

```typescript
useEffect(() => {
  const loadTodayData = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const q = query(
        collection(db, 'weather_data'),
        where('date', '==', today),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({
          time: new Date(docData.timestamp.toDate()).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          temperature: docData.temperature,
          humidity: docData.humidity,
          pressure: docData.pressure,
          windSpeed: docData.windSpeed,
        });
      });
      
      // Update your historicalData state with this data
    } catch (error) {
      console.error('Error loading today\'s data:', error);
    }
  };
  
  loadTodayData();
}, []);
```

### 5. Firestore Security Rules

In your Firebase Console, set up these security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /weather_data/{document} {
      allow read: if true;
      allow write: if true; // Adjust based on your authentication needs
    }
  }
}
```

### 6. Optional: Create Indexes

For better query performance, create a composite index in Firebase Console:
- Collection: `weather_data`
- Fields: `date` (Ascending) and `timestamp` (Ascending)

## Notes

- Make sure to replace the Firebase config values with your actual Firebase project credentials
- The current implementation uses mock data generators, which you can remove once Firebase is integrated
- Consider adding error handling and loading states for better UX
- You may want to implement data aggregation for better performance with large datasets
