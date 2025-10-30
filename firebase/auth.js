import { 
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  getRedirectResult
} from 'firebase/auth';
import { auth } from './config';

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // Add additional scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    // Force account selection to avoid cached accounts
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Check if we're in production or should avoid popup
    const isProduction = typeof window !== 'undefined' && 
                        (window.location.hostname.includes('vercel.app') || 
                         window.location.hostname.includes('.app') ||
                         window.location.protocol === 'https:' ||
                         window.location.hostname !== 'localhost');
    
    // Force redirect in production to completely avoid COOP issues
    if (isProduction) {
      console.log('Production/HTTPS environment detected, using redirect authentication to avoid COOP');
      try {
        await signInWithRedirect(auth, provider);
        return {
          success: true,
          user: null, // User will be available after redirect
          isRedirect: true
        };
      } catch (redirectError) {
        console.error('Redirect authentication failed:', redirectError);
        return {
          success: false,
          error: `Redirect authentication failed: ${getAuthErrorMessage(redirectError.code)}`
        };
      }
    }
    
    // Development environment - try popup but be ready to fallback
    console.log('Development environment detected, trying popup with redirect fallback');
    try {
      const result = await signInWithPopup(auth, provider);
      return {
        success: true,
        user: result.user,
        shouldReload: true // Indicate that a reload is recommended
      };
    } catch (popupError) {
      console.warn('Popup authentication failed:', {
        code: popupError.code,
        message: popupError.message
      });
      
      // Check if user cancelled the popup
      if (popupError.code === 'auth/popup-closed-by-user' || 
          popupError.code === 'auth/cancelled-popup-request') {
        console.log('User cancelled popup authentication');
        return {
          success: false,
          error: 'cancelled',
          cancelled: true
        };
      }
      
      // For other popup errors, try redirect fallback
      try {
        console.log('Using redirect fallback for popup error');
        await signInWithRedirect(auth, provider);
        return {
          success: true,
          user: null, // User will be available after redirect
          isRedirect: true
        };
      } catch (redirectError) {
        console.error('Both popup and redirect failed:', redirectError);
        throw redirectError;
      }
    }
  } catch (error) {
    console.error('Google sign in error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
};

// Sign up with Google (same as sign in for Google)
export const signUpWithGoogle = async () => {
  return await signInWithGoogle();
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: 'Failed to sign out'
    };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  console.log('Setting up auth state change listener');
  
  // Add a timeout to ensure callback is called even if Firebase is slow
  let callbackCalled = false;
  let timeoutId;
  
  const safeCallback = (user) => {
    if (!callbackCalled) {
      callbackCalled = true;
      if (timeoutId) clearTimeout(timeoutId);
      callback(user);
    }
  };
  
  // Immediately check current user state
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log('Current user found immediately:', currentUser.email);
    safeCallback(currentUser);
  } else {
    // Set timeout after a delay if no immediate user
    setTimeout(() => {
      if (!callbackCalled) {
        timeoutId = setTimeout(() => {
          if (!callbackCalled) {
            console.warn('Auth state change timeout - calling callback with null user');
            safeCallback(null);
          }
        }, 10000); // 10 second timeout for redirect authentication
      }
    }, 500); // Wait 500ms before setting timeout
  }
  
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('Firebase Auth state changed:', { 
      hasUser: !!user, 
      email: user?.email,
      uid: user?.uid,
      timestamp: new Date().toISOString()
    });
    
    safeCallback(user);
  }, (error) => {
    console.error('Auth state change error:', error);
    // Still call callback with null user in case of error
    safeCallback(null);
  });

  return () => {
    callbackCalled = true;
    if (timeoutId) clearTimeout(timeoutId);
    unsubscribe();
  };
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Handle redirect result after Google sign in redirect
export const handleRedirectResult = async () => {
  try {
    console.log('Checking for redirect result...');
    
    // Add a small delay to ensure Firebase is fully initialized
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = await getRedirectResult(auth);
    
    if (result && result.user) {
      console.log('Redirect authentication successful:', {
        email: result.user.email,
        uid: result.user.uid,
        displayName: result.user.displayName,
        accessToken: result._tokenResponse?.access_token ? 'present' : 'missing'
      });
      return {
        success: true,
        user: result.user
      };
    }
    
    if (result === null) {
      console.log('No redirect result (user did not come from redirect)');
    } else {
      console.log('Redirect result exists but no user:', result);
    }
    
    return {
      success: false,
      error: 'No redirect result found'
    };
  } catch (error) {
    console.error('Redirect result error:', {
      code: error.code,
      message: error.message
    });
    
    // Don't treat "no redirect result" as an error
    if (error.code === 'auth/no-auth-event') {
      return {
        success: false,
        error: 'No redirect result found'
      };
    }
    
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
};

// Convert Firebase auth error codes to user-friendly messages
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return 'cancelled'; // Special case for popup cancellation
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups and try again.';
    case 'auth/cancelled-popup-request':
      return 'cancelled'; // Special case for popup cancellation
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in credentials.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for authentication.';
    default:
      return 'Authentication failed. Please try again.';
  }
};