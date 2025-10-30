// Test Authentication Flow Script
// Run this in browser console to test the authentication flow

console.log('🔐 Testing Authentication Flow...');

// Test 1: Check current authentication state
console.log('Current Auth State:', {
  pathname: window.location.pathname,
  isOnLoginPage: window.location.pathname === '/login',
  isOnHomePage: window.location.pathname === '/',
  hasAuthContext: !!window.authContext,
  localStorageKeys: Object.keys(localStorage).filter(key => key.includes('firebase') || key.includes('auth'))
});

// Test 2: Monitor auth state changes
let authStateChanges = 0;
if (typeof onAuthStateChanged !== 'undefined' && typeof auth !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    authStateChanges++;
    console.log(`📊 Auth State Change #${authStateChanges}:`, {
      hasUser: !!user,
      email: user?.email,
      uid: user?.uid,
      currentPath: window.location.pathname,
      timestamp: new Date().toISOString()
    });
    
    // Test automatic redirects
    if (user && window.location.pathname === '/login') {
      console.log('✅ User authenticated on login page - should redirect to home');
    } else if (!user && window.location.pathname === '/') {
      console.log('✅ User not authenticated on home page - should redirect to login');
    }
  });
}

// Test 3: Check routing behavior
console.log('🛣️  Router Test:', {
  canAccessHistoryAPI: !!window.history,
  canAccessLocation: !!window.location,
  nextRouterAvailable: !!window.next
});

// Test 4: Simulate sign out (if authenticated)
window.testSignOut = async () => {
  console.log('🚪 Testing sign out...');
  if (typeof logOut !== 'undefined') {
    try {
      const result = await logOut();
      console.log('Sign out result:', result);
      console.log('Current path after sign out:', window.location.pathname);
      
      setTimeout(() => {
        console.log('Path after 2 seconds:', window.location.pathname);
      }, 2000);
    } catch (error) {
      console.error('Sign out test failed:', error);
    }
  } else {
    console.log('logOut function not available');
  }
};

// Test 5: Check protected route behavior
window.testProtectedRoute = () => {
  console.log('🛡️  Testing protected route access...');
  console.log('Attempting to navigate to home page...');
  window.location.href = '/';
};

console.log('🧪 Test functions available:');
console.log('- testSignOut(): Test the sign out flow');
console.log('- testProtectedRoute(): Test protected route access');
console.log('📱 Monitor the console for auth state changes and routing behavior');