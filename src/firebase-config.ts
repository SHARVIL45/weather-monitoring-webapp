import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Firebase configuration - Replace these with your Firebase project settings
// Get these from: Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "weather-monitoring-8b62f.firebaseapp.com",
  databaseURL: "https://weather-monitoring-8b62f-default-rtdb.firebaseio.com",
  projectId: "weather-monitoring-8b62f",
  storageBucket: "weather-monitoring-8b62f.firebasestorage.app",
  messagingSenderId: "882446019011",
  appId: "1:882446019011:web:2921e4eae1a71016c27576"
};

// Check if Firebase config is still using placeholder values
const isConfigured = !firebaseConfig.apiKey.includes('Example');

let app;
let database;
let auth;

if (isConfigured) {
  // Initialize Firebase only if configured
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
} else {
  console.warn('⚠️ Firebase is not configured. Please update firebase-config.ts with your Firebase credentials.');
  console.warn('Get your config from: https://console.firebase.google.com/ > Project Settings');
  // Create mock objects to prevent errors
  database = null as any;
  auth = null as any;
  app = null as any;
}

export { database, auth };
export default app;
