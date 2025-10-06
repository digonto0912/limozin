import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // Add additional scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    const result = await signInWithPopup(auth, provider);
    return {
      success: true,
      user: result.user
    };
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
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Convert Firebase auth error codes to user-friendly messages
const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Another popup is already open. Please close it and try again.';
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