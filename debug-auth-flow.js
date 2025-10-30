// Authentication Flow Debugger
// Add this to your login page or run in console to debug auth issues

window.debugAuth = {
  // Check current auth state
  checkAuthState: () => {
    console.log('🔍 Current Auth State:', {
      currentUser: auth.currentUser ? {
        email: auth.currentUser.email,
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName
      } : null,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  },

  // Force check redirect result
  checkRedirect: async () => {
    console.log('🔄 Manually checking redirect result...');
    try {
      const { handleRedirectResult } = await import('./firebase/auth');
      const result = await handleRedirectResult();
      console.log('Redirect result:', result);
      return result;
    } catch (error) {
      console.error('Manual redirect check failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Monitor auth state changes
  monitorAuth: () => {
    console.log('👀 Starting auth state monitoring...');
    let changeCount = 0;
    
    const { onAuthStateChanged } = firebase.auth;
    if (typeof onAuthStateChanged !== 'undefined') {
      onAuthStateChanged(auth, (user) => {
        changeCount++;
        console.log(`🔐 Auth State Change #${changeCount}:`, {
          hasUser: !!user,
          email: user?.email,
          uid: user?.uid,
          timestamp: new Date().toISOString()
        });
      });
    }
  },

  // Test redirect authentication
  testRedirect: async () => {
    console.log('🧪 Testing redirect authentication...');
    try {
      const { signInWithGoogle } = await import('./firebase/auth');
      const result = await signInWithGoogle();
      console.log('Sign in result:', result);
      return result;
    } catch (error) {
      console.error('Test redirect failed:', error);
      return { success: false, error: error.message };
    }
  }
};

// Auto-run diagnostics on login page
if (window.location.pathname === '/login') {
  console.log('🚀 Auth Debugger loaded on login page');
  
  // Check initial state
  setTimeout(() => {
    window.debugAuth.checkAuthState();
    window.debugAuth.checkRedirect();
  }, 1000);
  
  console.log('Available commands:');
  console.log('- debugAuth.checkAuthState(): Check current auth state');
  console.log('- debugAuth.checkRedirect(): Check for redirect result');
  console.log('- debugAuth.monitorAuth(): Monitor auth state changes');
  console.log('- debugAuth.testRedirect(): Test redirect authentication');
}

export default window.debugAuth;