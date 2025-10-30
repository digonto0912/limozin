// Authentication Flow Test Script
// Run this in browser console to monitor authentication behavior

console.log('🔐 Authentication Flow Monitor Started');

let authChanges = 0;
let routeChanges = 0;

// Monitor authentication state changes
if (typeof onAuthStateChanged !== 'undefined' && typeof auth !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    authChanges++;
    console.log(`🔄 Auth Change #${authChanges}:`, {
      hasUser: !!user,
      email: user?.email,
      currentPath: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  });
} else {
  console.log('⚠️ Firebase auth not available, cannot monitor auth changes');
}

// Monitor route changes by checking URL periodically
let lastPath = window.location.pathname;
const checkRouteChanges = () => {
  const currentPath = window.location.pathname;
  if (currentPath !== lastPath) {
    routeChanges++;
    console.log(`🛣️ Route Change #${routeChanges}:`, {
      from: lastPath,
      to: currentPath,
      timestamp: new Date().toISOString()
    });
    lastPath = currentPath;
  }
};

setInterval(checkRouteChanges, 100); // Check every 100ms

// Test functions
window.testLogout = () => {
  console.log('🚪 Testing logout flow...');
  const logoutBtn = document.querySelector('.logout-btn, [onClick*="logout"]');
  if (logoutBtn) {
    console.log('Found logout button, clicking...');
    logoutBtn.click();
  } else {
    console.log('❌ Logout button not found');
  }
};

window.testLogin = () => {
  console.log('🔑 Testing login flow...');
  const loginBtn = document.querySelector('.google-signin-btn');
  if (loginBtn) {
    console.log('Found login button, clicking...');
    loginBtn.click();
  } else {
    console.log('❌ Login button not found');
  }
};

// Monitor for expected behaviors
window.addEventListener('beforeunload', () => {
  console.log('📊 Session Summary:', {
    authChanges,
    routeChanges,
    finalPath: window.location.pathname
  });
});

console.log('🧪 Test functions available:');
console.log('- testLogout(): Test logout flow');
console.log('- testLogin(): Test login flow');
console.log('Monitor will track auth and route changes automatically');

// Expected behavior summary
console.log('📋 Expected Behavior:');
console.log('1. Logout: User clicks logout → Auth state changes to null → Route changes to /login (NO RELOAD NEEDED)');
console.log('2. Login: User authenticates → Auth state changes to user → Route changes to / (NO RELOAD NEEDED)');
console.log('3. Direct access: Authenticated user visits /login → Route changes to / automatically');
console.log('4. Direct access: Unauthenticated user visits / → Route changes to /login automatically');