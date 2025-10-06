// Firebase Admin SDK utility for server-side operations
import admin from 'firebase-admin';

/*
To enable complete Firebase Auth user deletion, you need to:

1. Install Firebase Admin SDK: ✅ DONE
   npm install firebase-admin

2. Get service account credentials from Firebase Console:
   - Go to Project Settings > Service Accounts
   - Generate new private key and download JSON file
   - See .env.admin.example for required environment variables

3. Set environment variables in .env.local (copy from .env.admin.example)

4. Restart the application after setting environment variables
*/

// Firebase Admin SDK configuration using environment variables
const serviceAccount = {
  type: process.env.FIREBASE_ADMIN_TYPE,
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL
};

// Check if all required environment variables are present
const requiredEnvVars = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_PRIVATE_KEY_ID', 
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_CLIENT_ID',
  'FIREBASE_ADMIN_CLIENT_X509_CERT_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
let adminInitialized = false;

if (missingEnvVars.length === 0) {
  // Initialize Firebase Admin SDK only if all environment variables are present
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      adminInitialized = true;
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
    }
  } else {
    adminInitialized = true;
  }
} else {
  console.warn('Firebase Admin SDK not initialized. Missing environment variables:', missingEnvVars);
}

// Function to delete user from Firebase Authentication
export const deleteFirebaseUser = async (email) => {
  if (!adminInitialized || missingEnvVars.length > 0) {
    console.log('Firebase Admin SDK not configured. Missing environment variables:', missingEnvVars);
    return { 
      success: false, 
      error: 'Firebase Admin SDK not configured. Please check environment variables in .env.local file.'
    };
  }

  try {
    // Get user by email first
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Delete the user
    await admin.auth().deleteUser(userRecord.uid);
    
    console.log('Successfully deleted user from Firebase Authentication:', email);
    return {
      success: true,
      message: `Firebase Auth user ${email} deleted successfully`,
      uid: userRecord.uid
    };
  } catch (error) {
    console.error('Error deleting user from Firebase Authentication:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to check if Firebase Admin is configured
export const isFirebaseAdminConfigured = () => {
  return adminInitialized && missingEnvVars.length === 0;
};

// Instructions for setup
export const getFirebaseAdminSetupInstructions = () => {
  return {
    title: 'Firebase Admin SDK Setup Required',
    instructions: [
      '1. ✅ Firebase Admin SDK installed',
      '2. Go to Firebase Console > Project Settings > Service Accounts',
      '3. Generate new private key and download JSON file',
      '4. Copy .env.admin.example to .env.local and fill in the values',
      '5. Restart the application'
    ],
    currentStatus: adminInitialized ? 
      'Firebase Admin SDK configured and ready' : 
      `Missing environment variables: ${missingEnvVars.join(', ')}`,
    missingVars: missingEnvVars
  };
};