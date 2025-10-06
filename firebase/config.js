import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const getFirebaseConfig = () => {
  // Log environment status 
  console.log('Environment Status:', {
    nodeEnv: process.env.NODE_ENV,
    hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });

  // In development, we can use environment variables from .env
  // In production, we must use environment variables from Vercel
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
  };

  // Validate configuration
  const missingVars = [];
  if (!config.apiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!config.authDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!config.projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Make sure these are set in your Vercel project settings.'
    );
  }

  return config;
};

let app;
let db;
let auth;

try {
  const firebaseConfig = getFirebaseConfig();
  
  // Initialize Firebase only if it hasn't been initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully with project:', firebaseConfig.projectId);
  } else {
    app = getApp();
    console.log('Using existing Firebase app');
  }
  
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  if (process.env.NODE_ENV === 'development') {
    console.error('Current environment variables:', {
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  }
  // In production, we'll throw the error to prevent the app from running with invalid config
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}

export { db, auth };
export default app;
