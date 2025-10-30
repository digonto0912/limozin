/**
 * Firebase Configuration Diagnostics
 * Use this to debug Firebase initialization issues
 */

export const runFirebaseDiagnostics = () => {
  console.group('🔥 Firebase Diagnostics');
  
  // Check environment
  const env = {
    nodeEnv: process.env.NODE_ENV,
    isClient: typeof window !== 'undefined',
    isServer: typeof window === 'undefined',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
  };
  
  console.log('Environment:', env);
  
  // Check for auto-initialization conflicts
  const autoInitChecks = {
    hasFirebaseDefaults: typeof window !== 'undefined' && !!window.__FIREBASE_DEFAULTS__,
    hasAppCheckToken: typeof window !== 'undefined' && !!window.FIREBASE_APPCHECK_DEBUG_TOKEN,
    hasGlobalFirebase: typeof window !== 'undefined' && !!window.firebase
  };
  
  console.log('Auto-initialization checks:', autoInitChecks);
  
  // Check environment variables
  const envVars = {
    hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    hasMessagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    hasAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };
  
  console.log('Environment variables:', envVars);
  
  // In development, show actual values (masked)
  if (process.env.NODE_ENV === 'development') {
    const maskedConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 
        `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.slice(0, 8)}...` : 'MISSING',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING'
    };
    console.log('Masked config (dev only):', maskedConfig);
  }
  
  // Check for potential 404 sources
  const potentialIssues = [];
  
  if (autoInitChecks.hasFirebaseDefaults) {
    potentialIssues.push('window.__FIREBASE_DEFAULTS__ found - may cause auto-initialization');
  }
  
  if (autoInitChecks.hasGlobalFirebase) {
    potentialIssues.push('Global firebase object found - may conflict with v9 SDK');
  }
  
  if (!envVars.hasApiKey || !envVars.hasAuthDomain || !envVars.hasProjectId) {
    potentialIssues.push('Missing required environment variables');
  }
  
  if (potentialIssues.length > 0) {
    console.warn('⚠️ Potential issues:', potentialIssues);
  } else {
    console.log('✅ No obvious configuration issues detected');
  }
  
  console.groupEnd();
  
  return {
    env,
    autoInitChecks,
    envVars,
    potentialIssues
  };
};

export const testFirebaseConnection = async () => {
  console.group('🔗 Firebase Connection Test');
  
  try {
    // Dynamic import to avoid initialization issues
    const { auth } = await import('../firebase/config');
    
    console.log('✅ Firebase config imported successfully');
    console.log('Auth instance:', {
      currentUser: auth.currentUser ? 'User present' : 'No user',
      authDomain: auth.config?.authDomain || 'Not available',
      apiKey: auth.config?.apiKey ? 'Present' : 'Missing'
    });
    
    // Test Firebase app initialization
    const { getApps } = await import('firebase/app');
    const apps = getApps();
    
    console.log(`✅ Firebase apps initialized: ${apps.length}`);
    apps.forEach((app, index) => {
      console.log(`App ${index}:`, {
        name: app.name,
        projectId: app.options.projectId,
        authDomain: app.options.authDomain
      });
    });
    
    console.groupEnd();
    return true;
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    console.groupEnd();
    return false;
  }
};

// Auto-run diagnostics in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run after a short delay to ensure everything is loaded
  setTimeout(() => {
    runFirebaseDiagnostics();
    testFirebaseConnection();
  }, 1000);
}