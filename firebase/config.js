import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const getFirebaseConfig = () => {
  // Log environment status 
  console.log('Environment Status:', {
    nodeEnv: process.env.NODE_ENV,
    hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
  });

  // Force manual configuration - prevent auto initialization
  if (typeof window !== 'undefined') {
    // Disable Firebase auto-initialization
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = false;
    // Clear any Firebase hosting context
    if (window.__FIREBASE_DEFAULTS__) {
      delete window.__FIREBASE_DEFAULTS__;
    }
  }

  // IMPORTANT: For Firebase Auth to work correctly on Vercel/custom domains,
  // you must use the Firebase project's authDomain, NOT your custom domain.
  // The custom domain must be added to Firebase Console > Authentication > Settings > Authorized domains
  
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: 'limozin-85645.firebaseapp.com', // Always use Firebase's authDomain
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
  };

  // Log the domain configuration for debugging
  if (typeof window !== 'undefined') {
    const currentDomain = window.location.hostname;
    console.log('Domain Configuration:', {
      currentDomain,
      authDomain: config.authDomain,
      note: 'Make sure your current domain is added to Firebase Console > Authentication > Settings > Authorized domains'
    });
  }

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

  console.log('Manual Firebase config loaded:', {
    projectId: config.projectId,
    authDomain: config.authDomain
  });

  return config;
};

let app;
let db;
let auth;

try {
  const firebaseConfig = getFirebaseConfig();
  
  // Clear any existing Firebase apps to prevent conflicts
  const existingApps = getApps();
  if (existingApps.length > 0) {
    console.log(`Found ${existingApps.length} existing Firebase apps, using first one`);
    app = existingApps[0];
  } else {
    // Initialize Firebase with explicit configuration
    console.log('Initializing new Firebase app with config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      hasApiKey: !!firebaseConfig.apiKey
    });
    app = initializeApp(firebaseConfig, 'limozin-app');
    console.log('Firebase initialized successfully with project:', firebaseConfig.projectId);
  }
  
  // Initialize services
  db = getFirestore(app);
  auth = getAuth(app);
  
  // Verify auth domain configuration
  console.log('Firebase Auth configured with domain:', auth.config.authDomain);
  
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
